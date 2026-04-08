-- =============================================================================
-- Researcha — initial schema for Supabase (PostgreSQL + Auth + RLS)
-- Paste this entire file into: Supabase Dashboard → SQL Editor → New query → Run
-- Or: supabase db push (CLI) if you use local Supabase.
--
-- BEFORE RUNNING: Dashboard → Database → Extensions → enable:
--   - pgcrypto (often already on)
--   - vector  (for RAG embeddings; optional if you defer AI)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- -----------------------------------------------------------------------------
-- 2. Enumerations
-- -----------------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('user', 'editor', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.plan_tier as enum ('simple', 'premium', 'corporate');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.report_status as enum ('draft', 'review', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.entitlement_source as enum ('purchase', 'subscription', 'admin_grant', 'promo');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.blog_post_status as enum ('draft', 'scheduled', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.import_job_status as enum ('pending', 'processing', 'completed', 'failed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscription_status as enum ('active', 'past_due', 'canceled', 'trialing', 'incomplete');
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Core: organizations & profiles (profiles mirror auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  billing_email text,
  seat_limit int check (seat_limit is null or seat_limit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  locale text not null default 'en',
  avatar_url text,
  notification_email text,
  digest_frequency text not null default 'off'
    check (digest_frequency in ('off', 'daily', 'weekly')),
  app_role public.app_role not null default 'user',
  default_organization_id uuid references public.organizations (id) on delete set null,
  suspended_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_app_role_idx on public.profiles (app_role);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  member_role text not null default 'member'
    check (member_role in ('owner', 'admin', 'member', 'billing')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index if not exists organization_members_user_idx on public.organization_members (user_id);

-- -----------------------------------------------------------------------------
-- 4. Catalogue: sectors & reports (public metadata; PDF paths in report_assets)
-- -----------------------------------------------------------------------------
create table if not exists public.sectors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sector_id uuid references public.sectors (id) on delete set null,
  title text not null,
  summary text,
  status public.report_status not null default 'draft',
  preview_pct int not null default 10 check (preview_pct >= 0 and preview_pct <= 100),
  price_cents int not null default 0 check (price_cents >= 0),
  currency text not null default 'DZD',
  published_at timestamptz,
  view_count bigint not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector(
      'simple',
      coalesce(title, '') || ' ' || coalesce(summary, '')
    )
  ) stored
);

create index if not exists reports_sector_idx on public.reports (sector_id);
create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_search_idx on public.reports using gin (search_vector);

-- Split storage keys from public catalogue row (RLS differs per asset type)
create table if not exists public.report_assets (
  report_id uuid not null references public.reports (id) on delete cascade,
  asset_type text not null check (asset_type in ('preview_pdf', 'full_pdf')),
  storage_path text not null,
  content_type text default 'application/pdf',
  bytes bigint,
  created_at timestamptz not null default now(),
  primary key (report_id, asset_type)
);

-- -----------------------------------------------------------------------------
-- 5. Commerce: subscriptions, purchases, invoices, payment webhook log
-- -----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  plan_tier public.plan_tier not null,
  status public.subscription_status not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  report_quota int,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (user_id is not null and organization_id is null)
    or (user_id is null and organization_id is not null)
  )
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);
create index if not exists subscriptions_org_idx on public.subscriptions (organization_id);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  report_id uuid references public.reports (id) on delete set null,
  amount_cents int not null check (amount_cents >= 0),
  currency text not null default 'DZD',
  provider text not null default 'stripe',
  provider_payment_id text,
  status text not null default 'pending',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_idx on public.purchases (user_id);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  amount_cents int not null,
  currency text not null default 'DZD',
  pdf_url text,
  stripe_invoice_id text,
  created_at timestamptz not null default now(),
  check (user_id is not null or organization_id is not null)
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create unique index if not exists payment_events_provider_event_uidx
  on public.payment_events (provider, event_id)
  where event_id is not null;

-- -----------------------------------------------------------------------------
-- 6. Entitlements & access
-- -----------------------------------------------------------------------------
create table if not exists public.user_report_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  report_id uuid not null references public.reports (id) on delete cascade,
  source public.entitlement_source not null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  notes text,
  unique (user_id, report_id)
);

create index if not exists entitlements_report_idx on public.user_report_entitlements (report_id);

-- -----------------------------------------------------------------------------
-- 7. Subscriber features: watchlist, search history, usage events (stats + GDPR)
-- -----------------------------------------------------------------------------
create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  sector_id uuid references public.sectors (id) on delete cascade,
  report_id uuid references public.reports (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (sector_id is not null or report_id is not null)
);

create index if not exists watchlist_user_idx on public.watchlist_items (user_id);

create table if not exists public.user_search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  query text not null,
  filters jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists user_search_history_user_created_idx
  on public.user_search_history (user_id, created_at desc);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_type text not null,
  report_id uuid references public.reports (id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_created_idx
  on public.usage_events (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 8. Blog (admin-managed marketing content)
-- -----------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  status public.blog_post_status not null default 'draft',
  author_id uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  seo jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_idx on public.blog_posts (status);

-- -----------------------------------------------------------------------------
-- 9. Promotions & import jobs
-- -----------------------------------------------------------------------------
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  percent_off numeric(5,2) check (percent_off is null or (percent_off > 0 and percent_off <= 100)),
  amount_off_cents int check (amount_off_cents is null or amount_off_cents >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions int,
  redemptions_count int not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  status public.import_job_status not null default 'pending',
  manifest jsonb not null default '{}',
  error_log text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 10. Admin audit (append-only for humans; protect with RLS + no UPDATE policies)
-- -----------------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  diff jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);

-- -----------------------------------------------------------------------------
-- 11. AI (conversations; RAG chunks — embeddings optional dimension)
-- -----------------------------------------------------------------------------
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_messages_conversation_idx on public.ai_messages (conversation_id, created_at);

-- Vector size 1536 = OpenAI text-embedding-3-small / ada-002 class; change if your model differs
create table if not exists public.report_chunks (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  chunk_index int not null,
  content text not null,
  token_count int,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  unique (report_id, chunk_index)
);

create index if not exists report_chunks_report_idx on public.report_chunks (report_id);

-- Optional later (after data): ivfflat index for similarity search
-- create index report_chunks_embedding_idx on public.report_chunks
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- -----------------------------------------------------------------------------
-- 12. Platform settings (feature flags, webhooks config — admin only)
-- -----------------------------------------------------------------------------
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 13. Triggers: new auth user → profile; updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, locale)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'locale', 'en')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at triggers
do $t$
declare
  r record;
begin
  for r in
    select unnest(array[
      'organizations',
      'profiles',
      'sectors',
      'reports',
      'subscriptions',
      'import_jobs',
      'blog_posts',
      'ai_conversations'
    ]) as tbl
  loop
    execute format('
      drop trigger if exists trg_%I_updated_at on public.%I;
      create trigger trg_%I_updated_at
        before update on public.%I
        for each row execute function public.set_updated_at();
    ', r.tbl, r.tbl, r.tbl, r.tbl);
  end loop;
end;
$t$;

-- -----------------------------------------------------------------------------
-- 14. Helper functions for RLS (SECURITY DEFINER — run as migration owner)
-- -----------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.app_role in ('admin', 'editor') from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.app_role = 'admin' from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create or replace function public.has_report_entitlement(p_report_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_report_entitlements e
    where e.user_id = auth.uid()
      and e.report_id = p_report_id
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

grant execute on function public.is_staff() to authenticated, anon;
grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.has_report_entitlement(uuid) to authenticated, anon;

-- -----------------------------------------------------------------------------
-- 15. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.sectors enable row level security;
alter table public.reports enable row level security;
alter table public.report_assets enable row level security;
alter table public.subscriptions enable row level security;
alter table public.purchases enable row level security;
alter table public.invoices enable row level security;
alter table public.payment_events enable row level security;
alter table public.user_report_entitlements enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.user_search_history enable row level security;
alter table public.usage_events enable row level security;
alter table public.blog_posts enable row level security;
alter table public.promotions enable row level security;
alter table public.import_jobs enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.report_chunks enable row level security;
alter table public.platform_settings enable row level security;

-- --- profiles ---
drop policy if exists "profiles_select_own_or_staff" on public.profiles;
create policy "profiles_select_own_or_staff"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

-- --- organizations ---
drop policy if exists "orgs_select_member_or_staff" on public.organizations;
create policy "orgs_select_member_or_staff"
  on public.organizations for select
  using (
    public.is_staff()
    or exists (
      select 1 from public.organization_members m
      where m.organization_id = organizations.id and m.user_id = auth.uid()
    )
  );

drop policy if exists "orgs_staff_write" on public.organizations;
create policy "orgs_staff_write"
  on public.organizations for all
  using (public.is_staff())
  with check (public.is_staff());

-- --- organization_members ---
drop policy if exists "org_members_select" on public.organization_members;
create policy "org_members_select"
  on public.organization_members for select
  using (
    public.is_staff()
    or user_id = auth.uid()
    or exists (
      select 1 from public.organization_members m
      where m.organization_id = organization_members.organization_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "org_members_staff_write" on public.organization_members;
create policy "org_members_staff_write"
  on public.organization_members for all
  using (public.is_staff())
  with check (public.is_staff());

-- --- sectors (public read published; staff full) ---
drop policy if exists "sectors_public_read" on public.sectors;
create policy "sectors_public_read"
  on public.sectors for select
  using (is_published = true);

drop policy if exists "sectors_staff_all" on public.sectors;
create policy "sectors_staff_all"
  on public.sectors for all
  using (public.is_staff())
  with check (public.is_staff());

-- --- reports (catalogue: public sees published rows only) ---
drop policy if exists "reports_public_read_published" on public.reports;
create policy "reports_public_read_published"
  on public.reports for select
  using (status = 'published');

drop policy if exists "reports_staff_all" on public.reports;
create policy "reports_staff_all"
  on public.reports for all
  using (public.is_staff())
  with check (public.is_staff());

-- --- report_assets (preview public for published; full PDF if entitled or staff) ---
drop policy if exists "report_assets_preview_public" on public.report_assets;
create policy "report_assets_preview_public"
  on public.report_assets for select
  using (
    asset_type = 'preview_pdf'
    and exists (
      select 1 from public.reports r
      where r.id = report_assets.report_id and r.status = 'published'
    )
  );

drop policy if exists "report_assets_full_entitled" on public.report_assets;
create policy "report_assets_full_entitled"
  on public.report_assets for select
  using (
    asset_type = 'full_pdf'
    and public.has_report_entitlement(report_id)
  );

drop policy if exists "report_assets_staff_all" on public.report_assets;
create policy "report_assets_staff_all"
  on public.report_assets for all
  using (public.is_staff())
  with check (public.is_staff());

-- --- subscriptions ---
drop policy if exists "subscriptions_select_scope" on public.subscriptions;
create policy "subscriptions_select_scope"
  on public.subscriptions for select
  using (
    public.is_staff()
    or user_id = auth.uid()
    or exists (
      select 1 from public.organization_members m
      where m.organization_id = subscriptions.organization_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "subscriptions_staff_write" on public.subscriptions;
create policy "subscriptions_staff_write"
  on public.subscriptions for all
  using (public.is_staff())
  with check (public.is_staff());

-- --- purchases & invoices ---
drop policy if exists "purchases_own" on public.purchases;
create policy "purchases_own"
  on public.purchases for select
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists "purchases_staff_insert" on public.purchases;
create policy "purchases_staff_insert"
  on public.purchases for insert
  with check (public.is_staff());

-- allow webhook edge function (service role) — typically bypasses RLS; app may use RPC
drop policy if exists "purchases_user_insert" on public.purchases;
create policy "purchases_user_insert"
  on public.purchases for insert
  with check (user_id = auth.uid());

drop policy if exists "invoices_select" on public.invoices;
create policy "invoices_select"
  on public.invoices for select
  using (
    public.is_staff()
    or user_id = auth.uid()
    or (
      organization_id is not null
      and exists (
        select 1 from public.organization_members m
        where m.organization_id = invoices.organization_id
          and m.user_id = auth.uid()
      )
    )
  );

drop policy if exists "invoices_staff_write" on public.invoices;
create policy "invoices_staff_write"
  on public.invoices for all
  using (public.is_staff())
  with check (public.is_staff());

-- --- payment_events: no client access (service_role bypasses RLS) ---
-- RLS on with zero policies ⇒ deny for anon/authenticated

-- --- entitlements ---
drop policy if exists "entitlements_select_own" on public.user_report_entitlements;
create policy "entitlements_select_own"
  on public.user_report_entitlements for select
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists "entitlements_staff_write" on public.user_report_entitlements;
create policy "entitlements_staff_write"
  on public.user_report_entitlements for all
  using (public.is_staff())
  with check (public.is_staff());

-- --- watchlist, search history, usage ---
drop policy if exists "watchlist_own" on public.watchlist_items;
create policy "watchlist_own"
  on public.watchlist_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "watchlist_staff" on public.watchlist_items;
create policy "watchlist_staff"
  on public.watchlist_items for select
  using (public.is_staff());

drop policy if exists "search_history_own" on public.user_search_history;
create policy "search_history_own"
  on public.user_search_history for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "usage_events_own_select" on public.usage_events;
create policy "usage_events_own_select"
  on public.usage_events for select
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists "usage_events_own_insert" on public.usage_events;
create policy "usage_events_own_insert"
  on public.usage_events for insert
  with check (user_id = auth.uid());

-- --- blog ---
drop policy if exists "blog_public_published" on public.blog_posts;
create policy "blog_public_published"
  on public.blog_posts for select
  using (status = 'published' and published_at is not null and published_at <= now());

drop policy if exists "blog_staff_all" on public.blog_posts;
create policy "blog_staff_all"
  on public.blog_posts for all
  using (public.is_staff())
  with check (public.is_staff());

-- --- promotions & import_jobs (staff only) ---
drop policy if exists "promotions_staff" on public.promotions;
create policy "promotions_staff"
  on public.promotions for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "import_jobs_staff" on public.import_jobs;
create policy "import_jobs_staff"
  on public.import_jobs for all
  using (public.is_staff())
  with check (public.is_staff());

-- --- audit log ---
drop policy if exists "audit_select_staff" on public.admin_audit_log;
create policy "audit_select_staff"
  on public.admin_audit_log for select
  using (public.is_staff());

drop policy if exists "audit_insert_staff" on public.admin_audit_log;
create policy "audit_insert_staff"
  on public.admin_audit_log for insert
  with check (public.is_staff() and actor_id = auth.uid());

-- --- AI ---
drop policy if exists "ai_conv_own" on public.ai_conversations;
create policy "ai_conv_own"
  on public.ai_conversations for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "ai_conv_staff" on public.ai_conversations;
create policy "ai_conv_staff"
  on public.ai_conversations for select
  using (public.is_staff());

drop policy if exists "ai_messages_select" on public.ai_messages;
create policy "ai_messages_select"
  on public.ai_messages for select
  using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id
        and (c.user_id = auth.uid() or public.is_staff())
    )
  );

drop policy if exists "ai_messages_insert_owner" on public.ai_messages;
create policy "ai_messages_insert_owner"
  on public.ai_messages for insert
  with check (
    exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "ai_messages_insert_staff" on public.ai_messages;
create policy "ai_messages_insert_staff"
  on public.ai_messages for insert
  with check (public.is_staff());

drop policy if exists "ai_messages_modify" on public.ai_messages;
create policy "ai_messages_modify"
  on public.ai_messages for update
  using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id
        and c.user_id = auth.uid()
    )
    or public.is_staff()
  )
  with check (
    exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id
        and c.user_id = auth.uid()
    )
    or public.is_staff()
  );

drop policy if exists "ai_messages_delete" on public.ai_messages;
create policy "ai_messages_delete"
  on public.ai_messages for delete
  using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id
        and c.user_id = auth.uid()
    )
    or public.is_admin()
  );

-- --- report_chunks: entitled users + staff (RAG retrieval must still filter in app) ---
drop policy if exists "report_chunks_entitled" on public.report_chunks;
create policy "report_chunks_entitled"
  on public.report_chunks for select
  using (public.has_report_entitlement(report_id));

drop policy if exists "report_chunks_staff" on public.report_chunks;
create policy "report_chunks_staff"
  on public.report_chunks for all
  using (public.is_staff())
  with check (public.is_staff());

-- --- platform_settings (admin only) ---
drop policy if exists "platform_settings_admin" on public.platform_settings;
create policy "platform_settings_admin"
  on public.platform_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- 16. Grants (API roles)
-- -----------------------------------------------------------------------------
grant usage on schema public to postgres, anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to postgres, service_role;
grant select on all tables in schema public to anon, authenticated;

-- Writes are enforced by RLS per table
grant insert, update, delete on all tables in schema public to authenticated;

-- Sequences / defaults
grant usage on all sequences in schema public to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 17. Optional seed: plan catalogue row in platform_settings (edit freely)
-- -----------------------------------------------------------------------------
insert into public.platform_settings (key, value)
values (
  'plan_catalog',
  '{
    "simple": { "report_quota": 5, "exports": false, "ai": "limited" },
    "premium": { "report_quota": 20, "exports": true, "ai": "full" },
    "corporate": { "report_quota": null, "exports": true, "ai": "full", "seats": true }
  }'::jsonb
)
on conflict (key) do nothing;

-- =============================================================================
-- Done. Next steps:
-- 1) SQL: update your user to admin — see context/SUPABASE_SETUP.md
-- 2) Edge Functions / webhooks: use service_role server-side only
-- =============================================================================

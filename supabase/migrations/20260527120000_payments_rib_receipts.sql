-- -----------------------------------------------------------------------------
-- Manual bank-transfer (RIB) payment flow: sector monthly price, payment_requests
-- queue, receipt storage, public bank RIB setting, sector-aware entitlements.
-- -----------------------------------------------------------------------------

-- 1. Sector monthly subscription price (DZD by default)
alter table public.sectors add column if not exists subscription_price_cents int not null default 0;
alter table public.sectors add column if not exists currency text not null default 'DZD';
alter table public.sectors add constraint sectors_price_nonneg check (subscription_price_cents >= 0) not valid;

comment on column public.sectors.subscription_price_cents is 'Monthly subscription price in minor currency units (e.g. centimes for DZD).';

-- 2. Allow entitlements to grant access by sector (subscription) OR by report (one-off)
alter table public.user_report_entitlements alter column report_id drop not null;
alter table public.user_report_entitlements add column if not exists sector_id uuid references public.sectors(id) on delete cascade;
alter table public.user_report_entitlements drop constraint if exists user_report_entitlements_report_id_user_id_key;
alter table public.user_report_entitlements drop constraint if exists user_report_entitlements_user_id_report_id_key;
alter table public.user_report_entitlements add constraint entitlements_target_check check (report_id is not null or sector_id is not null) not valid;

create unique index if not exists entitlements_user_report_uniq
    on public.user_report_entitlements (user_id, report_id) where report_id is not null;
create unique index if not exists entitlements_user_sector_uniq
    on public.user_report_entitlements (user_id, sector_id) where sector_id is not null;
create index if not exists entitlements_sector_idx on public.user_report_entitlements (sector_id);

-- 3. Updated `has_report_entitlement`: report grant OR sector subscription
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
      and (e.expires_at is null or e.expires_at > now())
      and (
        e.report_id = p_report_id
        or (
          e.sector_id is not null
          and e.sector_id = (select r.sector_id from public.reports r where r.id = p_report_id)
        )
      )
  );
$$;

grant execute on function public.has_report_entitlement(uuid) to authenticated, anon;

-- 4. Payment requests queue (one row per receipt the client uploads)
create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('report','sector_subscription')),
  report_id uuid references public.reports(id) on delete set null,
  sector_id uuid references public.sectors(id) on delete set null,
  amount_cents int not null check (amount_cents >= 0),
  currency text not null default 'DZD',
  receipt_storage_path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (kind = 'report' and report_id is not null and sector_id is null)
    or (kind = 'sector_subscription' and sector_id is not null and report_id is null)
  )
);

create index if not exists payment_requests_user_idx on public.payment_requests (user_id);
create index if not exists payment_requests_status_idx on public.payment_requests (status);

-- updated_at trigger (mirrors the loop in the initial migration)
drop trigger if exists trg_payment_requests_updated_at on public.payment_requests;
create trigger trg_payment_requests_updated_at
  before update on public.payment_requests
  for each row execute function public.set_updated_at();

alter table public.payment_requests enable row level security;

drop policy if exists "payment_requests_select_own_or_staff" on public.payment_requests;
create policy "payment_requests_select_own_or_staff"
  on public.payment_requests for select
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists "payment_requests_insert_own" on public.payment_requests;
create policy "payment_requests_insert_own"
  on public.payment_requests for insert
  with check (user_id = auth.uid() and status = 'pending');

drop policy if exists "payment_requests_staff_update" on public.payment_requests;
create policy "payment_requests_staff_update"
  on public.payment_requests for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "payment_requests_staff_delete" on public.payment_requests;
create policy "payment_requests_staff_delete"
  on public.payment_requests for delete
  using (public.is_staff());

-- 5. Public bank RIB setting (readable by anyone on the checkout page;
-- writable by admin via the existing admin-only `platform_settings_admin` policy)
drop policy if exists "platform_settings_public_read" on public.platform_settings;
create policy "platform_settings_public_read"
  on public.platform_settings for select
  to anon, authenticated
  using (key in ('bank_rib'));

insert into public.platform_settings (key, value)
values (
  'bank_rib',
  '{
    "bank_name": "",
    "account_holder": "",
    "rib": "",
    "iban": "",
    "swift": "",
    "notes": ""
  }'::jsonb
)
on conflict (key) do nothing;

-- 6. Storage bucket for payment receipts (private; owner upload + staff manage)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-receipts',
  'payment-receipts',
  false,
  10485760, -- 10 MB
  array['image/jpeg','image/png','image/webp','image/gif','application/pdf']::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  public = excluded.public;

drop policy if exists "payment_receipts_owner_insert" on storage.objects;
create policy "payment_receipts_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'payment-receipts'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "payment_receipts_owner_read" on storage.objects;
create policy "payment_receipts_owner_read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'payment-receipts'
    and (
      split_part(name, '/', 1) = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.app_role in ('admin','editor')
      )
    )
  );

drop policy if exists "payment_receipts_staff_update" on storage.objects;
create policy "payment_receipts_staff_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'payment-receipts'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin','editor')
    )
  )
  with check (
    bucket_id = 'payment-receipts'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin','editor')
    )
  );

drop policy if exists "payment_receipts_staff_delete" on storage.objects;
create policy "payment_receipts_staff_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'payment-receipts'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin','editor')
    )
  );

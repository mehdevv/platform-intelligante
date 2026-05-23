-- Corporate services contact form (homepage) → staff inbox on admin overview.

create table if not exists public.corporate_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  body text not null,
  status text not null default 'new' check (status in ('new', 'read')),
  read_at timestamptz,
  read_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists corporate_messages_created_idx on public.corporate_messages (created_at desc);
create index if not exists corporate_messages_status_idx on public.corporate_messages (status) where status = 'new';

alter table public.corporate_messages enable row level security;

drop policy if exists "corporate_messages_insert_public" on public.corporate_messages;
create policy "corporate_messages_insert_public"
  on public.corporate_messages for insert
  to anon, authenticated
  with check (
    char_length(trim(name)) >= 1
    and char_length(trim(email)) >= 3
    and char_length(trim(subject)) >= 1
    and char_length(trim(body)) >= 1
    and status = 'new'
  );

drop policy if exists "corporate_messages_select_staff" on public.corporate_messages;
create policy "corporate_messages_select_staff"
  on public.corporate_messages for select
  to authenticated
  using (public.is_staff());

drop policy if exists "corporate_messages_update_staff" on public.corporate_messages;
create policy "corporate_messages_update_staff"
  on public.corporate_messages for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

comment on table public.corporate_messages is
  'Inbound corporate / B2B contact requests from the public homepage form.';

-- In-app notifications for payment requests + helper for staff/user alerts.

create table if not exists public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null default 'payment' check (category in ('payment', 'system')),
  title text not null,
  body text not null,
  href text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists in_app_notifications_user_unread_idx
  on public.in_app_notifications (user_id, created_at desc)
  where read_at is null;

create index if not exists in_app_notifications_user_created_idx
  on public.in_app_notifications (user_id, created_at desc);

alter table public.in_app_notifications enable row level security;

drop policy if exists "in_app_notifications_select_own" on public.in_app_notifications;
create policy "in_app_notifications_select_own"
  on public.in_app_notifications for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "in_app_notifications_update_own" on public.in_app_notifications;
create policy "in_app_notifications_update_own"
  on public.in_app_notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Inserts only via security definer triggers / RPCs below.

create or replace function public.payment_request_item_label(p_kind text, p_report_id uuid, p_sector_id uuid)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when p_kind = 'report' then coalesce((select title from public.reports where id = p_report_id), 'Report')
    when p_kind = 'sector_subscription' then coalesce((select name from public.sectors where id = p_sector_id), 'Sector subscription')
    else p_kind
  end;
$$;

create or replace function public.trg_notify_staff_new_payment_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_label text;
  v_amount text;
begin
  v_label := public.payment_request_item_label(NEW.kind, NEW.report_id, NEW.sector_id);
  v_amount := trim(to_char(NEW.amount_cents / 100.0, '999999990.99')) || ' ' || coalesce(NEW.currency, 'DZD');

  insert into public.in_app_notifications (user_id, category, title, body, href, entity_type, entity_id)
  select
    p.id,
    'payment',
    'Nouvelle demande de paiement',
    'Un client a envoyé un reçu pour « ' || v_label || ' » (' || v_amount || '). À traiter dans la file des paiements.',
    '/admin/payments',
    'payment_request',
    NEW.id
  from public.profiles p
  where p.app_role in ('admin', 'editor');

  return NEW;
end;
$$;

create or replace function public.trg_notify_user_payment_reviewed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_label text;
  v_title text;
  v_body text;
begin
  if OLD.status is distinct from 'pending' or NEW.status not in ('approved', 'rejected') then
    return NEW;
  end if;

  v_label := public.payment_request_item_label(NEW.kind, NEW.report_id, NEW.sector_id);

  if NEW.status = 'approved' then
    v_title := 'Paiement approuvé';
    v_body := 'Votre paiement pour « ' || v_label || ' » a été approuvé. Vous avez maintenant accès — consultez votre bibliothèque.';
  else
    v_title := 'Paiement refusé';
    v_body := 'Votre paiement pour « ' || v_label || ' » n''a pas été approuvé.';
    if NEW.admin_note is not null and length(trim(NEW.admin_note)) > 0 then
      v_body := v_body || ' Note: ' || NEW.admin_note;
    end if;
  end if;

  insert into public.in_app_notifications (user_id, category, title, body, href, entity_type, entity_id)
  values (
    NEW.user_id,
    'payment',
    v_title,
    v_body,
    '/dashboard/payments',
    'payment_request',
    NEW.id
  );

  return NEW;
end;
$$;

drop trigger if exists trg_payment_requests_notify_staff on public.payment_requests;
create trigger trg_payment_requests_notify_staff
  after insert on public.payment_requests
  for each row
  execute function public.trg_notify_staff_new_payment_request();

drop trigger if exists trg_payment_requests_notify_user on public.payment_requests;
create trigger trg_payment_requests_notify_user
  after update of status on public.payment_requests
  for each row
  execute function public.trg_notify_user_payment_reviewed();

comment on table public.in_app_notifications is
  'Per-user inbox (admins + clients). Payment triggers populate rows; emails sent via payment-notify edge function.';

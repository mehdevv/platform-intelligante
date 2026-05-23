-- One payment_request row for multi-sector checkout (sector_bundle).

alter table public.payment_requests
  add column if not exists bundle_sector_ids uuid[];

alter table public.payment_requests drop constraint if exists payment_requests_kind_check;
alter table public.payment_requests drop constraint if exists payment_requests_check;

alter table public.payment_requests
  add constraint payment_requests_check check (
    kind in ('report', 'sector_subscription', 'sector_bundle')
    and (
    (kind = 'report' and report_id is not null and sector_id is null and bundle_sector_ids is null)
    or (
      kind = 'sector_subscription'
      and sector_id is not null
      and report_id is null
      and bundle_sector_ids is null
    )
    or (
      kind = 'sector_bundle'
      and report_id is null
      and sector_id is null
      and bundle_sector_ids is not null
      and cardinality(bundle_sector_ids) >= 1
    )
    )
  );

comment on column public.payment_requests.bundle_sector_ids is
  'For kind=sector_bundle: all sector UUIDs included in one combined payment.';

create or replace function public.payment_request_item_label(
  p_kind text,
  p_report_id uuid,
  p_sector_id uuid,
  p_bundle_sector_ids uuid[] default null
)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when p_kind = 'report' then coalesce((select title from public.reports where id = p_report_id), 'Report')
    when p_kind = 'sector_subscription' then coalesce((select name from public.sectors where id = p_sector_id), 'Sector subscription')
    when p_kind = 'sector_bundle' then
      'Sector bundle (' || coalesce(cardinality(p_bundle_sector_ids), 0)::text || ' sectors)'
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
  v_label := public.payment_request_item_label(NEW.kind, NEW.report_id, NEW.sector_id, NEW.bundle_sector_ids);
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
  v_amount text;
  v_title text;
  v_body text;
begin
  if OLD.status is not distinct from NEW.status then
    return NEW;
  end if;
  if NEW.status not in ('approved', 'rejected') then
    return NEW;
  end if;

  v_label := public.payment_request_item_label(NEW.kind, NEW.report_id, NEW.sector_id, NEW.bundle_sector_ids);
  v_amount := trim(to_char(NEW.amount_cents / 100.0, '999999990.99')) || ' ' || coalesce(NEW.currency, 'DZD');

  if NEW.status = 'approved' then
    v_title := 'Paiement validé';
    v_body := 'Votre paiement pour « ' || v_label || ' » (' || v_amount || ') a été validé.';
  else
    v_title := 'Paiement refusé';
    v_body := 'Votre paiement pour « ' || v_label || ' » (' || v_amount || ') n''a pas pu être validé.';
    if NEW.admin_note is not null and trim(NEW.admin_note) <> '' then
      v_body := v_body || ' Note : ' || NEW.admin_note;
    end if;
  end if;

  insert into public.in_app_notifications (user_id, category, title, body, href, entity_type, entity_id)
  values (NEW.user_id, 'payment', v_title, v_body, '/profile', 'payment_request', NEW.id);

  return NEW;
end;
$$;

-- -----------------------------------------------------------------------------
-- Subscriber self-service: cancel platform/sector access, delete own account
-- -----------------------------------------------------------------------------

create or replace function public.cancel_my_platform_subscription()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  update public.subscriptions
  set
    status = 'canceled',
    updated_at = now(),
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('canceled_by_user_at', now())
  where user_id = uid
    and status in ('active', 'trialing', 'past_due');
end;
$$;

create or replace function public.cancel_my_sector_access(p_entitlement_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_entitlement_id is null then
    raise exception 'Entitlement id required';
  end if;
  update public.user_report_entitlements
  set
    expires_at = now(),
    notes = trim(both from coalesce(notes, '') || ' · Canceled by account holder ' || to_char(now(), 'YYYY-MM-DD'))
  where id = p_entitlement_id
    and user_id = uid
    and sector_id is not null
    and (expires_at is null or expires_at > now());
  if not found then
    raise exception 'Active sector subscription not found';
  end if;
end;
$$;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.cancel_my_platform_subscription() from public;
revoke all on function public.cancel_my_sector_access(uuid) from public;
revoke all on function public.delete_own_account() from public;

grant execute on function public.cancel_my_platform_subscription() to authenticated;
grant execute on function public.cancel_my_sector_access(uuid) to authenticated;
grant execute on function public.delete_own_account() to authenticated;

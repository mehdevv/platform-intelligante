-- Allow authenticated clients to resolve staff emails for payment notification emails (EmailJS from browser).
-- Returns only email + locale for admin/editor profiles.

create or replace function public.list_payment_notify_staff()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'email',
        coalesce(nullif(trim(p.notification_email), ''), au.email::text),
        'locale',
        coalesce(nullif(trim(p.locale), ''), 'en')
      )
    ),
    '[]'::jsonb
  )
  into result
  from public.profiles p
  join auth.users au on au.id = p.id
  where p.app_role in ('admin', 'editor')
    and coalesce(nullif(trim(p.notification_email), ''), au.email::text) is not null;

  return result;
end;
$$;

revoke all on function public.list_payment_notify_staff() from public;
grant execute on function public.list_payment_notify_staff() to authenticated;

-- Resolve notify email for a user (self or staff reading client on payment review).
create or replace function public.get_payment_notify_email(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_locale text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if auth.uid() <> p_user_id and not public.is_staff() then
    raise exception 'forbidden';
  end if;

  select
    coalesce(nullif(trim(p.notification_email), ''), au.email::text),
    coalesce(nullif(trim(p.locale), ''), 'en')
  into v_email, v_locale
  from public.profiles p
  join auth.users au on au.id = p.id
  where p.id = p_user_id;

  if v_email is null then
    return null;
  end if;

  return jsonb_build_object('email', v_email, 'locale', v_locale);
end;
$$;

revoke all on function public.get_payment_notify_email(uuid) from public;
grant execute on function public.get_payment_notify_email(uuid) to authenticated;

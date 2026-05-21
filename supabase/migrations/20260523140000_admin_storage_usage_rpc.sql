-- Staff-only: total file bytes across all Storage objects (for admin dashboard).
-- Plan quota is not exposed by Postgres; set VITE_SUPABASE_STORAGE_QUOTA_BYTES in the app.

create or replace function public.admin_storage_usage_bytes()
returns bigint
language plpgsql
stable
security definer
set search_path = storage, public
as $$
declare
  total bigint;
begin
  if not public.is_staff() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select coalesce(
    sum(
      greatest(
        0,
        coalesce(nullif(o.metadata->>'size', '')::bigint, 0)
      )
    ),
    0
  )::bigint
  into total
  from storage.objects o;

  return coalesce(total, 0);
end;
$$;

revoke all on function public.admin_storage_usage_bytes() from public;
grant execute on function public.admin_storage_usage_bytes() to authenticated;

comment on function public.admin_storage_usage_bytes() is
  'Returns sum of storage.objects metadata size (bytes) for admin UI; staff only.';

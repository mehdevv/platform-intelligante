-- -----------------------------------------------------------------------------
-- Fix RLS infinite recursion: policies on organization_members and other tables
-- used EXISTS (SELECT ... FROM organization_members ...) which re-entered the
-- same table's SELECT policy → Postgres error → PostgREST 500 on subscriptions, etc.
-- -----------------------------------------------------------------------------

create or replace function public.user_is_org_member(p_organization_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = p_user_id
  );
$$;

grant execute on function public.user_is_org_member(uuid, uuid) to authenticated, anon, service_role;

-- organizations
drop policy if exists "orgs_select_member_or_staff" on public.organizations;
create policy "orgs_select_member_or_staff"
  on public.organizations for select
  using (
    public.is_staff()
    or public.user_is_org_member(organizations.id, auth.uid())
  );

-- organization_members
drop policy if exists "org_members_select" on public.organization_members;
create policy "org_members_select"
  on public.organization_members for select
  using (
    public.is_staff()
    or user_id = auth.uid()
    or public.user_is_org_member(organization_members.organization_id, auth.uid())
  );

-- subscriptions
drop policy if exists "subscriptions_select_scope" on public.subscriptions;
create policy "subscriptions_select_scope"
  on public.subscriptions for select
  using (
    public.is_staff()
    or user_id = auth.uid()
    or (
      organization_id is not null
      and public.user_is_org_member(subscriptions.organization_id, auth.uid())
    )
  );

-- invoices
drop policy if exists "invoices_select" on public.invoices;
create policy "invoices_select"
  on public.invoices for select
  using (
    public.is_staff()
    or user_id = auth.uid()
    or (
      organization_id is not null
      and public.user_is_org_member(invoices.organization_id, auth.uid())
    )
  );

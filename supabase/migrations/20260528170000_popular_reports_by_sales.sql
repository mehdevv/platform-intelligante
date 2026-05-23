-- Public catalogue: top published reports by sales (purchases + approved report payments).

create or replace function public.popular_reports_by_sales(p_limit int default 12)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with sales as (
    select report_id, count(*)::bigint as sales_count
    from (
      select report_id
      from public.purchases
      where report_id is not null
      union all
      select report_id
      from public.payment_requests
      where kind = 'report'
        and status = 'approved'
        and report_id is not null
    ) sold
    group by report_id
  ),
  ranked as (
    select
      r.id,
      r.slug,
      r.title,
      coalesce(s.sales_count, 0) as sales_count
    from public.reports r
    left join sales s on s.report_id = r.id
    where r.status = 'published'
    order by coalesce(s.sales_count, 0) desc, r.view_count desc, r.published_at desc nulls last
    limit greatest(1, least(coalesce(p_limit, 12), 24))
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'slug', slug,
        'title', title,
        'sales_count', sales_count
      )
    ),
    '[]'::jsonb
  )
  from ranked;
$$;

revoke all on function public.popular_reports_by_sales(int) from public;
grant execute on function public.popular_reports_by_sales(int) to anon, authenticated;

comment on function public.popular_reports_by_sales(int) is
  'Returns top published reports by purchase count (purchases + approved report payment_requests).';

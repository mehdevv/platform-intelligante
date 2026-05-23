-- Admin storage inventory: classify files, flag orphans / rejected receipts, allow cleanup.

create or replace function public.admin_storage_inventory()
returns jsonb
language plpgsql
stable
security definer
set search_path = storage, public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select coalesce(
    jsonb_agg(row_data order by (row_data->>'bytes')::bigint desc),
    '[]'::jsonb
  )
  into result
  from (
    select jsonb_build_object(
      'bucket', row.bucket,
      'path', row.path,
      'bytes', row.bytes,
      'created_at', row.created_at,
      'mime_type', row.mime_type,
      'file_category', row.file_category,
      'tied_type', row.tied_type,
      'tied_label', row.tied_label,
      'tied_entity_id', row.tied_entity_id,
      'needed', row.needed,
      'reason', row.reason
    ) as row_data
    from (
      select
        base.bucket,
        base.path,
        base.bytes,
        base.created_at,
        base.mime_type,
        base.file_category,
        base.tied_type,
        base.tied_label,
        base.tied_entity_id,
        case
          when base.bucket = 'report-pdfs' and base.report_id is null then false
          when base.bucket = 'report-pdfs' and base.report_status = 'archived' then false
          when base.bucket = 'payment-receipts' and base.payment_id is null then false
          when base.bucket = 'payment-receipts' and base.payment_status = 'rejected' then false
          when base.bucket = 'blog-sources' and base.blog_id is null then false
          else true
        end as needed,
        case
          when base.bucket = 'report-pdfs' and base.report_id is null then 'orphan_report_pdf'
          when base.bucket = 'report-pdfs' and base.report_status = 'archived' then 'archived_report_pdf'
          when base.bucket = 'payment-receipts' and base.payment_id is null then 'orphan_receipt'
          when base.bucket = 'payment-receipts' and base.payment_status = 'rejected' then 'rejected_receipt'
          when base.bucket = 'blog-sources' and base.blog_id is null then 'orphan_blog_source'
          else null
        end as reason
      from (
        select
          o.bucket_id as bucket,
          o.name as path,
          greatest(0, coalesce(nullif(o.metadata->>'size', '')::bigint, 0)) as bytes,
          o.created_at,
          coalesce(o.metadata->>'mimetype', '') as mime_type,
          case o.bucket_id
            when 'report-pdfs' then 'pdf'
            when 'payment-receipts' then
              case
                when coalesce(o.metadata->>'mimetype', '') like 'image/%' then 'image'
                when coalesce(o.metadata->>'mimetype', '') = 'application/pdf' then 'pdf'
                else 'receipt'
              end
            when 'blog-sources' then
              case
                when coalesce(o.metadata->>'mimetype', '') like 'image/%' then 'image'
                when coalesce(o.metadata->>'mimetype', '') = 'application/pdf' then 'pdf'
                else 'document'
              end
            else 'document'
          end as file_category,
          case o.bucket_id
            when 'report-pdfs' then 'report'
            when 'payment-receipts' then 'payment'
            when 'blog-sources' then 'blog'
            else 'none'
          end as tied_type,
          coalesce(
            case o.bucket_id
              when 'report-pdfs' then
                case
                  when rep.report_id is not null then coalesce(rep.report_title, 'Report') || ' (' || coalesce(rep.report_status::text, '?') || ')'
                  else 'No linked report'
                end
              when 'payment-receipts' then
                case
                  when pr.id is not null then 'Payment ' || pr.status || ' — ' || coalesce(pr_profile.full_name, pr.user_id::text)
                  else 'No payment record'
                end
              when 'blog-sources' then
                case
                  when blog.blog_id is not null then coalesce(blog.blog_title, 'Blog post')
                  else 'No blog post link'
                end
              else o.name
            end,
            o.name
          ) as tied_label,
          case o.bucket_id
            when 'report-pdfs' then rep.report_id::text
            when 'payment-receipts' then pr.id::text
            when 'blog-sources' then blog.blog_id::text
            else null
          end as tied_entity_id,
          rep.report_id,
          rep.report_status,
          pr.id as payment_id,
          pr.status as payment_status,
          blog.blog_id,
          blog.blog_title
        from storage.objects o
        left join lateral (
          select
            ra.report_id,
            r.title as report_title,
            r.status as report_status
          from public.report_assets ra
          left join public.reports r on r.id = ra.report_id
          where ra.storage_path = o.name
          limit 1
        ) rep on o.bucket_id = 'report-pdfs'
        left join public.payment_requests pr
          on o.bucket_id = 'payment-receipts' and pr.receipt_storage_path = o.name
        left join public.profiles pr_profile on pr_profile.id = pr.user_id
        left join lateral (
          select
            bp.id as blog_id,
            bp.title as blog_title
          from public.blog_posts bp,
            lateral jsonb_array_elements(coalesce(bp.sources, '[]'::jsonb)) elem
          where elem->>'url' like '%' || o.name
          limit 1
        ) blog on o.bucket_id = 'blog-sources'
        where o.bucket_id in ('report-pdfs', 'payment-receipts', 'blog-sources')
      ) base
    ) row
  ) rows;

  return coalesce(result, '[]'::jsonb);
end;
$$;

create or replace function public.admin_delete_storage_file(p_bucket text, p_path text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = storage, public
as $$
declare
  inv jsonb;
  item jsonb;
  needed boolean;
  deleted_count int;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  if p_bucket is null or p_path is null or length(trim(p_path)) = 0 then
    raise exception 'bucket and path required' using errcode = '22023';
  end if;

  if p_bucket not in ('report-pdfs', 'payment-receipts', 'blog-sources') then
    raise exception 'unsupported bucket' using errcode = '22023';
  end if;

  inv := public.admin_storage_inventory();
  select elem
  into item
  from jsonb_array_elements(inv) elem
  where elem->>'bucket' = p_bucket and elem->>'path' = p_path
  limit 1;

  if item is null then
    raise exception 'file not found in inventory' using errcode = 'P0002';
  end if;

  needed := coalesce((item->>'needed')::boolean, true);
  if needed then
    raise exception 'cannot delete needed file; mark as not needed first or use force in a future version'
      using errcode = '42501';
  end if;

  delete from storage.objects
  where bucket_id = p_bucket and name = p_path;

  get diagnostics deleted_count = row_count;

  if p_bucket = 'report-pdfs' then
    delete from public.report_assets where storage_path = p_path;
  elsif p_bucket = 'payment-receipts' then
    delete from public.payment_requests
    where receipt_storage_path = p_path and status = 'rejected';
  elsif p_bucket = 'blog-sources' then
    update public.blog_posts bp
    set sources = coalesce(
      (
        select jsonb_agg(elem order by ord)
        from (
          select elem, row_number() over () as ord
          from jsonb_array_elements(coalesce(bp.sources, '[]'::jsonb)) elem
          where elem->>'url' not like '%' || p_path
        ) kept
      ),
      '[]'::jsonb
    )
    where exists (
      select 1
      from jsonb_array_elements(coalesce(bp.sources, '[]'::jsonb)) elem
      where elem->>'url' like '%' || p_path
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'bucket', p_bucket,
    'path', p_path,
    'storage_deleted', deleted_count > 0
  );
end;
$$;

revoke all on function public.admin_storage_inventory() from public;
revoke all on function public.admin_delete_storage_file(text, text) from public;
grant execute on function public.admin_storage_inventory() to authenticated;
grant execute on function public.admin_delete_storage_file(text, text) to authenticated;

comment on function public.admin_storage_inventory() is
  'Lists Supabase storage objects with size, category, linkage, and needed/not-needed flag (admin only).';

comment on function public.admin_delete_storage_file(text, text) is
  'Deletes a not-needed storage object and cleans related DB rows (admin only).';

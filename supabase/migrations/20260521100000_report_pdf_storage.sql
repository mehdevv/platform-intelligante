-- -----------------------------------------------------------------------------
-- Report PDFs — Storage bucket + RLS on storage.objects
-- Path convention: {report_id}/full.pdf (matches report_assets.storage_path)
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-pdfs',
  'report-pdfs',
  false,
  52428800, -- 50 MB
  array['application/pdf']::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Staff: full manage bucket
drop policy if exists "report_pdfs_staff_select" on storage.objects;
create policy "report_pdfs_staff_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'report-pdfs'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin', 'editor')
    )
  );

drop policy if exists "report_pdfs_staff_insert" on storage.objects;
create policy "report_pdfs_staff_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'report-pdfs'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin', 'editor')
    )
  );

drop policy if exists "report_pdfs_staff_update" on storage.objects;
create policy "report_pdfs_staff_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'report-pdfs'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin', 'editor')
    )
  )
  with check (
    bucket_id = 'report-pdfs'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin', 'editor')
    )
  );

drop policy if exists "report_pdfs_staff_delete" on storage.objects;
create policy "report_pdfs_staff_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'report-pdfs'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin', 'editor')
    )
  );

-- Anonymous + logged-in readers: preview PDF only, published report
drop policy if exists "report_pdfs_public_preview_read" on storage.objects;
create policy "report_pdfs_public_preview_read"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'report-pdfs'
    and exists (
      select 1
      from public.report_assets ra
      inner join public.reports r on r.id = ra.report_id
      where ra.storage_path = name
        and ra.asset_type = 'preview_pdf'
        and r.status = 'published'
    )
  );

-- Full PDF: staff or entitled subscriber
drop policy if exists "report_pdfs_full_read_entitled" on storage.objects;
create policy "report_pdfs_full_read_entitled"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'report-pdfs'
    and (
      exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.app_role in ('admin', 'editor')
      )
      or exists (
        select 1 from public.report_assets ra
        where ra.storage_path = name
          and ra.asset_type = 'full_pdf'
          and public.has_report_entitlement(ra.report_id)
      )
    )
  );

-- Blog: cover image URL + structured sources (links or uploaded file URLs)
-- Storage bucket for non-image attachments (PDF, docs) referenced from posts

alter table public.blog_posts add column if not exists cover_image_url text;
alter table public.blog_posts add column if not exists sources jsonb not null default '[]'::jsonb;

comment on column public.blog_posts.cover_image_url is 'Optional hero image (https URL, e.g. from imgBB).';
comment on column public.blog_posts.sources is 'JSON array of { "label": string, "url": string } for references and downloads.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-sources',
  'blog-sources',
  true,
  26214400,
  null
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "blog_sources_public_read" on storage.objects;
create policy "blog_sources_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog-sources');

drop policy if exists "blog_sources_staff_insert" on storage.objects;
create policy "blog_sources_staff_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'blog-sources'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin', 'editor')
    )
  );

drop policy if exists "blog_sources_staff_update" on storage.objects;
create policy "blog_sources_staff_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'blog-sources'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin', 'editor')
    )
  )
  with check (
    bucket_id = 'blog-sources'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin', 'editor')
    )
  );

drop policy if exists "blog_sources_staff_delete" on storage.objects;
create policy "blog_sources_staff_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'blog-sources'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role in ('admin', 'editor')
    )
  );

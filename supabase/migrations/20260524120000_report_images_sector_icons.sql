-- Report gallery images (external URLs, e.g. imgBB) + sector icon URL

alter table public.sectors
  add column if not exists icon_image_url text;

comment on column public.sectors.icon_image_url is 'Optional sector card icon (https URL from imgBB or other CDN).';

create table if not exists public.report_images (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists report_images_report_sort_idx
  on public.report_images (report_id, sort_order, created_at);

comment on table public.report_images is 'Gallery images for a report; URLs typically from imgBB.';

alter table public.report_images enable row level security;

drop policy if exists "report_images_public_read_published" on public.report_images;
create policy "report_images_public_read_published"
  on public.report_images for select
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_images.report_id
        and r.status = 'published'
    )
  );

drop policy if exists "report_images_staff_all" on public.report_images;
create policy "report_images_staff_all"
  on public.report_images for all
  using (public.is_staff())
  with check (public.is_staff());

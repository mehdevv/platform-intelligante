-- Optional catalogue card / listing thumbnail (URL; usually one of report_images)

alter table public.reports add column if not exists thumbnail_image_url text;

comment on column public.reports.thumbnail_image_url is 'Optional hero/listing image URL (often matches a gallery image on imgBB).';

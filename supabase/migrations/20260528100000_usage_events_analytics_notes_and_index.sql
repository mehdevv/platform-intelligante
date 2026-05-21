-- First-party product analytics (Supabase). Not GA4: GA4 uses VITE_GA_MEASUREMENT_ID in the
-- frontend and sends hits to Google; nothing here stores GA4 payloads.
-- This migration only documents the table and adds an index for time-bounded selects
-- (admin traffic chart, counts) that filter on created_at.

comment on table public.usage_events is
  'Client-recorded usage (e.g. report_open). Staff may SELECT all rows via RLS (is_staff). '
  'GA4 is configured separately (env); this table is not a GA4 mirror.';

comment on column public.usage_events.event_type is
  'Short event name from the app (e.g. report_open, search).';

comment on column public.usage_events.metadata is
  'Optional JSON payload for the event.';

-- Admin and aggregates query by created_at ranges (e.g. last 7/30 days).
-- Existing usage_events_user_created_idx supports per-user timelines; this supports global time scans.
create index if not exists usage_events_created_at_idx
  on public.usage_events (created_at desc);

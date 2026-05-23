-- =============================================================================
-- Researcha — full mock / demo data for Supabase
-- =============================================================================
-- HOW TO RUN
--   1. Apply all migrations first (supabase db push or SQL migrations in order).
--   2. Supabase Dashboard → SQL Editor → paste this file → Run.
--      (Uses your session role; service role bypasses RLS if you use it.)
--
-- SAFE TO RE-RUN
--   Upserts sectors by slug; deletes then re-inserts rows with slug prefix "mock-".
--
-- PRICES
--   price_cents = major DZD × 100  (e.g. 25,000 DZD → 2_500_000 centimes)
--
-- AUTH USERS
--   This file does NOT create auth.users. Sign up in the app, then optionally run
--   the block at the bottom (set YOUR_USER_ID) for entitlements / payments.
--
-- PDFs / RECEIPTS IN STORAGE
--   Not included here. Upload PDFs via Admin → New report; receipts via checkout.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Sectors
-- -----------------------------------------------------------------------------
insert into public.sectors (
  id,
  slug,
  name,
  description,
  sort_order,
  featured,
  is_published,
  subscription_price_cents,
  currency,
  icon_image_url
)
values
  (
    'a1000001-0001-4001-8001-000000000001',
    'finance',
    'Finance & banking',
    'Market outlooks, credit trends, and banking regulation across Algeria and MENA.',
    10,
    true,
    true,
    4_900_000,
    'DZD',
    null
  ),
  (
    'a1000001-0001-4001-8001-000000000002',
    'energy',
    'Energy & utilities',
    'Oil & gas, renewables, power grid, and utility pricing intelligence.',
    20,
    true,
    true,
    5_900_000,
    'DZD',
    null
  ),
  (
    'a1000001-0001-4001-8001-000000000003',
    'agriculture',
    'Agriculture & food',
    'Cereals, livestock, irrigation, and agri-food export channels.',
    30,
    false,
    true,
    3_900_000,
    'DZD',
    null
  ),
  (
    'a1000001-0001-4001-8001-000000000004',
    'retail',
    'Retail & consumer',
    'FMCG, e-commerce, and modern trade penetration by region.',
    40,
    false,
    true,
    3_500_000,
    'DZD',
    null
  ),
  (
    'a1000001-0001-4001-8001-000000000005',
    'healthcare',
    'Healthcare & pharma',
    'Hospitals, generics, medical devices, and public health spending.',
    50,
    false,
    true,
    4_500_000,
    'DZD',
    null
  ),
  (
    'a1000001-0001-4001-8001-000000000006',
    'technology',
    'Technology & telecom',
    'Mobile, fibre, fintech, and enterprise software adoption.',
    60,
    true,
    true,
    6_900_000,
    'DZD',
    null
  ),
  (
    'a1000001-0001-4001-8001-000000000007',
    'tourism',
    'Tourism & hospitality',
    'Inbound travel, hotels, and destination competitiveness.',
    70,
    false,
    true,
    2_900_000,
    'DZD',
    null
  ),
  (
    'a1000001-0001-4001-8001-000000000008',
    'construction',
    'Construction & real estate',
    'Housing starts, materials costs, and commercial real estate yields.',
    80,
    false,
    true,
    4_200_000,
    'DZD',
    null
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  featured = excluded.featured,
  is_published = excluded.is_published,
  subscription_price_cents = excluded.subscription_price_cents,
  currency = excluded.currency,
  icon_image_url = excluded.icon_image_url,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- 2. Reports (published catalogue; slug prefix mock-)
-- -----------------------------------------------------------------------------
delete from public.reports where slug like 'mock-%';

insert into public.reports (
  slug,
  sector_id,
  title,
  summary,
  status,
  preview_pct,
  price_cents,
  currency,
  published_at,
  thumbnail_image_url,
  view_count
)
values
  ('mock-finance-algeria-banking-2025', 'a1000001-0001-4001-8001-000000000001', 'Algeria banking sector overview 2025', 'Deposit growth, NPL ratios, and digital banking adoption among top banks.', 'published', 15, 0, 'DZD', '2025-03-01 10:00:00+00', 'https://picsum.photos/seed/mock-finance-1/640/360', 1240),
  ('mock-finance-sme-lending', 'a1000001-0001-4001-8001-000000000001', 'SME lending & microfinance trends', 'Credit guarantees, Islamic finance products, and regional disbursement data.', 'published', 10, 1_500_000, 'DZD', '2025-02-15 09:00:00+00', null, 890),
  ('mock-finance-payment-cards', 'a1000001-0001-4001-8001-000000000001', 'Card payments & POS penetration', 'Interchange fees, merchant acquirers, and cash vs digital mix by wilaya.', 'published', 10, 2_800_000, 'DZD', '2025-01-20 14:00:00+00', null, 456),
  ('mock-finance-insurance-premium', 'a1000001-0001-4001-8001-000000000001', 'Insurance market premium forecast', 'Life vs non-life split, bancassurance, and regulatory solvency updates.', 'published', 10, 4_500_000, 'DZD', '2024-12-01 11:00:00+00', null, 210),
  ('mock-energy-gas-production', 'a1000001-0001-4001-8001-000000000002', 'Natural gas production & export routes', 'Pipeline capacity, LNG spot exposure, and European offtake contracts.', 'published', 10, 0, 'DZD', '2025-04-10 08:00:00+00', 'https://picsum.photos/seed/mock-energy-1/640/360', 2100),
  ('mock-energy-solar-rooftop', 'a1000001-0001-4001-8001-000000000002', 'Distributed solar & rooftop PV', 'Net metering rules, installer landscape, and payback periods for SMEs.', 'published', 10, 2_200_000, 'DZD', '2025-03-22 16:00:00+00', null, 678),
  ('mock-energy-power-tariffs', 'a1000001-0001-4001-8001-000000000002', 'Electricity tariffs & industrial consumers', 'Subsidies, peak demand, and energy-intensive industry cost pass-through.', 'published', 10, 3_600_000, 'DZD', '2025-02-28 12:00:00+00', null, 334),
  ('mock-energy-hydrogen-pilot', 'a1000001-0001-4001-8001-000000000002', 'Green hydrogen pilot projects MENA', 'CAPEX benchmarks, offtake MOUs, and national hydrogen strategies.', 'published', 10, 6_500_000, 'DZD', '2025-01-05 10:00:00+00', null, 89),
  ('mock-agri-cereal-harvest', 'a1000001-0001-4001-8001-000000000003', 'Cereal harvest & import dependency', 'Wheat/barley yields, silo capacity, and international purchase tenders.', 'published', 10, 1_200_000, 'DZD', '2025-03-18 09:30:00+00', null, 512),
  ('mock-agri-date-export', 'a1000001-0001-4001-8001-000000000003', 'Date export value chain', 'Packaging standards, Gulf retail listings, and producer cooperative margins.', 'published', 10, 0, 'DZD', '2025-02-01 08:00:00+00', null, 980),
  ('mock-agri-irrigation-tech', 'a1000001-0001-4001-8001-000000000003', 'Smart irrigation & water stress', 'Drip adoption, groundwater regulation, and subsidy programs by region.', 'published', 10, 3_100_000, 'DZD', '2024-11-15 13:00:00+00', null, 145),
  ('mock-retail-modern-trade', 'a1000001-0001-4001-8001-000000000004', 'Modern trade expansion map', 'Hypermarket openings, private label share, and supplier listing fees.', 'published', 10, 2_500_000, 'DZD', '2025-03-05 15:00:00+00', null, 723),
  ('mock-retail-ecommerce-growth', 'a1000001-0001-4001-8001-000000000004', 'E-commerce GMV & last-mile delivery', 'Marketplace GMV, COD share, and courier unit economics.', 'published', 10, 1_800_000, 'DZD', '2025-01-30 10:00:00+00', null, 1102),
  ('mock-retail-fashion-seasonal', 'a1000001-0001-4001-8001-000000000004', 'Apparel seasonal sell-through', 'Mall footfall, discount cycles, and import vs local manufacturing mix.', 'published', 10, 0, 'DZD', '2024-12-20 11:00:00+00', null, 401),
  ('mock-health-hospital-beds', 'a1000001-0001-4001-8001-000000000005', 'Public hospital capacity & bed occupancy', 'Regional gaps, PPP projects, and medical equipment import tariffs.', 'published', 10, 3_300_000, 'DZD', '2025-02-10 09:00:00+00', null, 267),
  ('mock-health-generics-market', 'a1000001-0001-4001-8001-000000000005', 'Generics & local pharma manufacturing', 'API sourcing, GMP certifications, and reimbursement list updates.', 'published', 10, 2_000_000, 'DZD', '2025-01-12 14:00:00+00', null, 188),
  ('mock-health-telemedicine', 'a1000001-0001-4001-8001-000000000005', 'Telemedicine adoption post-2020', 'Platform usage, regulatory framework, and rural connectivity barriers.', 'published', 10, 0, 'DZD', '2024-10-08 08:00:00+00', null, 654),
  ('mock-tech-5g-rollout', 'a1000001-0001-4001-8001-000000000006', '5G rollout & spectrum allocation', 'Capex plans, ARPU impact, and enterprise IoT use cases.', 'published', 10, 4_000_000, 'DZD', '2025-04-01 10:00:00+00', 'https://picsum.photos/seed/mock-tech-1/640/360', 1567),
  ('mock-tech-fintech-wallets', 'a1000001-0001-4001-8001-000000000006', 'Mobile wallets & super-app ecosystems', 'Active users, merchant acceptance, and interoperability with banks.', 'published', 10, 2_600_000, 'DZD', '2025-03-12 11:00:00+00', null, 892),
  ('mock-tech-cloud-adoption', 'a1000001-0001-4001-8001-000000000006', 'Cloud adoption by Algerian enterprises', 'IaaS/PaaS spend, data residency concerns, and local hosting providers.', 'published', 10, 5_500_000, 'DZD', '2025-02-02 09:00:00+00', null, 445),
  ('mock-tech-cybersecurity-spend', 'a1000001-0001-4001-8001-000000000006', 'Cybersecurity spending outlook', 'SOC services, compliance drivers, and breach cost benchmarks.', 'published', 10, 0, 'DZD', '2025-01-18 16:00:00+00', null, 1203),
  ('mock-tourism-inbound-2025', 'a1000001-0001-4001-8001-000000000007', 'Inbound tourism forecast 2025', 'Air seat capacity, visa policy, and top source markets.', 'published', 10, 1_600_000, 'DZD', '2025-03-25 08:00:00+00', null, 378),
  ('mock-tourism-hotel-occupancy', 'a1000001-0001-4001-8001-000000000007', 'Hotel occupancy & ADR by city', 'Coastal vs Sahara routes, OTA commission rates, and MICE segment.', 'published', 10, 0, 'DZD', '2025-02-14 12:00:00+00', null, 521),
  ('mock-construction-cement-demand', 'a1000001-0001-4001-8001-000000000008', 'Cement demand & housing programs', 'Public housing targets, clinker imports, and producer price trends.', 'published', 10, 2_400_000, 'DZD', '2025-03-08 10:00:00+00', null, 299),
  ('mock-construction-commercial-yields', 'a1000001-0001-4001-8001-000000000008', 'Commercial real estate yields', 'Office vacancy, retail rents, and logistics warehouse cap rates.', 'published', 10, 3_800_000, 'DZD', '2025-01-25 09:00:00+00', null, 167),
  ('mock-construction-infrastructure-ppp', 'a1000001-0001-4001-8001-000000000008', 'Infrastructure PPP pipeline', 'Roads, ports, and water projects — tender calendar and financing models.', 'published', 10, 5_200_000, 'DZD', '2024-12-05 14:00:00+00', null, 94),
  -- Draft report (admin only; not on public catalogue)
  ('mock-draft-retail-outlook-2026', 'a1000001-0001-4001-8001-000000000004', '[Draft] Retail outlook 2026', 'Work in progress — channel mix and inflation pass-through scenarios.', 'draft', 10, 3_000_000, 'DZD', null, null, 0);

-- -----------------------------------------------------------------------------
-- 3. Report gallery images (external URLs; optional thumbnails above)
-- -----------------------------------------------------------------------------
delete from public.report_images
where report_id in (select id from public.reports where slug like 'mock-%');

insert into public.report_images (report_id, image_url, sort_order)
select r.id, v.url, v.ord
from public.reports r
join (
  values
    ('mock-finance-algeria-banking-2025', 'https://picsum.photos/seed/gallery-f1/800/500', 0),
    ('mock-finance-algeria-banking-2025', 'https://picsum.photos/seed/gallery-f2/800/500', 1),
    ('mock-energy-gas-production', 'https://picsum.photos/seed/gallery-e1/800/500', 0),
    ('mock-tech-5g-rollout', 'https://picsum.photos/seed/gallery-t1/800/500', 0),
    ('mock-tech-5g-rollout', 'https://picsum.photos/seed/gallery-t2/800/500', 1)
) as v(slug, url, ord) on v.slug = r.slug;

-- -----------------------------------------------------------------------------
-- 4. Blog posts
-- -----------------------------------------------------------------------------
delete from public.blog_posts where slug like 'mock-%';

insert into public.blog_posts (
  slug,
  title,
  excerpt,
  body,
  status,
  published_at,
  cover_image_url,
  sources
)
values
  (
    'mock-blog-methodology',
    'How we build sector reports',
    'A short overview of data sources, analyst review, and update cadence.',
    '<p>Our reports combine licensed data feeds, regulatory filings, and expert interviews. Each publication is reviewed by a sector lead before release.</p><p>Updates are scheduled quarterly unless a major market event triggers an interim note.</p>',
    'published',
    '2025-04-01 09:00:00+00',
    'https://picsum.photos/seed/mock-blog-1/1200/630',
    '[]'::jsonb
  ),
  (
    'mock-blog-fintech-algeria',
    'Fintech adoption in Algeria: 2025 snapshot',
    'Wallet penetration and merchant acceptance are accelerating in urban centres.',
    '<p>Mobile payment apps now cover bill pay, P2P transfers, and QR merchant checkout. Rural adoption still lags due to connectivity and agent network gaps.</p>',
    'published',
    '2025-03-15 11:00:00+00',
    'https://picsum.photos/seed/mock-blog-2/1200/630',
    '[{"label": "Sample source link", "url": "https://example.com/fintech-snapshot"}]'::jsonb
  ),
  (
    'mock-blog-energy-transition',
    'Energy transition: what investors watch',
    'Solar tenders, gas export contracts, and hydrogen pilots across MENA.',
    '<p>Policy risk and currency exposure remain top concerns for cross-border energy investments in the region.</p>',
    'published',
    '2025-02-20 08:00:00+00',
    null,
    '[]'::jsonb
  ),
  (
    'mock-blog-draft-insights',
    '[Draft] Weekly insights — retail',
    'Unpublished draft for editor review.',
    '<p>Draft content only.</p>',
    'draft',
    null,
    null,
    '[]'::jsonb
  );

-- -----------------------------------------------------------------------------
-- 5. Promotions (demo codes)
-- -----------------------------------------------------------------------------
insert into public.promotions (code, description, percent_off, starts_at, ends_at, max_redemptions, metadata)
values
  (
    'MOCKWELCOME10',
    'Mock welcome — 10% off (demo)',
    10,
    now() - interval '30 days',
    now() + interval '365 days',
    1000,
    '{"mock": true}'::jsonb
  ),
  (
    'MOCKSECTOR50',
    'Mock sector promo — 50% off (demo)',
    50,
    now() - interval '7 days',
    now() + interval '90 days',
    50,
    '{"mock": true}'::jsonb
  )
on conflict (code) do update set
  description = excluded.description,
  percent_off = excluded.percent_off,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  max_redemptions = excluded.max_redemptions,
  metadata = excluded.metadata;

-- -----------------------------------------------------------------------------
-- 6. Platform settings (demo bank RIB for checkout UI)
-- -----------------------------------------------------------------------------
insert into public.platform_settings (key, value)
values (
  'bank_rib',
  '{
    "bank_name": "Banque de Développement Local (demo)",
    "account_holder": "Researcha Demo SARL",
    "rib": "007 99999 9999999999 99",
    "iban": "DZ00 0000 0000 0000 0000 0000 00",
    "swift": "BDALDZAL",
    "notes": "Mock data for development only. Replace in Admin → Settings."
  }'::jsonb
)
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();

commit;

-- =============================================================================
-- 7. OPTIONAL — tie data to your logged-in user
-- =============================================================================
-- After you sign up / log in, copy your user UUID from:
--   Supabase → Authentication → Users  (or  select id from auth.users limit 5;)
--
-- Uncomment and replace the UUID below, then run this block alone.
-- =============================================================================
/*
begin;

do $$
declare
  v_user uuid := '00000000-0000-4000-8000-000000000099'; -- ← YOUR auth.users.id
  v_report uuid;
  v_sector uuid;
begin
  if not exists (select 1 from auth.users where id = v_user) then
    raise exception 'User % not found in auth.users — sign up first or fix the UUID', v_user;
  end if;

  -- Ensure profile row exists (trigger usually creates it on signup)
  insert into public.profiles (id, full_name, app_role)
  values (v_user, 'Demo User', 'user')
  on conflict (id) do nothing;

  select id into v_report from public.reports where slug = 'mock-finance-algeria-banking-2025' limit 1;
  select id into v_sector from public.sectors where slug = 'energy' limit 1;

  if v_report is not null and not exists (
    select 1 from public.user_report_entitlements e
    where e.user_id = v_user and e.report_id = v_report
  ) then
    insert into public.user_report_entitlements (user_id, report_id, source, notes)
    values (v_user, v_report, 'admin_grant', 'Mock seed entitlement');
  end if;

  if v_sector is not null and not exists (
    select 1 from public.user_report_entitlements e
    where e.user_id = v_user and e.sector_id = v_sector
  ) then
    insert into public.user_report_entitlements (user_id, sector_id, source, expires_at, notes)
    values (v_user, v_sector, 'admin_grant', now() + interval '1 year', 'Mock sector subscription');
  end if;

  -- Make yourself admin (for /admin access)
  update public.profiles set app_role = 'admin' where id = v_user;

end $$;

commit;
*/

-- Corporate services inbox (homepage form) — demo rows for admin overview
insert into public.corporate_messages (name, email, subject, body, status)
values
  (
    'SARL Data Labs',
    'contact@datalabs.dz',
    'Accès équipe — 12 sièges',
    'Bonjour, nous souhaitons un accès corporate pour notre équipe data (12 analystes) avec facturation annuelle.',
    'new'
  ),
  (
    'Banque Horizon',
    'procurement@horizon-bank.dz',
    'Étude sur mesure — secteur fintech',
    'Demande de proposition pour une étude ad hoc sur le paiement mobile en Algérie (Q3 2026).',
    'new'
  ),
  (
    'Ministère du Commerce',
    'veille@commerce.gov.dz',
    'Licence multi-secteurs',
    'Merci de nous indiquer les options de licence institutionnelle pour 3 secteurs prioritaires.',
    'read'
  );

-- =============================================================================
-- Quick checks
-- =============================================================================
-- select count(*) as sectors from public.sectors where is_published;
-- select count(*) as reports from public.reports where slug like 'mock-%' and status = 'published';
-- select slug, title, price_cents / 100.0 as price_dzd from public.reports where slug like 'mock-%' order by sector_id, title;
-- select slug, status from public.blog_posts where slug like 'mock-%';

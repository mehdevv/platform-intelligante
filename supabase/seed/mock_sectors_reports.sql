-- =============================================================================
-- Researcha — mock sectors & published reports (sectors + reports only)
-- For blog, promotions, RIB, gallery images, and optional user setup, use:
--   supabase/seed/mock_full_database.sql
-- =============================================================================
-- Run in Supabase Dashboard → SQL Editor (uses service role; bypasses RLS).
-- Safe to re-run: upserts on slug, then replaces mock reports for those sectors.
--
-- Prices: price_cents = major DZD × 100 (e.g. 25,000 DZD → 2_500_000).
-- Subscription: subscription_price_cents same rule (monthly sector access).
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Sectors (fixed UUIDs so reports can reference them)
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

-- Remove previous mock reports (slug prefix) so re-runs do not duplicate
delete from public.reports
where slug like 'mock-%';

-- -----------------------------------------------------------------------------
-- Reports (published catalogue; slug prefix mock-)
-- -----------------------------------------------------------------------------
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
  thumbnail_image_url
)
values
  -- Finance (free + low / mid / high prices for budget filters)
  (
    'mock-finance-algeria-banking-2025',
    'a1000001-0001-4001-8001-000000000001',
    'Algeria banking sector overview 2025',
    'Deposit growth, NPL ratios, and digital banking adoption among top banks.',
    'published',
    15,
    0,
    'DZD',
    '2025-03-01 10:00:00+00',
    null
  ),
  (
    'mock-finance-sme-lending',
    'a1000001-0001-4001-8001-000000000001',
    'SME lending & microfinance trends',
    'Credit guarantees, Islamic finance products, and regional disbursement data.',
    'published',
    10,
    1_500_000,
    'DZD',
    '2025-02-15 09:00:00+00',
    null
  ),
  (
    'mock-finance-payment-cards',
    'a1000001-0001-4001-8001-000000000001',
    'Card payments & POS penetration',
    'Interchange fees, merchant acquirers, and cash vs digital mix by wilaya.',
    'published',
    10,
    2_800_000,
    'DZD',
    '2025-01-20 14:00:00+00',
    null
  ),
  (
    'mock-finance-insurance-premium',
    'a1000001-0001-4001-8001-000000000001',
    'Insurance market premium forecast',
    'Life vs non-life split, bancassurance, and regulatory solvency updates.',
    'published',
    10,
    4_500_000,
    'DZD',
    '2024-12-01 11:00:00+00',
    null
  ),

  -- Energy
  (
    'mock-energy-gas-production',
    'a1000001-0001-4001-8001-000000000002',
    'Natural gas production & export routes',
    'Pipeline capacity, LNG spot exposure, and European offtake contracts.',
    'published',
    10,
    0,
    'DZD',
    '2025-04-10 08:00:00+00',
    null
  ),
  (
    'mock-energy-solar-rooftop',
    'a1000001-0001-4001-8001-000000000002',
    'Distributed solar & rooftop PV',
    'Net metering rules, installer landscape, and payback periods for SMEs.',
    'published',
    10,
    2_200_000,
    'DZD',
    '2025-03-22 16:00:00+00',
    null
  ),
  (
    'mock-energy-power-tariffs',
    'a1000001-0001-4001-8001-000000000002',
    'Electricity tariffs & industrial consumers',
    'Subsidies, peak demand, and energy-intensive industry cost pass-through.',
    'published',
    10,
    3_600_000,
    'DZD',
    '2025-02-28 12:00:00+00',
    null
  ),
  (
    'mock-energy-hydrogen-pilot',
    'a1000001-0001-4001-8001-000000000002',
    'Green hydrogen pilot projects MENA',
    'CAPEX benchmarks, offtake MOUs, and national hydrogen strategies.',
    'published',
    10,
    6_500_000,
    'DZD',
    '2025-01-05 10:00:00+00',
    null
  ),

  -- Agriculture
  (
    'mock-agri-cereal-harvest',
    'a1000001-0001-4001-8001-000000000003',
    'Cereal harvest & import dependency',
    'Wheat/barley yields, silo capacity, and international purchase tenders.',
    'published',
    10,
    1_200_000,
    'DZD',
    '2025-03-18 09:30:00+00',
    null
  ),
  (
    'mock-agri-date-export',
    'a1000001-0001-4001-8001-000000000003',
    'Date export value chain',
    'Packaging standards, Gulf retail listings, and producer cooperative margins.',
    'published',
    10,
    0,
    'DZD',
    '2025-02-01 08:00:00+00',
    null
  ),
  (
    'mock-agri-irrigation-tech',
    'a1000001-0001-4001-8001-000000000003',
    'Smart irrigation & water stress',
    'Drip adoption, groundwater regulation, and subsidy programs by region.',
    'published',
    10,
    3_100_000,
    'DZD',
    '2024-11-15 13:00:00+00',
    null
  ),

  -- Retail
  (
    'mock-retail-modern-trade',
    'a1000001-0001-4001-8001-000000000004',
    'Modern trade expansion map',
    'Hypermarket openings, private label share, and supplier listing fees.',
    'published',
    10,
    2_500_000,
    'DZD',
    '2025-03-05 15:00:00+00',
    null
  ),
  (
    'mock-retail-ecommerce-growth',
    'a1000001-0001-4001-8001-000000000004',
    'E-commerce GMV & last-mile delivery',
    'Marketplace GMV, COD share, and courier unit economics.',
    'published',
    10,
    1_800_000,
    'DZD',
    '2025-01-30 10:00:00+00',
    null
  ),
  (
    'mock-retail-fashion-seasonal',
    'a1000001-0001-4001-8001-000000000004',
    'Apparel seasonal sell-through',
    'Mall footfall, discount cycles, and import vs local manufacturing mix.',
    'published',
    10,
    0,
    'DZD',
    '2024-12-20 11:00:00+00',
    null
  ),

  -- Healthcare
  (
    'mock-health-hospital-beds',
    'a1000001-0001-4001-8001-000000000005',
    'Public hospital capacity & bed occupancy',
    'Regional gaps, PPP projects, and medical equipment import tariffs.',
    'published',
    10,
    3_300_000,
    'DZD',
    '2025-02-10 09:00:00+00',
    null
  ),
  (
    'mock-health-generics-market',
    'a1000001-0001-4001-8001-000000000005',
    'Generics & local pharma manufacturing',
    'API sourcing, GMP certifications, and reimbursement list updates.',
    'published',
    10,
    2_000_000,
    'DZD',
    '2025-01-12 14:00:00+00',
    null
  ),
  (
    'mock-health-telemedicine',
    'a1000001-0001-4001-8001-000000000005',
    'Telemedicine adoption post-2020',
    'Platform usage, regulatory framework, and rural connectivity barriers.',
    'published',
    10,
    0,
    'DZD',
    '2024-10-08 08:00:00+00',
    null
  ),

  -- Technology
  (
    'mock-tech-5g-rollout',
    'a1000001-0001-4001-8001-000000000006',
    '5G rollout & spectrum allocation',
    'Capex plans, ARPU impact, and enterprise IoT use cases.',
    'published',
    10,
    4_000_000,
    'DZD',
    '2025-04-01 10:00:00+00',
    null
  ),
  (
    'mock-tech-fintech-wallets',
    'a1000001-0001-4001-8001-000000000006',
    'Mobile wallets & super-app ecosystems',
    'Active users, merchant acceptance, and interoperability with banks.',
    'published',
    10,
    2_600_000,
    'DZD',
    '2025-03-12 11:00:00+00',
    null
  ),
  (
    'mock-tech-cloud-adoption',
    'a1000001-0001-4001-8001-000000000006',
    'Cloud adoption by Algerian enterprises',
    'IaaS/PaaS spend, data residency concerns, and local hosting providers.',
    'published',
    10,
    5_500_000,
    'DZD',
    '2025-02-02 09:00:00+00',
    null
  ),
  (
    'mock-tech-cybersecurity-spend',
    'a1000001-0001-4001-8001-000000000006',
    'Cybersecurity spending outlook',
    'SOC services, compliance drivers, and breach cost benchmarks.',
    'published',
    10,
    0,
    'DZD',
    '2025-01-18 16:00:00+00',
    null
  ),

  -- Tourism
  (
    'mock-tourism-inbound-2025',
    'a1000001-0001-4001-8001-000000000007',
    'Inbound tourism forecast 2025',
    'Air seat capacity, visa policy, and top source markets.',
    'published',
    10,
    1_600_000,
    'DZD',
    '2025-03-25 08:00:00+00',
    null
  ),
  (
    'mock-tourism-hotel-occupancy',
    'a1000001-0001-4001-8001-000000000007',
    'Hotel occupancy & ADR by city',
    'Coastal vs Sahara routes, OTA commission rates, and MICE segment.',
    'published',
    10,
    0,
    'DZD',
    '2025-02-14 12:00:00+00',
    null
  ),

  -- Construction
  (
    'mock-construction-cement-demand',
    'a1000001-0001-4001-8001-000000000008',
    'Cement demand & housing programs',
    'Public housing targets, clinker imports, and producer price trends.',
    'published',
    10,
    2_400_000,
    'DZD',
    '2025-03-08 10:00:00+00',
    null
  ),
  (
    'mock-construction-commercial-yields',
    'a1000001-0001-4001-8001-000000000008',
    'Commercial real estate yields',
    'Office vacancy, retail rents, and logistics warehouse cap rates.',
    'published',
    10,
    3_800_000,
    'DZD',
    '2025-01-25 09:00:00+00',
    null
  ),
  (
    'mock-construction-infrastructure-ppp',
    'a1000001-0001-4001-8001-000000000008',
    'Infrastructure PPP pipeline',
    'Roads, ports, and water projects — tender calendar and financing models.',
    'published',
    10,
    5_200_000,
    'DZD',
    '2024-12-05 14:00:00+00',
    null
  );

commit;

-- -----------------------------------------------------------------------------
-- Quick check
-- -----------------------------------------------------------------------------
-- select s.slug, s.name, s.is_published, count(r.id) as reports
-- from public.sectors s
-- left join public.reports r on r.sector_id = s.id and r.status = 'published'
-- where s.slug in ('finance','energy','agriculture','retail','healthcare','technology','tourism','construction')
-- group by s.id
-- order by s.sort_order;

# Researcha — Master platform context for system planning

**Purpose:** Single source of truth for product, UX, technical scope, and gaps. Use this document (plus the codebase) to generate **architecture plans**, **roadmaps**, **backlogs**, **API specs**, and **RLS policies** in tools like Claude.  
**Product name:** Researcha (market intelligence platform). **Brand owner:** AEM Consulting.  
**Doc version:** 2026-04-08 (§2.4 admin vs subscriber split; `/dashboard/statistics`, `/admin/sectors`, `/admin/blog`; see §17 + `dashboard-admin-routes.md`).  
**Canonical folder:** `researcha-app/context/` — keep `aem-design-tokens.json` and smaller topic files in sync when you change strategy.

---

## Table of contents

1. [How to use this document with an LLM](#1-how-to-use-this-document-with-an-llm)  
2. [Vision, positioning, and personas](#2-vision-positioning-and-personas)  
3. [Commercial model and entitlements](#3-commercial-model-and-entitlements)  
4. [Functional capability map (target vs implemented)](#4-functional-capability-map-target-vs-implemented)  
5. [Information architecture — routes and files](#5-information-architecture--routes-and-files)  
6. [Target technical architecture (spec)](#6-target-technical-architecture-spec)  
7. [Current implementation stack (repository)](#7-current-implementation-stack-repository)  
8. [Design system and brand](#8-design-system-and-brand)  
9. [Internationalization](#9-internationalization)  
10. [Data, search, RAG, and paywall (planning notes)](#10-data-search-rag-and-paywall-planning-notes)  
11. [Security, compliance, and operations](#11-security-compliance-and-operations)  
12. [Known gaps, debt, and backlog themes](#12-known-gaps-debt-and-backlog-themes)  
13. [Phased delivery template (suggested)](#13-phased-delivery-template-suggested)  
14. [Repository structure reference](#14-repository-structure-reference)  
15. [Source documents and traceability](#15-source-documents-and-traceability)  
16. [Glossary](#16-glossary)  
17. [Dashboard & admin — per-page specifications](#17-dashboard--admin--per-page-specifications)

---

## 1. How to use this document with an LLM

**Recommended prompts:**

- *“Given PLATFORM_MASTER_CONTEXT_FOR_SYSTEM_PLANNING.md, propose a Supabase schema (tables, enums, RLS) for reports, entitlements, and admin roles.”*  
- *“List MVP user stories with acceptance criteria for checkout + entitlements for Algeria (CIB / BaridiPay).”*  
- *“Define an event taxonomy for `/admin/analytics` and which APIs emit them.”*  
- *“Compare Simple / Premium / Corporate plans to UI routes and flag missing screens.”*

**Constraints to enforce:**

- Do not assume **auth is implemented**; plan **guards**, **sessions**, and **admin RBAC** explicitly.  
- Distinguish **marketing SPA** (today) from **SSR/SSG** needs for SEO on public catalogue pages.  
- Preserve **paywall-aware RAG** (no leakage of full report text to users without entitlement).

---

## 2. Vision, positioning, and personas

### 2.1 Vision

Researcha is a **B2B market intelligence platform**: curated **sector reports**, **statistics**, and **structured indicators**, delivered with **search**, **subscriptions**, **one-off purchases**, and an **AI assistant** grounded in licensed content (RAG), comparable in ambition to Statista / Mordor Intelligence–class offerings but scoped for **regional go-to-market** (especially **Algeria and Maghreb/MENA** context per technical sheet).

### 2.2 Positioning

| Dimension | Intent |
|----------|--------|
| **Offer** | SaaS subscriptions + per-report purchase; optional corporate seats and custom studies. |
| **Differentiation** | Verified sources, sector depth, regional relevance, methodology transparency (`/methodology`), corporate pipeline (`/corporate`). |
| **Trust** | Formal, expert tone; AEM visual identity; citations and source attribution on data. |

### 2.3 Primary personas

| Persona | Goals | Primary surfaces |
|--------|--------|------------------|
| **Analyst / researcher** | Find and export data, compare regions, cite sources. | Search, reports, sectors, dashboard (Premium+), exports. |
| **Procurement / manager** | Buy plans or single reports, manage seats (Corporate). | Pricing, checkout, profile, corporate contact, admin (internal). |
| **Content / product admin** | Publish reports, manage paywall, promos, see usage. | `/admin/*`, import pipeline, audit log. |
| **Casual explorer** | Free preview, upgrade path. | Home, blog, featured stats, report previews. |

### 2.4 Platform split — admin vs subscriber dashboard

| Surface | Who | Scope |
|---------|-----|--------|
| **`/admin/*`** | Staff with **admin / editor** roles (RBAC) | **All platform content** the product exposes: reports catalogue, **sectors** taxonomy, **blog** posts, bulk **import**, **promotions**, **platform settings**. **All users**: subscribers, plans, seats (Corporate), entitlements, suspension/support flags — with **immutable audit** and optional read-only replicas for analytics. |
| **`/dashboard/*`** | Authenticated **subscriber** (individual or org member) | **Only that account’s data**, derived from **plan entitlements**: quota usage, entitled library, watchlist, activity timeline, **billing**, and **statistics / usage** (metrics and charts gated by tier — e.g. Simple sees a reduced set or upsell; Premium+ sees full usage trends). Never show other customers’ data. |

**Implication:** cross-tenant traffic is embedded on **Admin → Overview** (`AdminGoogleAnalyticsEmbed`, GA4 via Looker Studio); dashboard statistics (`/dashboard/statistics`) are **single-tenant** and **plan-aware**.

### 2.5 Non-goals (unless spec changes)

- Generic “unlimited cloud storage” product (legacy copy in some screens should be removed).  
- Replacing **statistical methodology** with AI hallucination — AI must **cite** and **respect entitlements**.

---

## 3. Commercial model and entitlements

### 3.1 Plan tiers (from AEM technical sheet summary)

| Tier | Intended capabilities |
|------|------------------------|
| **Simple** | Report quota, **online reading**; **dashboard** shows **plan & quota**, library, billing; **limited or no** advanced **statistics** / export / AI quota vs higher tiers (enforce in UI + API). |
| **Premium** | Full **dashboard** including **usage statistics**, trends, KPIs, **exports**, **Statista-style AI**, **alerts**. |
| **Corporate** | **Seats**, group licensing, **per-seat or pooled usage** in dashboard, consolidated billing, priority support, **custom studies**; admins may need **org-level** stats (future: tenant id on profile). |

### 3.2 Entitlement dimensions (for backend design)

- **Plan type** (simple | premium | corporate).  
- **Report-level**: none | preview | full PDF | online viewer session.  
- **Quota**: reports/month or tokens, downloads, API calls (spec mentions API for higher tiers).  
- **Feature flags**: exports (Excel/PPT/CSV), **dashboard statistics depth** (which widgets and date ranges), AI query limits, watchlist alerts.  
- **Geography / compliance**: retention of search history (RGPD), consent for analytics events.

### 3.3 Payments (regional)

- Technical sheet references **Stripe** and regional methods (**CIB**, **BaridiPay**) for Algeria — **checkout UI is placeholder** in the app; planning must include **webhooks**, **invoice**, and **entitlement grant** on successful payment.

---

## 4. Functional capability map (target vs implemented)

Legend: **Done (UI)** = user-visible route exists. **Stub** = page exists but data/actions are mock or empty. **Missing** = not built or not wired.

| Capability | Spec / intent | App status (high level) |
|------------|---------------|-------------------------|
| Marketing home | Hero, sectors, reports teaser, trust, pricing CTA | **Done (UI)** `HomePage` |
| Global search + facets | FTS, facets, history (RGPD) | **Stub** `SearchPage` (`?q=`), no backend |
| Sectors catalogue | List + detail | **Done (UI)** `SectorsListingPage`, `SectorDetailPage` |
| Reports catalogue | List + detail, preview | **Done (UI)** `ReportsListingPage`, `ReportDetailPage` |
| PDF / secure viewer | Watermark, session, fullscreen | **Missing** (viewer not isolated) |
| Paywall | Preview %, gated full text | **Partial** (copy/UX only; no server enforcement) |
| Auth | Login, signup, forgot password | **Done (UI)** forms; **no** real Supabase auth wired in routes |
| Profile | User settings, purchases | **Done (UI)** `ProfilePage` — demo |
| My reports / library | Purchased entitlements | **Stub** `MyReportsPage`, `DashboardReportsPage` |
| Checkout | Cart / payment / success | **Stub** `CheckoutPage`; need `/purchase/success` |
| Subscriber dashboard | Plan, quota, activity, **plan-scoped statistics**, AI link | **Stub** `DashboardLayout` + subpages; `/dashboard/statistics` UI stub |
| Admin — all content | Reports, **sectors**, **blog**, homepage/feature flags | **Stub** — routes `/admin/sectors`, `/admin/blog`; reports CRUD stub; **import / promos routes removed** |
| Admin CRUD reports | List, create, edit, publish | **Stub** `AdminLayout` + reports pages; sample table rows |
| Admin import | — | **Removed** from UI; `/admin/import` → redirect `/admin` |
| Admin promotions | — | **Removed** from UI; `/admin/promotions` → redirect `/admin` |
| Admin users | **All** subscribers, plans, seats, entitlements, support actions | **Stub** `AdminUsersPage` — target full user lifecycle (read/update, audited) |
| Admin traffic (GA4) | Traffic, conversions | **Looker Studio embed** on `AdminOverviewPage` |
| Admin audit | Immutable admin actions | **Stub** `AdminAuditPage` |
| Blog / news | List + post | **Done (UI)** static/demo content |
| Methodology simulator | Sample size / MOE | **Done (UI)** `MethodologyPage` |
| Corporate | Lead form | **Done (UI)** `CorporatePage` |
| AI assistant | RAG on reports, paywall-aware | **Done (UI)** ChatGPT-like minimal UI; **no** model/RAG backend |
| Legal | Terms, privacy | **Done (UI)** `TermsPage`, `PrivacyPage` |
| i18n EN/FR | URLs + copy | **Partial** — many pages translated; dashboard/admin/ some detail pages **hardcoded EN** |
| SEO | Indexable public pages | **Missing** for SPA-only deployment (need SSR/SSG or prerender) |

---

## 5. Information architecture — routes and files

### 5.1 Public and authenticated-style routes (`src/App.jsx`)

| Path | Component(s) | Notes |
|------|----------------|-------|
| `/` | `HomePage` | Marketing |
| `/pricing` | `PricingPage` | Realign copy to report quotas (debt) |
| `/login` | `LoginPage` | Wire Supabase |
| `/signup` | `SignupPage` | Wire Supabase |
| `/forgot-password` | `ForgotPasswordPage` | Wire provider |
| `/sectors` | `SectorsListingPage` | |
| `/sectors/:id` | `SectorDetailPage` | |
| `/reports` | `ReportsListingPage` | |
| `/reports/:id` | `ReportDetailPage` | Slug/id strategy TBD |
| `/dashboard` | `DashboardLayout` → index `DashboardOverviewPage` | **Unprotected** |
| `/dashboard/reports` | `DashboardReportsPage` | Links to `/my-reports` |
| `/dashboard/watchlist` | `DashboardWatchlistPage` | |
| `/dashboard/activity` | `DashboardActivityPage` | RGPD copy |
| `/dashboard/statistics` | `DashboardStatisticsPage` | Plan-scoped usage metrics (stub) |
| `/dashboard/billing` | `DashboardBillingPage` | |
| `/dashboard/settings` | `DashboardSettingsPage` | |
| `/profile` | `ProfilePage` | |
| `/admin` | `AdminLayout` → `AdminOverviewPage` (+ optional `AdminGoogleAnalyticsEmbed`) | Staff; KPI counts + GA embed + storage |
| `/admin/reports` | `AdminReportsPage` | |
| `/admin/sectors` | `AdminSectorsPage` | Taxonomy CMS (stub) |
| `/admin/blog` | `AdminBlogPage` | Editorial CMS (stub) |
| `/admin/reports/new` | `AdminReportNewPage` | **Must stay before** `:reportId` |
| `/admin/reports/:reportId` | `AdminReportEditPage` | |
| `/admin/import` | `Navigate` → `/admin` | Legacy URL |
| `/admin/promotions` | `Navigate` → `/admin` | Legacy URL |
| `/admin/users` | `AdminUsersPage` | |
| `/admin/audit` | `AdminAuditPage` | |
| `/admin/settings` | `AdminSettingsPage` | |
| `/ai` | `AIAgentPage` | Full-screen chat shell |
| `/blog` | `BlogListingPage` | |
| `/blog/:slug` | `BlogPostPage` | |
| `/methodology` | `MethodologyPage` | |
| `/corporate` | `CorporatePage` | |
| `/my-reports` | `MyReportsPage` | |
| `/checkout` | `CheckoutPage` | |
| `/terms` | `TermsPage` | |
| `/privacy` | `PrivacyPage` | |
| `/search` | `SearchPage` | `?q=` |
| `/tarifs` | `Navigate` → `/pricing` | FR alias |
| `/rapports` | `Navigate` → `/reports` | FR alias |
| `/secteurs` | `Navigate` → `/sectors` | FR alias |
| `/secteurs/:id` | `RedirectSecteur` | → `/sectors/:id` |
| `*` | `Navigate` → `/` | |

### 5.2 Layouts and shared components

| Item | Path | Role |
|------|------|------|
| MUI theme | `src/theme.js` | Palette, typography, component overrides |
| Global CSS | `src/index.css` | Animations, utilities (e.g. `.typography-premium-small`) |
| Header / Footer | `src/components/Header.jsx`, `Footer.jsx` | Nav, i18n switcher |
| Brand | `src/components/BrandLogo.jsx` | Uses `public/logo.png` |
| i18n | `src/i18n/config.js`, `src/locales/en.json`, `fr.json` | `localStorage` key `researcha-lang` |
| HTML `lang` | `src/components/I18nHtmlLang.jsx` | |
| Empty states | `src/components/shell/EmptyState.jsx` | Dashboard/admin |
| Homepage imagery | `src/constants/homeImagery.js` | Unsplash URLs → replace with CDN/R2 |

---

## 6. Target technical architecture (spec)

From **AEM_Market_Intelligence_Platform_Technical_Sheet.html** (Mars 2026, MVP V1.0), summarized:

| Layer | Technology |
|-------|------------|
| **Frontend** | React SPA (**implemented**: Vite + React 19 + React Router 7) |
| **UI** | MUI + Emotion (**implemented**); Tailwind 4 present — avoid conflicting tokens |
| **Auth + DB** | **Supabase** (Auth, PostgreSQL, **RLS**) |
| **Objects / CDN** | **Cloudflare R2** + CDN for PDFs and static assets |
| **Search** | **Full-text search** (Postgres FTS or external; faceting in product spec) |
| **AI** | **RAG** with **pgvector**; retrieval scoped by **entitlement** |
| **Payments** | **Stripe** + regional (**CIB**, **BaridiPay**) |
| **Email** | **Resend** or **SendGrid** |
| **Charts** | **Recharts** or **D3** (not yet primary in repo) |

**Implication for planners:** every sensitive read (report body, AI context, download URL) must go through **server-side checks** (RLS or API), not client-only flags.

---

## 7. Current implementation stack (repository)

| Piece | Version / detail |
|-------|------------------|
| **Build** | Vite 7 |
| **React** | 19.x |
| **Router** | react-router-dom 7.x |
| **UI** | MUI 7.x, `@mui/icons-material` |
| **Styling** | Emotion (via MUI), Tailwind 4 + `index.css` |
| **i18n** | i18next, react-i18next, browser language detector |
| **Backend in repo** | **Partial** — `supabase/migrations/*`, `src/lib/supabaseClient.js`, `@supabase/supabase-js`; auth routes wiring TBD |
| **Deployment** | Static SPA (`npm run build` → `dist/`); host on any static host + separate API |

---

## 8. Design system and brand

### 8.1 Tokens (`context/aem-design-tokens.json`)

- **Primary (bleu grisé):** `#4B5B72`  
- **Secondary (azur):** `#197F94`  
- **Azur sharp / emphasis:** `#0e7490`  
- **Marketing accent (cyan):** `#06b6d4` (used on home hero accents)  
- **Background soft:** `#EBECF1`  
- **Dark / hero:** `#1a2332`  
- **Text:** `#2c3748` / muted `#6b7a8d`  
- **Border:** `#dde1e9`  

### 8.2 Typography

| Role | Spec (sheet) | Implementation note |
|------|--------------|---------------------|
| Display | League Spartan | Loaded via Google Fonts in `index.html`; MUI `h1`–`h6` |
| Editorial | Libre Baskerville italic | Captions, `.typography-premium-*` classes |
| UI body | DM Sans (spec) | **App uses Ubuntu** in `theme.js` for UI — align spec or code deliberately |

### 8.3 Design system v2 principles (`context/design-system-v2.md`)

- Whitespace-first; hairline dividers.  
- **No decorative glow** on dashboard/admin; marketing may use restrained motion.  
- Light sidebars for `/dashboard` and `/admin` with **3px left accent** on active nav.  
- Prefer **honest empty states** over fake KPIs.

### 8.4 Premium motion (`context/design-premium-recommendations.md`)

- Diagonal rhythm, card lift, subtle shimmer — **must respect `prefers-reduced-motion`** (partially done).

### 8.5 Past inconsistencies (`context/design-audit-2026-04.md`)

- Legacy orange/blue theme and “DataVault” naming **should be fully purged** from any remaining copy/assets.

---

## 9. Internationalization

- **Languages:** English (fallback), French.  
- **Detection:** `localStorage` `researcha-lang`, then browser.  
- **URL strategy:** English paths (`/reports`, `/sectors`); **French aliases** for common paths (`/tarifs`, `/rapports`, `/secteurs`).  
- **Gaps:** Dashboard, admin, and several listing/detail pages still **English-only strings** in components.  
- **SEO:** For FR markets, consider `hreflang` and localized slugs when moving to SSR.

---

## 10. Data, search, RAG, and paywall (planning notes)

### 10.1 Core entities (suggested for schema workshops)

- `profiles` (app user, org link, locale)  
- `organizations` / `subscriptions` / `seats` (Corporate)  
- `plans` / `entitlements` (materialized or computed)  
- `sectors`, `reports`, `report_versions`, `assets` (R2 keys)  
- `purchases`, `invoices`, `payment_events`  
- `search_queries` (optional, RGPD retention)  
- `watchlists`, `alerts`  
- `blog_posts` (or headless CMS IDs)  
- `admin_audit_log`  
- `ai_conversations`, `ai_messages` (with **no** stored secrets; redact if needed)

### 10.2 RAG

- **Ingest:** chunk reports **after** OCR/text extraction; store embeddings in **pgvector**.  
- **Query:** retrieve only chunks where `report_id` passes **entitlement join**.  
- **Answer:** model prompts must require **citation IDs** or “not in your library” behavior.

### 10.3 Search

- **FTS** on title, abstract, tags, sector; **facets** (sector, region, date, access type).  
- **History:** user toggle + retention policy.

---

## 11. Security, compliance, and operations

- **RLS** on all user-scoped tables; **service role** only for workers/admin API.  
- **Signed URLs** for PDFs; short TTL; **watermark** with user/org id in viewer.  
- **RGPD:** export/delete user data; clear policy for search logs and AI logs.  
- **Admin:** MFA recommended; audit all publish/unpublish/price changes.  
- **Rate limits** on AI and search to control cost.

---

## 12. Known gaps, debt, and backlog themes

### 12.1 Product / copy

- **Pricing** features still partially framed as generic SaaS; rewrite to **Simple / Premium / Corporate** and **report quotas**.  
- **Footer** links (About, Contact) may not match routes — audit `Footer.jsx`.  
- **Missing routes** from inventory: `/purchase/success`, `/about`, `/contact`, optional `/legal/licenses`, dedicated **PDF viewer** route.

### 12.2 Engineering

- **No authentication** or **route guards** on `/dashboard` or `/admin`.  
- **Supabase:** migration SQL + browser client stub in repo; **Edge Functions** and **login wiring** still TBD.  
- **No tests** called out in package.json beyond lint (add unit/e2e strategy).  
- **Chunk size** warning on build — consider lazy routes for admin/dashboard/ai.

### 12.3 Design / UX

- Resolve **DM Sans vs Ubuntu** explicitly in design tokens and docs.  
- Ensure **accessible** focus states and contrast on teal/dark hero.

---

## 13. Phased delivery template (suggested)

Use as a starting point for Claude-generated roadmaps:

| Phase | Goal | Example deliverables |
|-------|------|----------------------|
| **P0 — Foundations** | Auth + schema + RLS | Supabase project, `profiles`, report tables, login/signup wired, protected `/dashboard` |
| **P1 — Catalogue** | Real data on public pages | Seed sectors/reports, FTS search, report detail from DB |
| **P2 — Commerce** | Money → entitlement | Stripe + BaridiPay/CIB hooks, checkout, webhook, `my-reports` |
| **P3 — Viewer** | Secure consumption | Watermarked PDF viewer, download rules per plan |
| **P4 — AI** | RAG MVP | Ingestion job, pgvector, `/ai` backend, citation UX |
| **P5 — Admin** | Operations | CRUD, import, audit log, promotions |
| **P6 — Growth** | SEO + email | SSR/SSG or prerender, newsletter, alerts |

---

## 14. Repository structure reference

```
researcha-app/
├── public/                 # logo.png, static assets
├── src/
│   ├── App.jsx             # All routes
│   ├── main.jsx            # ThemeProvider, Router, i18n import
│   ├── theme.js
│   ├── index.css
│   ├── i18n/config.js
│   ├── locales/en.json, fr.json
│   ├── layouts/            # DashboardLayout, AdminLayout
│   ├── pages/              # Feature pages + admin/* + dashboard/*
│   ├── components/         # Header, Footer, BrandLogo, shell/*
│   ├── lib/                # supabaseClient.js
│   └── constants/          # homeImagery.js
├── supabase/migrations/    # PostgreSQL schema (run in Supabase SQL Editor)
├── context/                # This doc + aem-design-tokens.json + SUPABASE_SETUP.md + topic MD files
└── package.json
```

**Sibling folder (non-React):** `researcha design pages and html code/` — static HTML references, not wired to the SPA.

---

## 15. Source documents and traceability

| Document | Location | Status |
|----------|----------|--------|
| AEM technical sheet (HTML) | Repo root: `AEM_Market_Intelligence_Platform_Technical_Sheet.html` | **Primary** functional + visual source |
| `pages_functions.pdf` | Repo root | Binary — manual review |
| `AEM_AI_Agent_Build_Guide.pdf` | Repo root | AI implementation guide — manual review |
| Missing PDFs (charte, cahier des charges, etc.) | Listed in `context/source-documents.md` | **Not in repo** — request from client |

When PDFs are added, place under `context/references/` and update this section.

---

## 16. Glossary

| Term | Meaning |
|------|---------|
| **Entitlement** | Server-enforced right to view/download a report or use a feature. |
| **Paywall** | Gating layer between preview and full content. |
| **RAG** | Retrieval-augmented generation; AI answers using retrieved report chunks. |
| **RLS** | Row-Level Security (PostgreSQL / Supabase). |
| **FTS** | Full-text search. |
| **AEM** | AEM Consulting (brand owner). |

---

## 17. Dashboard & admin — per-page specifications

**Canonical detail** (functionalities, target backend behaviour, and **section-by-section UI** for every screen): [`context/dashboard-admin-routes.md`](dashboard-admin-routes.md). Update that file when you add routes or change layouts.

**Shared shells:** `DashboardLayout.jsx` and `AdminLayout.jsx` — 268px light sidebar, `NavLink` with **3px** `secondary.main` active rail, mobile `Drawer`, top bar (`background.paper`, bottom border). Main content padding scales `xs:2 → md:4`. Cards use `variant="outlined"`, `borderRadius: 2`.

| Path | Page component | Role + main sections (design order) |
|------|----------------|-------------------------------------|
| `/dashboard` | `DashboardOverviewPage` | Hub: header → **plan/quota card** + **continue** (`EmptyState`) → **3 shortcut cards** (Search, AI, Watchlist). |
| `/dashboard/reports` | `DashboardReportsPage` | Header + link to `/my-reports` → single **library card** with `EmptyState`. |
| `/dashboard/watchlist` | `DashboardWatchlistPage` | Header → **card** + `EmptyState` (saved items + alerts when wired). |
| `/dashboard/activity` | `DashboardActivityPage` | Header (retention copy) → **timeline card** + `EmptyState`. |
| `/dashboard/statistics` | `DashboardStatisticsPage` | Header + **plan chip** → **4 metric cards** (quota-related usage) → **trends card** + `EmptyState` (charts when API exists). Gate depth by plan. |
| `/dashboard/billing` | `DashboardBillingPage` | Header → **plan card** (`maxWidth` ~480) + CTAs to checkout/pricing. |
| `/dashboard/settings` | `DashboardSettingsPage` | Header → **form card** (`maxWidth` ~520), notification prefs (save disabled in stub). |
| `/admin` | `AdminOverviewPage` | Header → **3 KPI cards** (counts) → **GA embed** (optional `VITE_GA_ADMIN_EMBED_URL`) → **storage** card. |
| `/admin/reports` | `AdminReportsPage` | **Master card**: toolbar (search, status filter, New) → **table** (responsive column hide) → footer (caption + disabled pagination). |
| `/admin/sectors` | `AdminSectorsPage` | Header → **card** + `EmptyState` (sector CRUD target). |
| `/admin/blog` | `AdminBlogPage` | Header → **card** + `EmptyState` (posts CMS target). |
| `/admin/reports/new` | `AdminReportNewPage` | Header → **narrow form card** (~640), Publish + Cancel. |
| `/admin/reports/:id` | `AdminReportEditPage` | Header (shows id) → **form card**, Save + Back. |
| `/admin/import` | `Navigate` → `/admin` | Removed from nav; legacy bookmark. |
| `/admin/promotions` | `Navigate` → `/admin` | Removed from nav; legacy bookmark. |
| `/admin/users` | `AdminUsersPage` | Header → **card** + `EmptyState` (directory). |
| `/admin/audit` | `AdminAuditPage` | Header → **card** + `EmptyState` (immutable log). |
| `/admin/settings` | `AdminSettingsPage` | Header → **form card** (~560), platform config (stub). |

Route order: declare `/admin/reports/new` **before** `/admin/reports/:reportId` in `App.jsx`.

---

## Appendix A — Quick pointer

Dashboard and admin **route list** also appears in [§5.1](#51-public-and-authenticated-style-routes-srcappjsx). **Full per-page specs:** [§17](#17-dashboard--admin--per-page-specifications) and `dashboard-admin-routes.md`.

---

## Appendix B — JSON design tokens (machine-readable)

The file `context/aem-design-tokens.json` is the canonical structured export of colors, typography roles, radius, and MUI mapping. Automation or LLMs may ingest it alongside this markdown.

---

*End of master context. For smaller updates, edit the relevant `context/*.md` file and bump the version note at the top of this document.*

# Dashboard & Admin — routes, functionalities, and section design

This document describes **every** subscriber dashboard and admin page: **URL**, **source file**, **intended functionalities** (current vs future), and **layout / UI sections** as implemented (design system v2: light shell, hairline borders, `EmptyState` where data is not wired).

**Product split:** **`/admin/*`** is for **staff** managing **all platform content** (reports, sectors, blog, import, promotions, settings) and **all users** (subscribers, plans, entitlements). **`/dashboard/*`** is for **subscribers** only: **plan-specific** data — library, quota, billing, activity, and **statistics scoped to that account** (never cross-tenant). Simple vs Premium controls **which dashboard metrics** appear (API + feature flags).

**Shared note:** `/dashboard/*` and `/admin/*` are **not auth-protected** in the SPA prototype. Production must add guards (e.g. Supabase session + role checks).

---

## Shared layouts

### Subscriber shell — `src/layouts/DashboardLayout.jsx`

| Zone | Design | Content / behaviour |
|------|--------|---------------------|
| **Page canvas** | `minHeight: 100vh`, `bgcolor: background.default` (`#EBECF1`) | Full viewport app shell. |
| **Sidebar** | Width **268px**, `bgcolor: background.paper`, **1px** right border `divider` | Permanent on `md+`; temporary `Drawer` on mobile. |
| **Sidebar header** | Padding, row: **BrandLogo** → home `/` | Close (`X`) on mobile drawer only. |
| **Sidebar section label** | Caption, uppercase tracking: **“Workspace”** | Above nav. |
| **Nav items** | `NavLink` per route; **active**: 3px left border `secondary.main`, light teal bg, bold label | Routes: Overview, Reports library, Watchlist, Activity, **Statistics**, Billing, Settings. |
| **Sidebar footer** | Top border; caption “Plan: Premium (demo)”; link **Manage subscription** → `/pricing` | Replace with real plan from API. |
| **Main top bar** | `bgcolor: paper`, bottom border; **h6** “Dashboard”; **Menu** icon mobile | Right: notifications icon (placeholder), text link **Profile** → `/profile`. |
| **Main content** | `flex: 1`, padding `xs:2 → md:4` | `<Outlet />` renders child page. |

### Admin shell — `src/layouts/AdminLayout.jsx`

| Zone | Design | Content / behaviour |
|------|--------|---------------------|
| **Page canvas** | Same pattern as dashboard | Light gray page bg. |
| **Sidebar** | Same width/border/paper as dashboard | Label: **“Administration”**. |
| **Nav** | Same active-rail pattern | Overview, Reports, **Sectors**, **Blog**, Import, Promotions, Users, Analytics, Audit log, Settings. |
| **Sidebar footer** | **← Back to site** → `/` | |
| **Main top bar** | Title **“Admin”** | Right: notifications icon, **Chip** “Admin” outlined secondary. |
| **Main content** | Same padding | `<Outlet />`. |

### Reusable pattern: `EmptyState` — `src/components/shell/EmptyState.jsx`

| Property | Design |
|----------|--------|
| Container | Centered, `maxWidth: 520`, **dashed** `divider` border, `borderRadius: 2`, vertical padding |
| Typography | **subtitle1** bold title; **body2** secondary description |
| Children | Optional CTAs (buttons) below text |

---

## Subscriber dashboard pages

### `/dashboard` — `DashboardOverviewPage.jsx`

**Role:** Landing hub after login; plan snapshot, resume reading, shortcuts to **statistics**, search, AI, watchlist.

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Page header** | `Stack` spacing 4; first block: **h5** “Welcome back” + **body2** muted intro | Personalized greeting (name), optional announcement banner | Static copy; no user name |
| **Row 1 — Grid** | `Grid` `md=12`: **4** + **8** split | | |
| → **Plan & quota card** | `Card` outlined, `p:3`, full height; **overline** “Plan & quota”; **h6** plan name; caption; **LinearProgress**; caption counts; **Button** → `/dashboard/billing` | Load plan tier (Simple/Premium/Corporate), quota used/total, renewal date from billing API | Demo: “Premium”, 35% bar, “7 of 20” |
| → **Continue card** | `Card` outlined; **subtitle1** “Continue”; wraps **EmptyState** | List last 3 opened reports (title, sector, link to viewer); empty → CTAs | EmptyState only; buttons → `/reports`, `/dashboard/reports` |
| **Row 2 — Quick links** | `Grid` three columns `sm=4`: three equal **Cards** outlined | | |
| → **Search** | Title + description + **Button** → `/search` | Deep link with optional saved query | Static |
| → **AI assistant** | Same → `/ai` | Open chat; respect plan (Simple may disable or limit) | Static |
| → **Watchlist** | Same → `/dashboard/watchlist` | — | Static |

---

### `/dashboard/statistics` — `DashboardStatisticsPage.jsx`

**Role:** **Plan-scoped** usage and trends for the signed-in subscriber only (contrast with **Admin → Overview**, where cross-tenant traffic is shown via an embedded GA4 / Looker Studio dashboard).

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **Chip** (current plan) + **body2** | Load tier from `profiles` / billing; **Simple** may hide widgets or show upgrade CTA | Demo chip “Premium (demo)” |
| **Metric row** | `Grid` 4× **Card** outlined (`md=3`) | Counters: reports opened, searches, AI messages, exports — **filtered by `user_id`** and plan period | Placeholder “—” |
| **Trends** | `Card` + **subtitle1** + **EmptyState** | Time-series charts (Recharts etc.) from events table; respect retention | EmptyState + link to pricing |

---

### `/dashboard/reports` — `DashboardReportsPage.jsx`

**Role:** In-app mirror of **entitled library**; canonical detailed list may stay on `/my-reports`.

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** with inline link **My reports** → `/my-reports` | Explain relationship dashboard vs my-reports | Implemented |
| **Library panel** | Single `Card` outlined; **EmptyState** inside | Table or cards: report title, access type, date purchased, **Open** / **Download** (signed URL); filter by sector | EmptyState + CTAs → `/my-reports`, `/reports` |

---

### `/dashboard/watchlist` — `DashboardWatchlistPage.jsx`

**Role:** Saved sectors/reports + notification preferences.

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** (alerts copy) | — | Static |
| **Content** | `Card` + **EmptyState** | List watched items with **Remove**; toggles: email digest, instant alerts; “Add from catalogue” picker | EmptyState; CTA → `/sectors` |
| **Future** | Optional second card | Suggested sectors based on history | — |

---

### `/dashboard/activity` — `DashboardActivityPage.jsx`

**Role:** GDPR-aware **activity timeline** (searches, opens, exports).

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** (retention notice) | Link to privacy settings; **Clear history** with confirm | Static copy |
| **Timeline** | `Card` + **EmptyState** | Chronological list: type icon, label, timestamp, link to resource; retention TTL from policy | EmptyState; CTA → `/search` |

---

### `/dashboard/billing` — `DashboardBillingPage.jsx`

**Role:** Subscription, payment method, invoices, upgrade/downgrade.

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** (CIB / BaridiPay mention) | — | Static |
| **Plan card** | `Card` outlined, `maxWidth: 480`; subtitle “Current plan”; **h6**; **Divider**; explanation; **Stack** buttons | Embedded Stripe/customer portal link; list invoices PDF; **Change plan** → `/pricing` | Demo plan + placeholder text; buttons → `/checkout`, `/pricing` |

---

### `/dashboard/settings` — `DashboardSettingsPage.jsx`

**Role:** Workspace preferences (not full profile — `/profile`).

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** (points to `/profile` for identity) | — | Static |
| **Form card** | `Card` `maxWidth: 520`; **TextField** email (notification); digest field; **Save** disabled | Persist `profiles` notification prefs; respect verified email; i18n default language sync with `researcha-lang` | Fields disabled; “Save (soon)” |

---

## Admin back-office pages

### `/admin` — `AdminOverviewPage.jsx`

**Role:** Entry point for **full platform operations** — content (reports, sectors, blog, import, promos) and **all users**; **honest** KPIs (no fake revenue).

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** (KPI policy) | — | Static |
| **KPI row** | `Grid` 3× **Card** outlined on `sm` | Counts: **Reports (all)**, **Published reports**, **Profiles** from Supabase | Implemented |
| **Traffic** | `Card` + **iframe** (optional) | Embed **Looker Studio** report (GA4) when `VITE_GA_ADMIN_EMBED_URL` is set | Instructions when unset |
| **Storage** | `Card` + **AdminStorageUsage** | Used bytes (RPC) vs quota env | Implemented |

---

### `/admin/reports` — `AdminReportsPage.jsx`

**Role:** CRUD list for catalogue reports.

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Page title** | **h5** “Reports” | — | |
| **Master card** | Single `Card` outlined, no outer shadow | | |
| → **Toolbar** | `Box` bottom border; row wraps on mobile: title “Catalogue” + subtitle; **TextField** search; **Select** status; **Button** New → `/admin/reports/new` | Server-side filter + search debounce; bulk actions when checkboxes enabled | UI only; checkboxes disabled |
| → **Table** | `Table` `size="small"`; responsive hide columns (`xs/sm/md`) | Columns: select, ID, title, sector, status, views, actions | Sample 5 rows |
| → **Status chips** | Outlined; color hints Published / Draft / Review | — | |
| → **Row actions** | Preview → public `/reports/1`; Edit → `/admin/reports/:id`; Delete (icon, sm+) | Preview uses real slug; delete confirm + audit | Delete inert |
| → **Footer bar** | Border top; caption row count; **Pagination** | Server pagination | Pagination disabled |

---

### `/admin/sectors` — `AdminSectorsPage.jsx`

**Role:** **Content** — manage sector taxonomy for the public catalogue (not subscriber-specific).

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** | CRUD sectors: name, slug, description, order, featured; block delete if reports attached | Stub copy |
| **Content** | `Card` + **EmptyState** | Data grid or tree + editor drawer | Empty |

---

### `/admin/blog` — `AdminBlogPage.jsx`

**Role:** **Content** — editorial posts for `/blog`.

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** | Posts list, draft/publish, SEO fields, scheduling | Stub copy |
| **Content** | `Card` + **EmptyState** | Rich text / MD, preview, audit on publish | Empty |

---

### `/admin/reports/new` — `AdminReportNewPage.jsx`

**Role:** Create draft report metadata (+ future file upload).

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** (R2, paywall) | — | |
| **Form card** | `maxWidth: 640`, `Stack` fields | **Title**, **Slug** (auto from title), **Sector** (FK), **Summary**, **Price** / **visibility**, **PDF upload** to R2, **Save draft** POST | Partial fields; Save disabled |
| **Actions** | **Save draft** (secondary contained), **Cancel** → list | Validate Zod/schema; redirect to edit on success | Cancel works |

---

### `/admin/reports/:reportId` — `AdminReportEditPage.jsx`

**Role:** Edit existing report; publish workflow.

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** shows `reportId` from URL | Breadcrumb back to list | |
| **Form card** | `maxWidth: 640` | Load by ID; **Title**, **Status** select, **Preview % free**; tabs future: **Assets**, **SEO**, **Pricing** | Demo defaults; Save disabled |
| **Actions** | **Save**, **Back to list** | Optimistic UI + audit log entry | Back works |

---

### ~~`/admin/import`~~ / ~~`/admin/promotions`~~ — removed

These admin routes and sidebar entries were **removed** from the product UI. Old URLs redirect to `/admin`. Any future bulk ingest, coupons, or featured slots can ship under new routes (e.g. payment / product tooling).

---

### `/admin/users` — `AdminUsersPage.jsx`

**Role:** **All platform users** — subscriber directory, plans, entitlements (read-heavy; sensitive).

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** (RLS warning) | — | |
| **Content** | `Card` + **EmptyState** | Table: email, plan, seats, org, created; filters; **Impersonate** (optional, audited); **Adjust entitlement** / suspend; never expose passwords | Sync disabled |

---

### ~~`/admin/analytics`~~ (removed)

**Cross-tenant traffic** is shown on **`/admin`** (Overview) via **`AdminGoogleAnalyticsEmbed`**: set **`VITE_GA_ADMIN_EMBED_URL`** to a Looker Studio **Embed report** URL (`https://…`). The legacy path **`/admin/analytics`** redirects to **`/admin`**.

---

### `/admin/audit` — `AdminAuditPage.jsx`

**Role:** Immutable admin action trail.

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** (what to log) | — | |
| **Content** | `Card` + **EmptyState** | Table: timestamp, actor, action, entity id, diff JSON; export CSV; filter | Empty |

---

### `/admin/settings` — `AdminSettingsPage.jsx`

**Role:** Platform config (non-user).

| Section | Layout / design | Functionalities (target) | Current state |
|---------|-----------------|---------------------------|---------------|
| **Header** | **h5** + **body2** (flags, webhooks) | — | |
| **Form card** | `maxWidth: 560` | **Public site URL**, webhook endpoints, feature flags toggles, email provider keys (masked) | Two disabled fields; Save disabled |

---

## Route order reminder (React Router)

Under `/admin`, declare **`reports/new` before `reports/:reportId`** so `new` is not captured as an id.

---

## Cross-links (product)

| User goal | Primary routes |
|-----------|----------------|
| Buy / upgrade | `/pricing`, `/checkout` |
| Read entitled content | `/my-reports`, `/reports/:id` |
| AI | `/ai` |
| Marketing exit | Sidebar logo / admin “Back to site” → `/` |

---

*Last updated with `researcha-app` source (dashboard + admin pages and layouts).*

# Researcha — page directories & platform links

This document lists **where page components live** in the repo and **which URL paths** the React app registers (`src/App.jsx`), plus the **distinct in-app link targets** used across headers, footers, layouts, and pages.

---

## 1. Page component directories

All routable screens are implemented under **`src/pages/`**:

| Directory | Purpose |
|-----------|---------|
| `src/pages/` | Public and auth pages (home, catalogue, blog, checkout, legal, search, profile, etc.) |
| `src/pages/dashboard/` | Authenticated **user dashboard** (nested under `/dashboard`) |
| `src/pages/admin/` | **Admin console** (nested under `/admin`, gated by `RequireAdmin`) |

There are no other subfolders under `src/pages` besides `dashboard` and `admin`.

---

## 2. Route map (canonical paths → page file)

Sources: `src/App.jsx` (routes), imports resolve to files under `src/pages/`.

### `src/pages/` (root)

| URL path | Page component |
|----------|----------------|
| `/` | `HomePage.jsx` |
| `/pricing` | `PricingPage.jsx` |
| `/login` | `LoginPage.jsx` |
| `/admin/login` | `AdminLoginPage.jsx` |
| `/signup` | `SignupPage.jsx` |
| `/forgot-password` | `ForgotPasswordPage.jsx` |
| `/sectors` | `SectorsListingPage.jsx` |
| `/sectors/:id` | `SectorDetailPage.jsx` |
| `/reports` | `ReportsListingPage.jsx` |
| `/reports/:id` | `ReportDetailPage.jsx` |
| `/profile` | `ProfilePage.jsx` (requires auth) |
| `/ai` | `AIAgentPage.jsx` |
| `/blog` | `BlogListingPage.jsx` |
| `/blog/:slug` | `BlogPostPage.jsx` |
| `/my-reports` | `MyReportsPage.jsx` (requires auth) |
| `/checkout` | `CheckoutPage.jsx` |
| `/terms` | `TermsPage.jsx` |
| `/privacy` | `PrivacyPage.jsx` |
| `/search` | `SearchPage.jsx` |

### `src/pages/dashboard/`

Parent layout: `DashboardLayout` at **`/dashboard`** (requires auth). Child routes:

| URL path | Page component |
|----------|----------------|
| `/dashboard` | `DashboardOverviewPage.jsx` (index) |
| `/dashboard/reports` | `DashboardReportsPage.jsx` |
| `/dashboard/watchlist` | `DashboardWatchlistPage.jsx` |
| `/dashboard/activity` | `DashboardActivityPage.jsx` |
| `/dashboard/statistics` | `DashboardStatisticsPage.jsx` |
| `/dashboard/billing` | `DashboardBillingPage.jsx` |
| `/dashboard/settings` | `DashboardSettingsPage.jsx` |

### `src/pages/admin/`

Parent layout: `AdminLayout` at **`/admin`** (requires admin). Child routes:

| URL path | Page component |
|----------|----------------|
| `/admin` | `AdminOverviewPage.jsx` (index) |
| `/admin/reports` | `AdminReportsPage.jsx` |
| `/admin/sectors` | `AdminSectorsPage.jsx` |
| `/admin/blog` | `AdminBlogPage.jsx` |
| `/admin/reports/new` | `AdminReportNewPage.jsx` |
| `/admin/reports/:reportId` | `AdminReportEditPage.jsx` |
| `/admin/users` | `AdminUsersPage.jsx` |
| `/admin/audit` | `AdminAuditPage.jsx` |
| `/admin/settings` | `AdminSettingsPage.jsx` |

---

## 3. Redirects & aliases (still “links” to pages)

Defined in `src/App.jsx`:

| Path | Behavior |
|------|----------|
| `/methodology` | Redirects to `/` with hash `#methodology` |
| `/corporate` | Redirects to `/` with hash `#corporate` |
| `/tarifs` | Redirects to `/pricing` |
| `/rapports` | Redirects to `/reports` |
| `/secteurs` | Redirects to `/sectors` |
| `/secteurs/:id` | `RedirectSecteur` → `/sectors/:id` |
| `/admin/import`, `/admin/promotions` | Redirect to `/admin` (legacy URLs) |
| `/admin/analytics` | Redirect to `/admin` (charts live on Overview — set `VITE_GA_ADMIN_EMBED_URL`) |
| `*` (unknown) | Redirects to `/` |

---

## 4. Dynamic & query patterns used in links

| Pattern | Meaning |
|---------|---------|
| `/reports/{slugOrId}` | Public report detail; built via `reportPublicPath()` in `src/lib/reportPath.js` (prefers `slug`, else `id`) |
| `/sectors/{slug}` | Sector detail (listings and breadcrumbs use sector `slug` as `:id` segment) |
| `/blog/{slug}` | Blog post |
| `/admin/reports/{reportId}` | Admin report editor |
| `/search?q=…` | Search results (from header / home search submit) |
| `/checkout?plan=…` | Checkout with plan query (from pricing CTAs) |
| `/#methodology`, `/#corporate` | Same route as `/` with hash (footer, login, pricing) |

---

## 5. Distinct platform paths linked in the UI

These are the **pathnames** you will see in `<Link to="…">`, `<NavLink>`, `<Navigate to>`, or `navigate('…')` across the app (static segments). Dynamic segments are noted in §4.

**Public & marketing**

- `/`
- `/sectors`
- `/reports`
- `/pricing`
- `/blog`
- `/ai`
- `/terms`
- `/privacy`
- `/search`
- `/checkout`

**Auth**

- `/login`
- `/signup`
- `/forgot-password`
- `/admin/login`

**Authenticated user**

- `/dashboard` and `/dashboard/reports`, `/dashboard/watchlist`, `/dashboard/activity`, `/dashboard/statistics`, `/dashboard/billing`, `/dashboard/settings`
- `/profile`
- `/my-reports`

**Admin**

- `/admin` and `/admin/reports`, `/admin/reports/new`, `/admin/sectors`, `/admin/blog`, `/admin/users`, `/admin/audit`, `/admin/settings`

**Primary navigation config**

- **Header** (`src/components/Header.jsx`): `/sectors`, `/reports`, `/blog`, `/pricing`, `/ai`; logged-in: `/profile`, `/my-reports`; `/login`, `/pricing`; search → `/search?q=…`
- **Footer** (`src/components/Footer.jsx`): `/`, `/reports`, `/sectors`, `/pricing`, `/blog`, `/#methodology`, `/#corporate`, `/my-reports`, `/terms`, `/privacy`
- **Dashboard sidebar** (`src/layouts/DashboardLayout.jsx`): all `/dashboard/…` items in §2 plus `/`, `/pricing`
- **Admin sidebar** (`src/layouts/AdminLayout.jsx`): all `/admin/…` items in §2 plus `/`

---

## 6. File index by directory

### `src/pages/`

- `AdminLoginPage.jsx`, `AIAgentPage.jsx`, `BlogListingPage.jsx`, `BlogPostPage.jsx`, `CheckoutPage.jsx`, `ForgotPasswordPage.jsx`, `HomePage.jsx`, `LoginPage.jsx`, `MyReportsPage.jsx`, `PricingPage.jsx`, `PrivacyPage.jsx`, `ProfilePage.jsx`, `ReportDetailPage.jsx`, `ReportsListingPage.jsx`, `SearchPage.jsx`, `SectorDetailPage.jsx`, `SectorsListingPage.jsx`, `SignupPage.jsx`, `TermsPage.jsx`

### `src/pages/dashboard/`

- `DashboardActivityPage.jsx`, `DashboardBillingPage.jsx`, `DashboardOverviewPage.jsx`, `DashboardReportsPage.jsx`, `DashboardSettingsPage.jsx`, `DashboardStatisticsPage.jsx`, `DashboardWatchlistPage.jsx`

### `src/pages/admin/`

- `AdminAuditPage.jsx`, `AdminBlogPage.jsx`, `AdminOverviewPage.jsx`, `AdminReportEditPage.jsx`, `AdminReportNewPage.jsx`, `AdminReportsPage.jsx`, `AdminSectorsPage.jsx`, `AdminSettingsPage.jsx`, `AdminUsersPage.jsx`

---

*Generated from the Researcha app router and link usage. Update this file when you add routes in `src/App.jsx` or new primary nav entries.*

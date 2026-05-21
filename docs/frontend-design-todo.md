# Researcha — frontend & design todo list

Scope: **UI, layout, styling, and client-side behavior** in the React app. Backend/API work is mentioned only where the frontend must **expose** a screen or state (e.g. forms, empty states); implementation of servers, webhooks, or Supabase logic is out of scope here.

---

## Global layout & chrome

### Top navigation (navbar)

- [ ] Remove or soften the **darker band / shadow / extra layer** directly under the fixed top navbar so the hero or page content does not read as “stacked” under the bar.
- [ ] Ensure **no stray elements** (pseudo-elements, duplicate toolbars, or overlapping blocks) sit in the gap between the navbar and the first section; spacing should be intentional and consistent across pages.
- [ ] Align **visual weight** of the bar with the rest of the brand (teal / navy) without a heavy underlay.

### Brand logo (site-wide where applicable)

- [ ] Replace generic or placeholder **“Researcha” mark** in the header with the **official logo** asset (correct aspect ratio, crisp on retina).
- [ ] On the **AI assistant** experience specifically: use the same official logo in the top bar and treat it as a **sidebar toggle** (slide in/out), not only as static branding.

---

## Homepage (`/`)

### Remove section

- [ ] **Delete** the full block titled **“Access the world’s most comprehensive data platform”** (headline, supporting copy, bullet list with checkmarks, CTA such as “Start for free,” and the **dashboard / chart preview image** on the right). After removal, adjust **vertical rhythm** so the previous and next sections do not leave an awkward gap.

### “Explore topics & industries” (categories)

- [ ] **Fix** the **CATEGORIES** strip: label, teal accent line, headline **“Explore topics & industries,”** subcopy, and **“View all topics →”** button — alignment, spacing, and typography hierarchy vs. the rest of the homepage.
- [ ] **Carousel / slider:** left/right controls should be **visible, reachable, and consistent** (size, hover, focus states). Prevent layout shift when sliding; ensure **touch-friendly** targets on mobile.
- [ ] Cards should match the **intended reference**: image (Economy / Technology / Health style), **title**, **stat count line** (e.g. “124k stats”), and **icon** per category; gradient/readability on images should match brand.
- [ ] Verify **“View all topics”** routes to the real sectors/topics listing and matches copy.

### “Sector choosing to buy” (new homepage section)

- [ ] Add a **new section** (name in UI can match product copy, e.g. sector subscription picker) presenting **sectors as purchasable tiles/cards** in a layout **consistent with the category carousel** (imagery, labels, optional stat line).
- [ ] Per sector: show **price or “from” price** when data is available; design **empty/loading** states if prices are not yet loaded.
- [ ] Clear **CTA** per sector (e.g. “Subscribe,” “Select,” “Learn more”) and a path toward checkout or contact — **buttons and layout only** in this doc.

### Featured statistics

- [ ] In **“Featured statistics”**, **feature the latest / last reports** from the catalogue (card layout, thumbnails, titles) instead of or in addition to static placeholder stats — **frontend wiring** to whatever API or props exist; use skeletons while loading.

### Popular search tags

- [ ] **“Popular” chips** under the hero search should eventually reflect **sales-driven popularity**; until data exists, design **fallback ordering** and labels so the row does not look random.
- [ ] Styling: chip size, wrap on small screens, and contrast on **dark hero** background.

### Content moved from pricing

- [ ] **Move the last two sections** of the **`/pricing`** page onto the **homepage** (copy, layout, spacing). Remove duplicates from `/pricing` or replace with a short “See homepage” link if product prefers a single source of truth — **design decision**: avoid repeating the same long blocks on both URLs without visual hierarchy.

### Methodology simulator

- [ ] **Redesign** the methodology / simulator block (dropdowns, submit, spacing) so it feels **more premium and legible** — clearer labels, field grouping, button prominence, and responsive stacking.

### Corporate / B2B block

- [ ] Add a **professional B2B image** beside the **corporate services** form (split layout: image + form on desktop; stacked on mobile with sensible order).
- [ ] Tune form container (radius, shadow, padding) so it pairs well with the new image and **AEM / corporate** positioning.

### Landing polish (reference page parity)

- [ ] **Teal accent** usage consistent across primary buttons and key links.
- [ ] **Featured statistics** cards: improve **type scale** for small text if it is hard to read.
- [ ] **Vertical spacing** between major sections (e.g. popular reports vs. pricing): even out section padding/margins.
- [ ] **Responsive:** three-column grids (featured stats, pricing) need a clear **stack order** and readable card widths on small viewports.

---

## Pricing page (`/pricing`)

- [ ] After moving the **last two sections** to the homepage, **tighten** `/pricing` layout so the page does not feel empty — optional shortened intro or cross-link.
- [ ] **Fix frontend price display** so amounts and formatting are **consistent** with what admins configure and with what appears on **report** surfaces (currency, decimals, “/mo” vs one-time). Same **number** and **labeling** rules app-wide (design + component props).

---

## Reports listing & report detail

### Reports listing (`/reports`)

- [ ] Add **filters UI** (e.g. sector, price range, date, sort) — layout, chips, drawer vs. bar, and mobile behavior.
- [ ] **Empty / no results** state when filters exclude everything.

### Report detail

- [ ] **Preview constraint:** only the **first page** (or first viewport) of the report PDF/content is visible in the main viewer; rest behind paywall — **masking, blur, or height-limited iframe** as a **frontend** pattern with clear “Unlock” CTA.
- [ ] **Thumbnail** per report in cards and detail header (image placeholder if missing).
- [ ] **PDF upload UI** surfaced **alongside** the AI assistant workflow where product requires (split panel, tab, or modal) — layout and progress states only in this doc.

---

## Search (`/search`)

- [ ] Hero or global search: placeholder and **Popular** row aligned with homepage behavior when reused.
- [ ] If “popular” is driven by sales later, ensure the **search results page** can show **related** or **trending** side content without breaking layout.

---

## Blog

- [ ] **Fix blog article layout bug:** long unbroken strings (e.g. placeholder **“G…”** or bad CMS output) must **wrap** or **truncate** with `word-break` / `overflow-wrap` so the article column does not **overflow** the viewport.
- [ ] Review **prose** styles: max-width, line-height, and heading spacing for **NEWS** tag + date + title + body.
- [ ] **Remove all blog sample / demo content** from the UI pipeline (seed fixtures, hardcoded posts, or mock arrays used only for demos) so production builds do not show fake articles unless intentional.

---

## User dashboard (`/dashboard` and nested routes)

### Overview cards

- [ ] **Move the four shortcut cards** (Statistics, Search, AI assistant, Watchlist) **higher** on the overview page (less dead space above them).
- [ ] Card grid: consistent heights, icon/label alignment, and **responsive** columns.

### Watchlist behavior

- [ ] **Toggle** watchlist membership (on/off) instead of **adding a duplicate** every time the user presses add — **UI state** reflects “following” vs “not following”; single clear control.
- [ ] Visual feedback: toast/snackbar, icon change, or filled vs outline heart/star.

---

## AI assistant page (`/ai`)

### Layout

- [ ] **Remove the right sidebar** entirely; main content uses full width (or a single column) per new spec.
- [ ] **Left sidebar:** remove **“Saved queries”** (and any related empty panels).

### Bottom bar / account strip

- [ ] Replace **“storage”** style indicator with a compact summary: **usage limit**, **plan name**, and **account / display name** (typography hierarchy, truncation for long names).

### First visit vs. returning

- [ ] **First entry:** layout evokes **Claude-style** minimalism — **centered** conversation area, generous whitespace, restrained chrome.
- [ ] After the user starts chatting (or on subsequent visits — define rule in implementation), **move the composer to the bottom** (classic chat dock) with a smooth transition, not a jarring jump.

### Header

- [ ] Official **logo** in the top bar; **clicking logo toggles** left sidebar open/closed (with accessible `aria-expanded` and focus trap if needed).

---

## Profile (`/profile`)

- [ ] Ensure any **plan / usage** snippets align with dashboard and AI page wording after dashboard copy updates.

---

## Admin (`/admin` and nested routes)

### Navigation & routes

- [x] **Remove** route and sidebar entry for **`/admin/import`** (legacy URL redirects to `/admin`).
- [x] **Remove** route and sidebar entry for **`/admin/promotions`** (legacy URL redirects to `/admin`).
- [x] Remove **orphan links** elsewhere in the app that still point to these paths _(nav clean; `/admin/import` and `/admin/promotions` redirect to `/admin`)._

### Reports & sectors UI

- [ ] **Image fields** in admin UIs for **reports** and **sectors** (upload, crop preview, alt text optional, clear errors) — layout and form design.
- [ ] Align forms with **public** cards (thumbnails on listing and detail).

### New or expanded admin screens (frontend shells)

- [ ] **Payment & product management** page: tables or cards for products, prices, sectors, reports — filters, tabs, and edit drawers as designed.
- [ ] **Sector subscription pricing** editor UI (per sector).
- [ ] **Per-report pricing** editor UI.
- [ ] **Payment verification / receipts** page: list of pending uploads, **receipt preview** (image/PDF thumbnail), status badges (pending / approved / rejected), actions for admin — **layout and states**; file upload component styling.
- [ ] **AI settings** page: sections for model/temperature/RAG toggles (placeholders acceptable), save bar, and help text.
- [ ] **PDF upload** admin UI aligned with **AI / ingestion** copy (labels, steps, progress).

### Admin traffic (Overview — GA4 / Looker Studio)

- [x] **Embedded dashboard** on **`/admin`**: `AdminGoogleAnalyticsEmbed` + `VITE_GA_ADMIN_EMBED_URL` (Looker Studio **File → Embed report**). Legacy **`/admin/analytics`** redirects to **`/admin`**.

---

## Cross-cutting “systems” (frontend surfaces only)

Summarized from notes as **what users see**:

| Area | Frontend deliverables |
|------|------------------------|
| **Payments** | Checkout refinement, receipt upload dropzone, status messaging, admin verification queues (screens above). |
| **AI / RAG** | Chat layout changes above; any “sources” or citation panel styling if shown in-app. |
| **PDF** | Upload controls, progress, error states on report and admin flows. |
| **Report search** | Filters, sort, chips, and results card layout on `/search` and `/reports`. |

---

## Acceptance checklist (quick QA)

- [ ] No horizontal scroll on blog article on narrow viewports.
- [ ] Direct URL loads (e.g. `/admin/login`, `/blog/slug`) work after hosting SPA rewrites (see `vercel.json` if deployed on Vercel).
- [ ] Navbar does not cast a heavy “second bar” under itself on home, pricing, blog, and AI pages.
- [ ] Watchlist control cannot stack duplicate entries from repeated clicks.
- [x] Removed admin import/promotions routes: **redirect** to `/admin`, sidebar links removed.

---

*Sourced from your design notes (homepage sections, dashboard, AI assistant, admin, blog, navbar, search/popular, reports, and landing polish). Adjust priorities with your product owner.*

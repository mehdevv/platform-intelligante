# Manual bank-transfer (RIB) payments

This document describes the end-to-end manual payment flow that replaces the
mock Stripe / CIB checkout. Clients pay by bank transfer to the platform's
RIB and upload a receipt; admins review the receipt and grant access.

## Migration

`supabase/migrations/20260527120000_payments_rib_receipts.sql` introduces:

- `public.sectors`
  - `subscription_price_cents int not null default 0` — DZD price per month.
  - `currency text not null default 'DZD'` — currency code for sector prices.
- `public.user_report_entitlements`
  - `report_id` is now nullable.
  - new `sector_id uuid references public.sectors(id) on delete cascade`.
  - check constraint: at least one of `report_id` / `sector_id` is set.
  - unique partial indexes per `(user_id, report_id)` and `(user_id, sector_id)`.
- `public.has_report_entitlement(p_report_id)` returns `true` when the user has
  either a row for the report or an active row for the report's sector
  (subscription model). The existing `report_assets` and `report_chunks` RLS
  policies already use this function — no further storage-policy change.
- New `public.payment_requests` table with RLS:
  - users can `select`/`insert` their own pending requests;
  - staff (`admin` or `editor`) can `select`/`update`/`delete` any.
- `public.platform_settings` policy `platform_settings_public_read` allows
  anyone to read the `bank_rib` row (so the checkout page can render it). All
  other write/admin keys remain admin-only via `platform_settings_admin`.
- Seeds an empty `bank_rib` settings row so the admin UI loads cleanly.
- Storage bucket **`payment-receipts`** (private, 10 MB cap, images + PDF).
  - Insert restricted to objects whose path starts with `auth.uid()/`.
  - Read restricted to the owner or any staff profile.
  - Update/delete restricted to staff.

Apply the migration with `npx supabase db push` (or via the dashboard SQL
editor) before deploying the new frontend.

## Frontend wiring

### New libs

- `src/lib/platformSettings.js` — `getBankRib(supabase)` / `saveBankRib(...)`
  helpers around the `bank_rib` settings row (`bank_name`, `account_holder`,
  `rib`, `iban`, `swift`, `notes`).
- `src/lib/paymentReceiptUpload.js` — `uploadPaymentReceipt(supabase, userId,
  file)` writes to `payment-receipts/{userId}/{uuid}-{safeName}` and returns
  the storage path. `getReceiptSignedUrl(supabase, path, expiresIn)` builds a
  short-lived URL for the admin review panel.

### Admin

- `/admin/settings` (`src/pages/admin/AdminSettingsPage.jsx`) — edit the RIB
  fields shown on the public checkout page.
- `/admin/sectors` — new **Monthly subscription price (DZD)** field on the
  create/edit forms (`subscription_price_cents`). The Sectors table now shows
  the formatted monthly price per row.
- `/admin/payments` (`src/pages/admin/AdminPaymentsPage.jsx`) — moderation
  queue with **Pending / Approved / Rejected** tabs.
  - Approving a `kind = 'report'` request inserts or updates a
    `user_report_entitlements` row with `source = 'purchase'` (no PostgREST
    `upsert` — partial unique indexes do not match `ON CONFLICT`).
  - Approving a `kind = 'sector_subscription'` request inserts or updates a row with
    `source = 'subscription'` and `expires_at = now() + 30 days`.
  - Approve and reject both update the request to the new status, record
    `reviewed_at` and `reviewed_by`, save the admin note, and write an `admin_audit_log` entry.

### Public

- `/pricing` is rewritten as a horizontal sector subscription carousel. Cards
  load from `sectors` where `is_published = true` and
  `subscription_price_cents > 0`, sorted by `sort_order, name`. Arrow buttons
  scroll the strip; cards use CSS `scroll-snap-type: x mandatory`. The hero,
  per-card benefits, and the "Need a single report?" callout pull strings from
  the new `pricing.sectorCarousel.*` i18n keys.
- `/checkout` accepts either `?reportId=...` or `?sectorId=...`. It shows:
  1. The amount due, target item, and 30-day note (sector mode only).
  2. The platform RIB with copy-to-clipboard buttons.
  3. The receipt upload form (images + PDF, ≤ 10 MB).
  4. After submission, a confirmation panel that deep-links to
     `/dashboard/payments`.
  - If the user is signed out, the page shows a sign-in CTA and preserves the
    target via `navigate('/login', { state: { redirectTo } })`.
  - If `bank_rib` is empty (or missing both `rib` and `iban`), the page warns
    "Payment not configured yet" and disables the submit button.
- `/sectors/:slug` — sector header now shows either a green
  **Subscribed — full sector access** chip (when an active sector entitlement
  exists for the user) or a **Subscribe** CTA + price.
- `/reports/:id` — sidebar CTAs are now **Buy this report**
  (`/checkout?reportId=...`) and **Subscribe to {sector}**
  (`/checkout?sectorId=...`). The entitlement check accepts either a row for
  the report or an active row for its sector.

### Dashboard

- `/dashboard/payments` (`src/pages/dashboard/DashboardPaymentsPage.jsx`)
  lists the user's `payment_requests` with kind, amount, status pill, the
  admin note (especially useful when rejected), and links back to the
  target sector or report. The Dashboard sidebar (`DashboardLayout.jsx`) and
  the Overview page get a card pointing here.

## Supabase configuration checklist

1. Apply migration `20260527120000_payments_rib_receipts.sql`.
2. Open the **Admin → Settings** page and fill the bank RIB. Until both
   `bank_name` and at least one of `rib` / `iban` are saved, the checkout
   page disables submission.
3. In **Admin → Sectors**, set a monthly **Subscription price (DZD)** on every
   sector that should appear in the pricing carousel.
4. Make sure each `profiles.app_role` for users acting as reviewers is set to
   `admin` (or `editor`) — staff status is what unlocks `/admin/payments`,
   receipt downloads, and the entitlement-write permission.
5. Optional: schedule a daily job (e.g. Supabase Edge Function or pg_cron) to
   notify staff about pending `payment_requests` older than 24 hours.

## Operational notes

- **30-day rule.** Sector subscriptions are *not* auto-renewed. When a
  subscription expires, the client uploads a new receipt and the admin
  re-approves. The approval flow updates the same `(user_id, sector_id)` row
  so the expiry timestamp is refreshed without duplicating entitlements.
- **One-off reports** create permanent entitlements (no `expires_at`).
- The `payment-receipts` bucket holds personally identifiable financial
  documents — it is private, signed URLs only, and never exposed in any
  public link in the frontend.
- The `bank_rib` setting is public-readable on purpose (the checkout page
  needs it). Keep that row dedicated to non-sensitive display data: it should
  never contain a password, OTP, or token. All other platform settings remain
  admin-only.

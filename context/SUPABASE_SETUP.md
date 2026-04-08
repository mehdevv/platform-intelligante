# Supabase — credentials, what to share, and schema

## What you need from the Supabase dashboard

Create a project at [supabase.com](https://supabase.com), then collect:

| Item | Where | Use |
|------|--------|-----|
| **Project URL** | Settings → API → **Project URL** | `VITE_SUPABASE_URL` in the SPA (public). |
| **anon public key** | Settings → API → **Project API keys** → `anon` `public` | `VITE_SUPABASE_ANON_KEY` in the SPA (public). Safe to embed in frontend; access is limited by **RLS**. |
| **service_role key** | Same page → `service_role` **secret** | **Server-side only** (Edge Functions, your backend, webhooks). **Never** commit it or paste it into chat. Bypasses RLS. |

Optional for local tooling:

| Item | Use |
|------|-----|
| **Database password** | Settings → Database; for direct `psql` / GUI. |
| **JWT secret** | Advanced; rarely needed in app code. |

### What to give another developer or an AI assistant

- **OK to share:** Project URL, **anon** key (they are not secrets in the same way as `service_role`).
- **Do not share:** `service_role` key, database password, or any private webhook signing secrets.
- **To integrate the app:** a redacted `.env.example` is enough; each developer copies `.env` locally with real `VITE_*` values.

## Enable extensions (before or after SQL)

In **Database → Extensions**, enable:

- **vector** — for `report_chunks.embedding` and RAG (required for the migration as written).
- **pgcrypto** — usually already enabled (`gen_random_uuid()`).

If you want to run **without** AI/RAG first, comment out in the migration file: the `create extension vector` line and the entire `report_chunks` table block (and related RLS policies), then add them later.

## Apply the schema

1. Open **SQL Editor** → New query.
2. Paste the full contents of:

   `researcha-app/supabase/migrations/20260408120000_researcha_initial.sql`

3. Run once. Fix any error (e.g. extension name) and re-run idempotent parts if needed.

Alternatively, with [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase db push` from the repo root (after linking the project).

## First admin user

After you sign up once in **Authentication**:

1. **Authentication → Users** → copy the user’s **UUID**.
2. Run in SQL Editor:

```sql
update public.profiles
set app_role = 'admin'
where id = 'PASTE-YOUR-USER-UUID-HERE';
```

Editors (content team) can use `editor` instead of `admin` (`platform_settings` remains **admin-only**).

## Environment variables (Vite)

Copy `researcha-app/.env.example` to `researcha-app/.env` and fill:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Restart `npm run dev` after changes.

## Data model (summary)

Aligned with `PLATFORM_MASTER_CONTEXT_FOR_SYSTEM_PLANNING.md` §10.1:

| Area | Tables |
|------|--------|
| Identity | `profiles` (1:1 `auth.users`), `organizations`, `organization_members` |
| Catalogue | `sectors`, `reports`, `report_assets` (preview vs full PDF paths) |
| Commerce | `subscriptions`, `purchases`, `invoices`, `payment_events` (webhook log) |
| Access | `user_report_entitlements` |
| Subscriber | `watchlist_items`, `user_search_history`, `usage_events` |
| Marketing | `blog_posts` |
| Ops | `promotions`, `import_jobs`, `admin_audit_log`, `platform_settings` |
| AI / RAG | `ai_conversations`, `ai_messages`, `report_chunks` (+ `vector`) |

**RLS:** subscribers see only their rows; **anon** can read published catalogue metadata; **preview** assets public for published reports; **full_pdf** only with entitlement or staff; staff = `app_role in ('editor','admin')`.

## Webhooks and Edge Functions

Use the **service_role** key only in Supabase Edge Functions or your server to:

- Apply Stripe / BaridiPay / CIB events → `payment_events`, `purchases`, `user_report_entitlements`.
- Insert assistant `ai_messages` if the SPA does not write them directly.

The SPA should use **only** the anon key + logged-in user JWT.

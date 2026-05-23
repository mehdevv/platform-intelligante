# Payment notifications

**Emails:** [EmailJS from the browser](./emailjs-payment-setup.md) — no Docker, no Edge Function deploy.

**In-app bells:** DB migration `20260528190000_payment_notifications.sql` (+ staff RPC `20260529100000_payment_notify_staff_rpc.sql`).

```powershell
npx supabase db push
```

Legacy Mailjet Edge Function (`supabase/functions/payment-notify`) is unused by the app.

# Payment emails with EmailJS

Emails are sent **from the browser** when a client submits a receipt or an admin approves/rejects. No Docker, no Supabase Edge Function deploy.

In-app bells still use the DB migration `20260528190000_payment_notifications.sql`.

---

## 1. EmailJS account

**Full copy-paste template (from your Contact Us layout):** [emailjs-researcha-payment-template.md](./emailjs-researcha-payment-template.md)

Summary:

1. **Email Services** → connect Gmail → copy **Service ID** (`service_…`)
2. **Email Templates** → **new** template `Researcha Payment` (not “Contact Us” / “Order Confirmation”)
3. **Account → API Keys** → **Public Key**
4. **Account → Security** → disable “Use Private Key” for localhost (or allow your domain)

Note: EmailJS free tier allows ~200 emails/month and **1 request/second** (the app waits 1.1s between admin emails).

---

## 2. Researcha `.env`

Add to your `.env` (not committed):

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_SITE_URL=http://localhost:5173

# Optional: comma-separated admin inboxes (if RPC migration not applied yet)
VITE_EMAILJS_ADMIN_EMAILS=admin@example.com,editor@example.com
```

Restart `npm run dev` after changing `.env`.

---

## 3. Database (staff emails + in-app bells)

```powershell
npx supabase db push
```

This applies:

- `20260528190000_payment_notifications.sql` — in-app notifications  
- `20260529100000_payment_notify_staff_rpc.sql` — `list_payment_notify_staff()` for admin emails  

If you skip the RPC, set `VITE_EMAILJS_ADMIN_EMAILS` instead.

---

## 4. Test

1. `npm run dev`
2. **Client** → checkout + upload receipt → admins receive email (and bell if migration applied).
3. **Admin** → `/admin/payments` → approve or reject → client receives email.

Open DevTools → **Console** if nothing arrives:

- `emailjs_not_configured` → missing `VITE_EMAILJS_*`
- `no_staff_emails` → no admin/editor in DB and no `VITE_EMAILJS_ADMIN_EMAILS`
- EmailJS error text → check template variable names match (`to_email`, `subject`, `message_html`)

Check **EmailJS → Email History** for delivery status.

---

## Template variables reference

The app sends:

| Variable | Description |
|----------|-------------|
| `to_email` | Recipient |
| `subject` | Email subject |
| `message_html` | HTML body |
| `message` | Plain-text fallback |

---

## Old Mailjet / Edge Function

`supabase/functions/payment-notify` is **optional** and no longer used by the app. You can ignore Docker and `functions deploy` for payment emails.

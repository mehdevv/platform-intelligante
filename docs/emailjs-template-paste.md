# EmailJS — paste this template + find your API keys

Do **not** reuse “Contact Us” or “Order Confirmation” as-is (wrong variables). Create a **new** template.

---

## Where to get the 3 API values

| `.env` variable | Where in EmailJS |
|-----------------|------------------|
| `VITE_EMAILJS_PUBLIC_KEY` | Left menu **Account** → **API Keys** → **Public Key** (long string, e.g. `user_xxxx` or similar) |
| `VITE_EMAILJS_SERVICE_ID` | Left menu **Email Services** → click your Gmail/service → copy **Service ID** (starts with `service_`) |
| `VITE_EMAILJS_TEMPLATE_ID` | Left menu **Email Templates** → open **Researcha Payment** (below) → **Settings** tab or template list → **Template ID** (starts with `template_`) |

Optional: use **Integration** page — it shows Public Key + example code.

**Security (required for browser):** **Account** → **Security** → turn **OFF** “Use Private Key (recommended)” for local testing, or add `http://localhost:5173` to allowed domains.

---

## Create the template (5 minutes)

1. **Email Templates** → **Create New Template**
2. Name: `Researcha Payment`
3. **Content** tab — paste the blocks below
4. **Save**

### Right panel (email settings)

| Field | Paste exactly |
|-------|----------------|
| **To Email** | `{{to_email}}` |
| **From Name** | `Researcha` |
| **From Email** | Check **Use Default Email Address** (your connected Gmail) |
| **Reply To** | `lamplightmeh@gmail.com` (or leave empty) |
| **Subject** | `{{subject}}` |

### Body — click **Edit Content** → switch to **Code** (HTML) and paste:

```html
{{{message_html}}}
```

If Code mode is not available, use the visual editor and insert one block with:

```
{{{message_html}}}
```

**Important:** use **triple** braces `{{{message_html}}}` so HTML renders.

Optional plain line under it:

```
{{message}}
```

---

## Your `.env` (project root)

After copying the 3 IDs:

```env
VITE_EMAILJS_PUBLIC_KEY=paste_public_key_here
VITE_EMAILJS_SERVICE_ID=service_paste_here
VITE_EMAILJS_TEMPLATE_ID=template_paste_here
VITE_SITE_URL=http://localhost:5173
VITE_EMAILJS_ADMIN_EMAILS=lamplightmeh@gmail.com
```

Restart:

```powershell
npm run dev
```

---

## Test inside EmailJS

On the template page → **Test It** → fill:

| Variable | Example |
|----------|---------|
| `to_email` | `lamplightmeh@gmail.com` |
| `subject` | `Test payment — Researcha` |
| `message_html` | `<p>Hello, this is a <strong>test</strong>.</p>` |
| `message` | `Hello, this is a test.` |

You should receive the email. Then test checkout in the app.

---

## Variable mapping (app → template)

The app always sends exactly these four names:

```
to_email      → To Email field
subject       → Subject field
message_html  → Email body (HTML)
message       → Plain text fallback
```

Your “Contact Us” template uses `name`, `email`, `title`, `message` — different names, so it will **not** work for payments unless you change our code or the template.

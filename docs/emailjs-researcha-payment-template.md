# Researcha → EmailJS payment template (copy-paste)

Use this document in [EmailJS](https://www.emailjs.com/).  
Your **Contact Us** template is a good layout reference; payment emails need **different fields** (see comparison below).

---

## 1. API keys → `.env`

| Researcha `.env` | EmailJS location |
|------------------|------------------|
| `VITE_EMAILJS_PUBLIC_KEY` | **Account** → **API Keys** → **Public Key** |
| `VITE_EMAILJS_SERVICE_ID` | **Email Services** → your Gmail service → **Service ID** (`service_…`) |
| `VITE_EMAILJS_TEMPLATE_ID` | **Email Templates** → **Researcha Payment** → **Template ID** (`template_…`) |

Also set:

```env
VITE_SITE_URL=http://localhost:5173
VITE_EMAILJS_ADMIN_EMAILS=lamplightmeh@gmail.com
```

**Account** → **Security** → disable **Use Private Key** for localhost (or allow `http://localhost:5173`).

---

## 2. Your “Contact Us” template (reference only)

From your dashboard — **do not use this template for payments** without changing fields.

| EmailJS field | Your Contact Us value |
|---------------|------------------------|
| Template name | Contact Us |
| **Subject** | `Contact Us: {{title}}` |
| **To Email** | `lamplightmeh@gmail.com` *(fixed — same inbox every time)* |
| **From Name** | `{{name}}` |
| **From Email** | ✅ Use Default Email Address |
| **Reply To** | `{{email}}` |
| **Body intro** | A message by `{{name}}` has been received… |
| **Body block** | `{{name}}`, `{{time}}`, `{{message}}` |

Variables: `title`, `name`, `time`, `message`, `email`.

---

## 3. Create **Researcha Payment** (for the app)

**Email Templates** → **Create New Template** → name: **`Researcha Payment`**

### 3.1 Right panel — copy each field

| Field | Paste exactly |
|-------|----------------|
| **To Email** | `{{to_email}}` |
| **From Name** | `Researcha` |
| **From Email** | ✅ **Use Default Email Address** |
| **Reply To** | `lamplightmeh@gmail.com` |
| **Bcc** | *(leave empty)* |
| **Cc** | *(leave empty)* |

### 3.2 Subject line

```
{{subject}}
```

The app fills the full subject, e.g. `New payment request — Sector Energy` or `Paiement validé — Report title`.

### 3.3 Body — Option A (recommended)

**Content** → **Edit Content** → **Code** → paste:

```html
<div style="font-family: system-ui, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
  <p style="font-size: 15px; line-height: 1.5;">
    You have a new notification from <strong>Researcha</strong>.
  </p>
  <div style="margin-top: 16px; padding: 16px; border-left: 4px solid #197F94; background: #f8fafc; border-radius: 4px;">
    {{{message_html}}}
  </div>
  <p style="margin-top: 20px; font-size: 12px; color: #6b7a8d;">
    Plain text: {{message}}
  </p>
</div>
```

Use **triple** braces on `message_html`: `{{{message_html}}}`.

### 3.4 Body — Option B (minimal)

If Option A fails in the editor, paste only:

```html
{{{message_html}}}
```

---

## 4. Variables the app sends (must match template)

| Variable | Role | Example |
|----------|------|---------|
| `to_email` | **To Email** — admin or client inbox | `lamplightmeh@gmail.com` |
| `subject` | **Subject** line | `New payment request — Agri-food` |
| `message_html` | HTML body (built by Researcha) | See §5 |
| `message` | Plain-text fallback | Same info without HTML |

**Do not** use `{{name}}`, `{{title}}`, `{{time}}`, `{{email}}` in this template unless you change the app code.

---

## 5. What Researcha puts inside `message_html`

The app generates branded HTML automatically. You only provide the wrapper in §3.

### 5.1 Admin — new payment (client uploaded receipt)

**Subject (EN):** `New payment request — {report or sector name}`  
**Subject (FR):** `Nouvelle demande de paiement — {name}`

**Content pattern:**

- Short line: client submitted a receipt for **{item}** (**{amount}**).
- Button link: `{SITE_URL}/admin/payments` — label “Open payments queue” / “Ouvrir la file des paiements”.
- Footer: Researcha + site link.

**Recipients:** every `admin` / `editor` (or `VITE_EMAILJS_ADMIN_EMAILS`).

---

### 5.2 Client — payment approved

**Subject (EN):** `Payment approved — {item}`  
**Subject (FR):** `Paiement validé — {item}`

**Content pattern:**

- Payment for **{item}** (**{amount}**) was **approved**.
- Button: `{SITE_URL}/profile` — “View my payments” / “Voir mes paiements”.

**Recipient:** client (`notification_email` or login email).

---

### 5.3 Client — payment rejected

**Subject (EN):** `Payment update — {item}`  
**Subject (FR):** `Mise à jour paiement — {item}`

**Content pattern:**

- Payment for **{item}** (**{amount}**) could not be approved.
- Optional **admin note** (reason from admin).
- Button: `{SITE_URL}/profile`.

**Recipient:** client.

---

## 6. EmailJS “Test It” values

| Variable | Paste for test |
|----------|----------------|
| `to_email` | `lamplightmeh@gmail.com` |
| `subject` | `Test — New payment request` |
| `message_html` | `<p>A client submitted a receipt for <strong>Test Report</strong> (<strong>1,500.00 DZD</strong>).</p><p><a href="http://localhost:5173/admin/payments">Open queue</a></p>` |
| `message` | `Test — New payment request. Open: http://localhost:5173/admin/payments` |

Click **Test It** → you should receive the email.

---

## 7. Side-by-side: Contact Us vs Researcha Payment

| | Contact Us (your form) | Researcha Payment (required) |
|--|------------------------|------------------------------|
| To | Fixed `lamplightmeh@gmail.com` | Dynamic `{{to_email}}` |
| Subject | `Contact Us: {{title}}` | `{{subject}}` |
| Main body | `{{name}}`, `{{time}}`, `{{message}}` | `{{{message_html}}}` + optional `{{message}}` |
| Reply To | `{{email}}` | `lamplightmeh@gmail.com` (fixed) |
| Used when | Homepage contact form | Checkout + admin approve/reject |

---

## 8. Checklist before testing the app

- [ ] New template **Researcha Payment** saved (not only Contact Us).
- [ ] **To Email** = `{{to_email}}` (not a fixed address).
- [ ] **Subject** = `{{subject}}`.
- [ ] Body contains `{{{message_html}}}`.
- [ ] Public Key, Service ID, Template ID in `.env`.
- [ ] `npm run dev` restarted after `.env` change.
- [ ] `npx supabase db push` (optional bells + staff emails RPC).

---

## 9. Quick copy block (all fields at once)

**Template name:** `Researcha Payment`

```
SUBJECT:
{{subject}}

TO EMAIL:
{{to_email}}

FROM NAME:
Researcha

FROM EMAIL:
[✓] Use Default Email Address

REPLY TO:
lamplightmeh@gmail.com

BODY (HTML):
{{{message_html}}}
```

---

*Researcha code: `src/lib/emailjsPaymentNotify.js` · Setup: `docs/emailjs-payment-setup.md`*

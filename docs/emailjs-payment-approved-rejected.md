# EmailJS — Payment **Approved** & **Rejected** templates

Create **two templates** in EmailJS (plus keep **Researcha Payment** for admin “new receipt” alerts, or reuse one template for all).

Copy each block into **Email Templates → Create New Template**.

---

## Shared settings (both templates)

| Field | Value |
|-------|--------|
| **To Email** | `{{to_email}}` or `{{email}}` (must be a variable — **not** a fixed address) |
| **From Name** | `Researcha` |
| **From Email** | ✅ Use Default Email Address |
| **Reply To** | `lamplightmeh@gmail.com` |

**Variables the app sends** (all templates):

| Variable | Description |
|----------|-------------|
| `to_email` | Client inbox |
| `subject` | Full subject (EN or FR) |
| `message_html` | Main HTML block from Researcha |
| `message` | Plain-text version |
| `item_label` | Report or sector name |
| `amount` | Formatted price (e.g. `1 500,00 DZD`) |
| `action_url` | Link to `/profile` |
| `action_label` | Button text |
| `admin_note` | Rejection reason (empty if approved) |
| `status_title` | Short headline in the email |

---

## Template 1 — `Researcha Payment Approved`

### Subject

```
{{subject}}
```

Examples the app sends:

- EN: `Payment approved — Global Energy Outlook 2026`
- FR: `Paiement validé — Global Energy Outlook 2026`

### Body (Code / HTML) — paste all

```html
<div style="font-family: Ubuntu, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #2c3748;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #0d9488 0%, #197F94 100%); padding: 24px 28px; border-radius: 12px 12px 0 0;">
    <p style="margin: 0 0 6px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.85);">Researcha</p>
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">{{status_title}}</h1>
  </div>

  <!-- Body -->
  <div style="padding: 28px; background: #ffffff; border: 1px solid #dde1e9; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
      Good news — your bank transfer was reviewed and <strong style="color: #0d9488;">approved</strong>.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
      <tr>
        <td style="padding: 10px 0; color: #6b7a8d; width: 120px;">Item</td>
        <td style="padding: 10px 0; font-weight: 700;">{{item_label}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #6b7a8d;">Amount</td>
        <td style="padding: 10px 0; font-weight: 700;">{{amount}}</td>
      </tr>
    </table>

    <div style="margin: 20px 0; padding: 16px; background: #f0fdfa; border-left: 4px solid #0d9488; border-radius: 6px;">
      {{{message_html}}}
    </div>

    <p style="margin: 24px 0 0; text-align: center;">
      <a href="{{action_url}}" style="display: inline-block; background: #197F94; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px;">
        {{action_label}}
      </a>
    </p>

    <p style="margin: 24px 0 0; font-size: 12px; color: #6b7a8d; line-height: 1.5;">
      {{message}}
    </p>
  </div>
</div>
```

### Test It — Approved

| Variable | Example |
|----------|---------|
| `to_email` | `client@example.com` |
| `subject` | `Payment approved — Agri-food Sector` |
| `status_title` | `Payment approved` |
| `item_label` | `Agri-food Sector` |
| `amount` | `12,000.00 DZD` |
| `action_url` | `http://localhost:5173/profile` |
| `action_label` | `View my payments` |
| `admin_note` | *(leave empty)* |
| `message_html` | `<p>Your access is now active.</p>` |
| `message` | `Payment approved — Agri-food Sector (12,000.00 DZD).` |

---

## Template 2 — `Researcha Payment Rejected`

### Subject

```
{{subject}}
```

Examples the app sends:

- EN: `Payment update — Global Energy Outlook 2026`
- FR: `Mise à jour paiement — Global Energy Outlook 2026`

### Body (Code / HTML) — paste all

```html
<div style="font-family: Ubuntu, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #2c3748;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #d4a020 0%, #b45309 100%); padding: 24px 28px; border-radius: 12px 12px 0 0;">
    <p style="margin: 0 0 6px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.9);">Researcha</p>
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">{{status_title}}</h1>
  </div>

  <!-- Body -->
  <div style="padding: 28px; background: #ffffff; border: 1px solid #dde1e9; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
      We reviewed your bank transfer but could <strong>not approve</strong> this payment yet.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
      <tr>
        <td style="padding: 10px 0; color: #6b7a8d; width: 120px;">Item</td>
        <td style="padding: 10px 0; font-weight: 700;">{{item_label}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #6b7a8d;">Amount</td>
        <td style="padding: 10px 0; font-weight: 700;">{{amount}}</td>
      </tr>
    </table>

    <div style="margin: 0 0 20px; padding: 14px 16px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px;">
      <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase;">Note from our team</p>
      <p style="margin: 0; font-size: 14px; line-height: 1.55; color: #78350f;">{{admin_note}}</p>
    </div>

    <div style="margin: 20px 0; padding: 16px; background: #f8fafc; border-left: 4px solid #d4a020; border-radius: 6px;">
      {{{message_html}}}
    </div>

    <p style="margin: 24px 0 0; text-align: center;">
      <a href="{{action_url}}" style="display: inline-block; background: #4B5B72; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px;">
        {{action_label}}
      </a>
    </p>

    <p style="margin: 24px 0 0; font-size: 12px; color: #6b7a8d; line-height: 1.5;">
      {{message}}
    </p>
  </div>
</div>
```

### Test It — Rejected

| Variable | Example |
|----------|---------|
| `to_email` | `client@example.com` |
| `subject` | `Payment update — Agri-food Sector` |
| `status_title` | `Payment not approved` |
| `item_label` | `Agri-food Sector` |
| `amount` | `12,000.00 DZD` |
| `action_url` | `http://localhost:5173/profile` |
| `action_label` | `View payment details` |
| `admin_note` | `Receipt unclear — please re-upload a readable PDF.` |
| `message_html` | `<p>Contact us if you need help.</p>` |
| `message` | `Payment not approved. Receipt unclear.` |

---

## `.env` — three template IDs

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=service_xxxxx

# Admin alert when client uploads receipt
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx

# Client emails (optional — if empty, uses TEMPLATE_ID above)
VITE_EMAILJS_TEMPLATE_APPROVED=template_approved_xxxxx
VITE_EMAILJS_TEMPLATE_REJECTED=template_rejected_xxxxx

VITE_SITE_URL=http://localhost:5173
VITE_EMAILJS_ADMIN_EMAILS=lamplightmeh@gmail.com
```

Restart `npm run dev` after saving.

---

## French `status_title` values (sent by the app)

| Status | `status_title` |
|--------|----------------|
| Approved | `Paiement validé` |
| Rejected | `Paiement non validé` |

---

## Minimal version (if the editor breaks)

Use the same **Subject** and **To** as above; body only:

**Approved:**

```html
{{{message_html}}}
```

**Rejected:**

```html
{{{message_html}}}
```

The app still fills `subject`, `message`, and the green/teal HTML inside `message_html`.

---

*See also: [emailjs-researcha-payment-template.md](./emailjs-researcha-payment-template.md) (admin new payment)*

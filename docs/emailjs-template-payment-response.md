# EmailJS — one template: **Researcha Payment Response**

Single template for **approved** and **rejected**. The app sends `payment_result: approved` or `rejected` and switches colors/text inside the email.

---

## Setup

1. **Email Templates** → **Create New Template** → name: **`Researcha Payment Response`**
2. Right panel:

| Field | Value |
|-------|--------|
| **To Email** | `{{to_email}}` |
| **From Name** | `Researcha` |
| **From Email** | ✅ Use Default Email Address |
| **Reply To** | `lamplightmeh@gmail.com` |
| **Subject** | `{{subject}}` |

3. **Content** → **Edit Content** → **Code** → paste HTML below → **Save**
4. Copy **Template ID** into `.env`:

```env
VITE_EMAILJS_TEMPLATE_PAYMENT_RESPONSE=template_xxxxx
```

(You can remove `VITE_EMAILJS_TEMPLATE_APPROVED` / `REJECTED` — optional fallbacks still work.)

Restart: `npm run dev`

---

## HTML — paste entire block

```html
<div style="font-family: system-ui, Ubuntu, sans-serif, Arial; font-size: 14px; color: #2c3748; padding: 14px 8px; background-color: #EBECF1;">
  <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; overflow: hidden;">
    <!-- Top bar: green if approved, amber if rejected (app sends border_color) -->
    <div style="border-top: 6px solid {{border_color}}; padding: 16px 20px;">
      <a style="text-decoration: none; color: #197F94;" href="{{action_url}}" target="_blank">
        <span style="font-size: 20px; font-weight: 800;">Researcha</span>
      </a>
      <span style="font-size: 15px; border-left: 1px solid #dde1e9; padding-left: 12px; margin-left: 8px;">
        <strong>{{status_title}}</strong>
      </span>
      <span style="float: right; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: {{status_color}}; background: #f8fafc; padding: 4px 10px; border-radius: 4px;">
        {{payment_result}}
      </span>
    </div>

    <div style="padding: 8px 20px 24px; clear: both;">
      <p style="margin: 0 0 16px; line-height: 1.6;">{{intro_text}}</p>

      <div style="font-size: 14px; padding-bottom: 8px; border-bottom: 2px solid {{border_color}}; margin-bottom: 16px;">
        <strong>{{section_title}}</strong>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 10px 0; color: #6b7a8d; width: 120px;">Item</td>
          <td style="padding: 10px 0; font-weight: 700;">{{item_label}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7a8d;">Amount</td>
          <td style="padding: 10px 0; font-weight: 700;">{{amount}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7a8d;">Result</td>
          <td style="padding: 10px 0; font-weight: 700; color: {{status_color}};">{{status_label}}</td>
        </tr>
      </table>

      <!-- Rejected only: hidden when approved (note_display = none) -->
      <div style="display: {{note_display}}; margin: 20px 0 0; padding: 14px 16px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px;">
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase;">Note from our team</p>
        <p style="margin: 0; font-size: 14px; line-height: 1.55; color: #78350f;">{{admin_note}}</p>
      </div>

      <div style="padding: 24px 0 8px; text-align: center;">
        <a href="{{action_url}}" style="display: inline-block; background: {{button_bg}}; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700;">
          {{action_label}}
        </a>
      </div>
    </div>
  </div>

  <div style="max-width: 600px; margin: auto; padding-top: 12px;">
    <p style="color: #6b7a8d; font-size: 12px; margin: 0;">
      Sent to {{email}} — Researcha payment update ({{payment_result}}).
    </p>
    <p style="color: #6b7a8d; font-size: 12px; margin: 8px 0 0;">{{message}}</p>
  </div>
</div>
```

---

## What changes inside the email

| | **Approved** | **Rejected** |
|--|--------------|--------------|
| `payment_result` | `approved` | `rejected` |
| `border_color` | `#0d9488` green | `#d4a020` amber |
| `status_title` | Payment approved / Paiement validé | Payment not approved / Paiement non validé |
| `status_label` | Approved ✓ / Validé ✓ | Not approved / Non validé |
| `note_display` | `none` (note hidden) | `block` (note visible) |
| `admin_note` | `—` | Admin’s rejection reason |
| `button_bg` | Teal `#197F94` | Grey `#4B5B72` |

---

## Test It — Approved

| Variable | Value |
|----------|--------|
| `to_email` / `email` | `your@email.com` |
| `subject` | `Payment approved — Energy Sector` |
| `payment_result` | `approved` |
| `border_color` | `#0d9488` |
| `status_title` | `Payment approved` |
| `intro_text` | `Good news — your bank transfer was approved.` |
| `section_title` | `Payment confirmed` |
| `status_label` | `Approved ✓` |
| `status_color` | `#0d9488` |
| `item_label` | `Energy Sector` |
| `amount` | `12,000.00 DZD` |
| `admin_note` | `—` |
| `note_display` | `none` |
| `action_url` | `http://localhost:5173/profile` |
| `action_label` | `View my payments` |
| `button_bg` | `#197F94` |
| `message` | `Payment approved — Energy Sector` |

---

## Test It — Rejected

Same as above, but change:

| Variable | Value |
|----------|--------|
| `subject` | `Payment update — Energy Sector` |
| `payment_result` | `rejected` |
| `border_color` | `#d4a020` |
| `status_title` | `Payment not approved` |
| `intro_text` | `Your payment could not be approved.` |
| `section_title` | `Payment not approved` |
| `status_label` | `Not approved` |
| `status_color` | `#b45309` |
| `admin_note` | `Receipt unclear — upload a readable PDF.` |
| `note_display` | `block` |
| `action_label` | `View payment details` |
| `button_bg` | `#4B5B72` |

---

## Admin template (unchanged)

New receipt → still use **`VITE_EMAILJS_TEMPLATE_ID`** (separate template).  
See [emailjs-templates-copy-paste.md](./emailjs-templates-copy-paste.md) section 1.

---

*Code: `clientPaymentResponseEmail()` in `src/lib/paymentEmailContent.js`*

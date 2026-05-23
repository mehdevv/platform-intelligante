# EmailJS templates — copy-paste (Admin, Approved, Rejected)

Based on your order-confirmation layout, adapted for **Researcha** payments.  
Create **3 templates** in EmailJS and paste each HTML block in **Edit Content → Code**.

---

## Shared settings (all 3 templates)

| Field | Paste |
|-------|--------|
| **To Email** | `{{to_email}}` |
| **From Name** | `Researcha` |
| **From Email** | ✅ Use Default Email Address |
| **Reply To** | `lamplightmeh@gmail.com` |
| **Subject** | `{{subject}}` |

`.env` mapping:

```env
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx              # Admin — new payment
VITE_EMAILJS_TEMPLATE_APPROVED=template_xxxxx        # Client — approved
VITE_EMAILJS_TEMPLATE_REJECTED=template_xxxxx        # Client — rejected
```

---

## Variables used by the app

| Variable | Used in |
|----------|---------|
| `to_email` / `email` | To Email (both sent) |
| `subject` | Subject line |
| `status_title` | Header title |
| `item_label` | Report or sector name |
| `amount` | Price |
| `action_url` | Button link |
| `action_label` | Button text |
| `admin_note` | Rejection reason (rejected only) |
| `message_html` | Optional extra block from app |
| `message` | Plain text footer |

---

## 1. Admin — `Researcha Payment Admin` (new receipt)

**When:** client uploads a bank-transfer receipt.  
**Border color:** teal `#197F94`

### Subject (auto-filled by app)

`New payment request — {item}` / `Nouvelle demande de paiement — {item}`

### HTML body — paste all

```html
<div style="font-family: system-ui, Ubuntu, sans-serif, Arial; font-size: 14px; color: #2c3748; padding: 14px 8px; background-color: #EBECF1;">
  <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; overflow: hidden;">
    <div style="border-top: 6px solid #197F94; padding: 16px 20px;">
      <a style="text-decoration: none; outline: none; color: #197F94;" href="{{action_url}}" target="_blank">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">Researcha</span>
      </a>
      <span style="font-size: 15px; vertical-align: middle; border-left: 1px solid #dde1e9; padding-left: 12px; margin-left: 8px;">
        <strong>{{status_title}}</strong>
      </span>
    </div>
    <div style="padding: 8px 20px 20px;">
      <p style="margin: 0 0 16px; line-height: 1.6;">
        A client submitted a bank-transfer receipt. Please review it in the payments queue.
      </p>
      <div style="text-align: left; font-size: 14px; padding-bottom: 8px; border-bottom: 2px solid #197F94; margin-bottom: 16px;">
        <strong>Payment request</strong>
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
      </table>
      <div style="padding: 20px 0 8px; text-align: center;">
        <a href="{{action_url}}" style="display: inline-block; background: #197F94; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px;">
          {{action_label}}
        </a>
      </div>
      <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 6px; font-size: 13px; color: #6b7a8d;">
        {{{message_html}}}
      </div>
    </div>
  </div>
  <div style="max-width: 600px; margin: auto; padding-top: 12px;">
    <p style="color: #6b7a8d; font-size: 12px; line-height: 1.5; margin: 0;">
      Sent to {{email}}<br />
      You receive this because you are an admin or editor on Researcha.
    </p>
    <p style="color: #6b7a8d; font-size: 12px; margin: 8px 0 0;">{{message}}</p>
  </div>
</div>
```

**Test It values:**

| Key | Value |
|-----|--------|
| `to_email` | `lamplightmeh@gmail.com` |
| `email` | `lamplightmeh@gmail.com` |
| `subject` | `New payment request — Agri-food Sector` |
| `status_title` | `New payment request` |
| `item_label` | `Agri-food Sector` |
| `amount` | `12,000.00 DZD` |
| `action_url` | `http://localhost:5173/admin/payments` |
| `action_label` | `Open payments queue` |
| `admin_note` | `—` |
| `message_html` | `<p>Review the uploaded receipt.</p>` |
| `message` | `New payment request — Agri-food Sector` |

---

## 2. Client — `Researcha Payment Approved`

**When:** admin approves payment.  
**Border color:** green `#0d9488`

### HTML body — paste all

```html
<div style="font-family: system-ui, Ubuntu, sans-serif, Arial; font-size: 14px; color: #2c3748; padding: 14px 8px; background-color: #EBECF1;">
  <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; overflow: hidden;">
    <div style="border-top: 6px solid #0d9488; padding: 16px 20px;">
      <a style="text-decoration: none; outline: none; color: #197F94;" href="{{action_url}}" target="_blank">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">Researcha</span>
      </a>
      <span style="font-size: 15px; vertical-align: middle; border-left: 1px solid #dde1e9; padding-left: 12px; margin-left: 8px;">
        <strong>{{status_title}}</strong>
      </span>
    </div>
    <div style="padding: 8px 20px 20px;">
      <p style="margin: 0 0 16px; line-height: 1.6;">
        Good news — your bank transfer was reviewed and <strong style="color: #0d9488;">approved</strong>. Your access is now active.
      </p>
      <div style="text-align: left; font-size: 14px; padding-bottom: 8px; border-bottom: 2px solid #0d9488; margin-bottom: 16px;">
        <strong>Payment confirmed</strong>
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
          <td style="padding: 10px 0; color: #6b7a8d;">Status</td>
          <td style="padding: 10px 0; font-weight: 700; color: #0d9488;">Approved ✓</td>
        </tr>
      </table>
      <div style="padding: 20px 0 8px; text-align: center;">
        <a href="{{action_url}}" style="display: inline-block; background: #197F94; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px;">
          {{action_label}}
        </a>
      </div>
      <div style="margin-top: 16px; padding: 12px; background: #f0fdfa; border-left: 4px solid #0d9488; border-radius: 6px; font-size: 13px;">
        {{{message_html}}}
      </div>
    </div>
  </div>
  <div style="max-width: 600px; margin: auto; padding-top: 12px;">
    <p style="color: #6b7a8d; font-size: 12px; line-height: 1.5; margin: 0;">
      The email was sent to {{email}}<br />
      You received this because you made a payment on Researcha.
    </p>
    <p style="color: #6b7a8d; font-size: 12px; margin: 8px 0 0;">{{message}}</p>
  </div>
</div>
```

**Test It values:**

| Key | Value |
|-----|--------|
| `to_email` | `client@example.com` |
| `email` | `client@example.com` |
| `subject` | `Payment approved — Global Energy Outlook` |
| `status_title` | `Payment approved` |
| `item_label` | `Global Energy Outlook` |
| `amount` | `4,500.00 DZD` |
| `action_url` | `http://localhost:5173/profile` |
| `action_label` | `View my payments` |
| `admin_note` | `—` |
| `message` | `Payment approved — Global Energy Outlook` |

---

## 3. Client — `Researcha Payment Rejected`

**When:** admin rejects payment.  
**Border color:** amber `#d4a020`

### HTML body — paste all

```html
<div style="font-family: system-ui, Ubuntu, sans-serif, Arial; font-size: 14px; color: #2c3748; padding: 14px 8px; background-color: #EBECF1;">
  <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; overflow: hidden;">
    <div style="border-top: 6px solid #d4a020; padding: 16px 20px;">
      <a style="text-decoration: none; outline: none; color: #197F94;" href="{{action_url}}" target="_blank">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">Researcha</span>
      </a>
      <span style="font-size: 15px; vertical-align: middle; border-left: 1px solid #dde1e9; padding-left: 12px; margin-left: 8px;">
        <strong>{{status_title}}</strong>
      </span>
    </div>
    <div style="padding: 8px 20px 20px;">
      <p style="margin: 0 0 16px; line-height: 1.6;">
        We reviewed your bank transfer but could <strong>not approve</strong> this payment yet. See the note below and try again if needed.
      </p>
      <div style="text-align: left; font-size: 14px; padding-bottom: 8px; border-bottom: 2px solid #d4a020; margin-bottom: 16px;">
        <strong>Payment not approved</strong>
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
          <td style="padding: 10px 0; color: #6b7a8d;">Status</td>
          <td style="padding: 10px 0; font-weight: 700; color: #b45309;">Not approved</td>
        </tr>
      </table>
      <div style="margin: 16px 0; padding: 14px 16px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px;">
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase;">Note from our team</p>
        <p style="margin: 0; font-size: 14px; line-height: 1.55; color: #78350f;">{{admin_note}}</p>
      </div>
      <div style="padding: 12px 0 8px; text-align: center;">
        <a href="{{action_url}}" style="display: inline-block; background: #4B5B72; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px;">
          {{action_label}}
        </a>
      </div>
      <div style="margin-top: 12px; padding: 12px; background: #f8fafc; border-left: 4px solid #d4a020; border-radius: 6px; font-size: 13px;">
        {{{message_html}}}
      </div>
    </div>
  </div>
  <div style="max-width: 600px; margin: auto; padding-top: 12px;">
    <p style="color: #6b7a8d; font-size: 12px; line-height: 1.5; margin: 0;">
      The email was sent to {{email}}<br />
      You received this because you submitted a payment on Researcha.
    </p>
    <p style="color: #6b7a8d; font-size: 12px; margin: 8px 0 0;">{{message}}</p>
  </div>
</div>
```

**Test It values:**

| Key | Value |
|-----|--------|
| `to_email` | `client@example.com` |
| `email` | `client@example.com` |
| `subject` | `Payment update — Global Energy Outlook` |
| `status_title` | `Payment not approved` |
| `item_label` | `Global Energy Outlook` |
| `amount` | `4,500.00 DZD` |
| `action_url` | `http://localhost:5173/profile` |
| `action_label` | `View payment details` |
| `admin_note` | `Receipt is blurry — please upload a clear PDF.` |
| `message` | `Payment not approved. Receipt is blurry.` |

---

## Differences from your order template

| Your order template | Researcha payment templates |
|---------------------|----------------------------|
| `{{#orders}}` loop | Single item row (`item_label` + `amount`) |
| `{{order_id}}` | `subject` + status block |
| `cid:logo.png` | Text logo **Researcha** (no attachment needed) |
| `$` prices | `{{amount}}` (app sends DZD formatted) |
| Fixed green `#458500` | Admin teal / Approved green / Rejected amber |
| Footer `{{email}}` | Kept — app sends `email` = recipient |

---

## Checklist

- [ ] 3 templates created in EmailJS  
- [ ] Each **To Email** = `{{to_email}}`  
- [ ] Each **Subject** = `{{subject}}`  
- [ ] Template IDs in `.env`  
- [ ] **Test It** works for each  
- [ ] `npm run dev` restarted after `.env` change  

---

*App code: `src/lib/emailjsPaymentNotify.js`*

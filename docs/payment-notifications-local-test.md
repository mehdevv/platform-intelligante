# Test payment emails

## No Docker? (your case on Windows)

`npm run functions:payment-notify` needs **Docker Desktop** running. If you see:

`open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`

use **cloud deploy** instead — same Mailjet test, app still on `localhost:5173`:

### 1. Link project (once)

```powershell
npx supabase login
npx supabase link --project-ref dakoclqbnocazrdhegqe
```

### 2. Push Mailjet secrets to Supabase

```powershell
npm run functions:secrets:mailjet
```

### 3. Deploy the function

```powershell
npm run functions:deploy:payment-notify
```

### 4. Test

**A — From the app (easiest)**

```powershell
npm run dev
```

- Client: checkout + upload receipt → admins get email  
- Admin: approve/reject on `/admin/payments` → client gets email  

**B — PowerShell script (cloud endpoint)**

```powershell
.\scripts\test-payment-notify-local.ps1 -Cloud -Jwt "YOUR_ACCESS_TOKEN" -PaymentRequestId "UUID" -Event created
```

Check Mailjet → **Message history**.

---

## With Docker (optional local function)

1. Install [Docker Desktop](https://docs.docker.com/desktop/) and **start** it.
2. Terminal 1:

```powershell
npm run functions:payment-notify
```

3. Terminal 2 (local URL, no `-Cloud`):

```powershell
.\scripts\test-payment-notify-local.ps1 -Jwt "TOKEN" -PaymentRequestId "UUID" -Event created
```

---

## Get JWT + payment id

1. `npm run dev` → sign in.  
2. DevTools → Application → Local Storage (Supabase auth) or Network → copy `Bearer` token.  
3. Supabase Dashboard → `payment_requests` → copy `id` (or create one via checkout).

| Event | Who signs in | Notes |
|-------|----------------|-------|
| `created` | Client | Payment must belong to that user |
| `reviewed` | Admin/editor | Row must already be `approved` or `rejected` |

---

## In-app notification bells

```powershell
npx supabase db push
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Docker pipe error | Use cloud deploy section above |
| `401` | Fresh JWT from logged-in user |
| `403` | Wrong user for event type |
| `sent: false` | Run `npm run functions:secrets:mailjet` and redeploy |
| App works but no email | Deploy function + secrets; local `.env` is not used by cloud |

See also: [payment-notifications-setup.md](./payment-notifications-setup.md)

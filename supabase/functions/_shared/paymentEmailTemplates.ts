type Locale = 'en' | 'fr'

export function normalizeLocale(raw?: string | null): Locale {
    return raw?.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

function layout(content: string, siteUrl: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#EBECF1;font-family:Ubuntu,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EBECF1;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #dde1e9;overflow:hidden;">
        <tr><td style="background:#197F94;padding:20px 24px;">
          <span style="font-family:'League Spartan',sans-serif;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Researcha</span>
        </td></tr>
        <tr><td style="padding:24px;color:#2c3748;font-size:15px;line-height:1.6;">${content}</td></tr>
        <tr><td style="padding:16px 24px 24px;border-top:1px solid #dde1e9;font-size:12px;color:#6b7a8d;">
          <a href="${siteUrl}" style="color:#197F94;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, '')}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(href: string, label: string) {
    return `<p style="margin:24px 0 8px;"><a href="${href}" style="display:inline-block;background:#197F94;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;font-size:14px;">${label}</a></p>`
}

export function adminNewPaymentEmail(opts: {
    locale: Locale
    itemLabel: string
    amount: string
    adminLink: string
    siteUrl: string
}) {
    const { locale, itemLabel, amount, adminLink, siteUrl } = opts
    if (locale === 'fr') {
        const content = `
          <p style="margin:0 0 12px;">Bonjour,</p>
          <p style="margin:0 0 16px;">Un client a soumis un reçu de virement pour <strong>${itemLabel}</strong> (<strong>${amount}</strong>).</p>
          ${btn(adminLink, 'Ouvrir la file des paiements')}
          <p style="margin:16px 0 0;color:#6b7a8d;font-size:13px;">Vous recevez cet e-mail car vous êtes administrateur ou éditeur sur Researcha.</p>
        `
        return {
            subject: `Nouvelle demande de paiement — ${itemLabel}`,
            html: layout(content, siteUrl),
        }
    }
    const content = `
      <p style="margin:0 0 12px;">Hello,</p>
      <p style="margin:0 0 16px;">A client submitted a bank-transfer receipt for <strong>${itemLabel}</strong> (<strong>${amount}</strong>).</p>
      ${btn(adminLink, 'Open payments queue')}
      <p style="margin:16px 0 0;color:#6b7a8d;font-size:13px;">You receive this email because you are an admin or editor on Researcha.</p>
    `
    return {
        subject: `New payment request — ${itemLabel}`,
        html: layout(content, siteUrl),
    }
}

export function clientApprovedEmail(opts: {
    locale: Locale
    itemLabel: string
    amount: string
    clientLink: string
    siteUrl: string
}) {
    const { locale, itemLabel, amount, clientLink, siteUrl } = opts
    if (locale === 'fr') {
        const content = `
          <p style="margin:0 0 12px;">Bonne nouvelle,</p>
          <p style="margin:0 0 16px;">Votre paiement pour <strong>${itemLabel}</strong> (<strong>${amount}</strong>) a été <strong style="color:#0d9488;">validé</strong>.</p>
          <p style="margin:0 0 8px;">Votre accès est maintenant actif.</p>
          ${btn(clientLink, 'Voir mes paiements')}
        `
        return {
            subject: `Paiement validé — ${itemLabel}`,
            html: layout(content, siteUrl),
        }
    }
    const content = `
      <p style="margin:0 0 12px;">Good news,</p>
      <p style="margin:0 0 16px;">Your payment for <strong>${itemLabel}</strong> (<strong>${amount}</strong>) has been <strong style="color:#0d9488;">approved</strong>.</p>
      <p style="margin:0 0 8px;">Your access is now active.</p>
      ${btn(clientLink, 'View my payments')}
    `
    return {
        subject: `Payment approved — ${itemLabel}`,
        html: layout(content, siteUrl),
    }
}

export function clientRejectedEmail(opts: {
    locale: Locale
    itemLabel: string
    amount: string
    adminNote?: string
    clientLink: string
    siteUrl: string
}) {
    const { locale, itemLabel, amount, adminNote, clientLink, siteUrl } = opts
    const noteBlock = adminNote
        ? `<p style="margin:12px 0;padding:12px 16px;background:#f8fafc;border-left:4px solid #d4a020;border-radius:4px;"><strong>${locale === 'fr' ? 'Note de notre équipe' : 'Note from our team'}:</strong><br>${escapeHtml(adminNote)}</p>`
        : ''
    if (locale === 'fr') {
        const content = `
          <p style="margin:0 0 12px;">Bonjour,</p>
          <p style="margin:0 0 16px;">Votre paiement pour <strong>${itemLabel}</strong> (<strong>${amount}</strong>) n'a pas pu être validé.</p>
          ${noteBlock}
          ${btn(clientLink, 'Voir le détail du paiement')}
        `
        return {
            subject: `Mise à jour paiement — ${itemLabel}`,
            html: layout(content, siteUrl),
        }
    }
    const content = `
      <p style="margin:0 0 12px;">Hello,</p>
      <p style="margin:0 0 16px;">Your payment for <strong>${itemLabel}</strong> (<strong>${amount}</strong>) could not be approved.</p>
      ${noteBlock}
      ${btn(clientLink, 'View payment details')}
    `
    return {
        subject: `Payment update — ${itemLabel}`,
        html: layout(content, siteUrl),
    }
}

function escapeHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

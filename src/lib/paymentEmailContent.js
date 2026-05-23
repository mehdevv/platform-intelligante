/** @typedef {'en' | 'fr'} Locale */

/** @param {string | null | undefined} raw */
export function normalizeLocale(raw) {
    return raw?.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

function layout(content, siteUrl) {
    return `
<div style="font-family:Ubuntu,system-ui,sans-serif;color:#2c3748;line-height:1.6;">
  <div style="background:#197F94;padding:16px 20px;border-radius:8px 8px 0 0;">
    <strong style="color:#fff;font-size:18px;">Researcha</strong>
  </div>
  <div style="padding:20px;border:1px solid #dde1e9;border-top:0;border-radius:0 0 8px 8px;background:#fff;">
    ${content}
    <p style="margin-top:20px;font-size:12px;color:#6b7a8d;">
      <a href="${siteUrl}" style="color:#197F94;">${siteUrl.replace(/^https?:\/\//, '')}</a>
    </p>
  </div>
</div>`
}

function btn(href, label) {
    return `<p><a href="${href}" style="display:inline-block;background:#197F94;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:700;">${label}</a></p>`
}

/** @param {{ locale: Locale, itemLabel: string, amount: string, adminLink: string, siteUrl: string }} opts */
export function adminNewPaymentEmail(opts) {
    const { locale, itemLabel, amount, adminLink, siteUrl } = opts
    if (locale === 'fr') {
        return {
            subject: `Nouvelle demande de paiement — ${itemLabel}`,
            message_html: layout(
                `<p>Un client a soumis un reçu pour <strong>${itemLabel}</strong> (${amount}).</p>${btn(adminLink, 'Ouvrir la file des paiements')}`,
                siteUrl,
            ),
            message: `Nouvelle demande de paiement — ${itemLabel} (${amount}). ${adminLink}`,
        }
    }
    return {
        subject: `New payment request — ${itemLabel}`,
        message_html: layout(
            `<p>A client submitted a receipt for <strong>${itemLabel}</strong> (${amount}).</p>${btn(adminLink, 'Open payments queue')}`,
            siteUrl,
        ),
        message: `New payment request — ${itemLabel} (${amount}). ${adminLink}`,
    }
}

/** @param {{ locale: Locale, itemLabel: string, amount: string, clientLink: string, siteUrl: string }} opts */
export function clientApprovedEmail(opts) {
    const { locale, itemLabel, amount, clientLink, siteUrl } = opts
    if (locale === 'fr') {
        return {
            subject: `Paiement validé — ${itemLabel}`,
            message_html: layout(
                `<p>Votre paiement pour <strong>${itemLabel}</strong> (${amount}) a été <strong>validé</strong>.</p>${btn(clientLink, 'Voir mes paiements')}`,
                siteUrl,
            ),
            message: `Paiement validé — ${itemLabel} (${amount}). ${clientLink}`,
        }
    }
    return {
        subject: `Payment approved — ${itemLabel}`,
        message_html: layout(
            `<p>Your payment for <strong>${itemLabel}</strong> (${amount}) was <strong>approved</strong>.</p>${btn(clientLink, 'View my payments')}`,
            siteUrl,
        ),
        message: `Payment approved — ${itemLabel} (${amount}). ${clientLink}`,
    }
}

/**
 * One EmailJS template for both approved & rejected (variant inside the email).
 * @param {{ locale: Locale, status: 'approved' | 'rejected', itemLabel: string, amount: string, adminNote?: string, clientLink: string }} opts
 */
export function clientPaymentResponseEmail(opts) {
    const { locale, status, itemLabel, amount, adminNote, clientLink } = opts
    const approved = status === 'approved'
    const note = adminNote?.trim() || ''

    if (locale === 'fr') {
        return {
            subject: approved
                ? `Paiement validé — ${itemLabel}`
                : `Mise à jour paiement — ${itemLabel}`,
            message: approved
                ? `Paiement validé — ${itemLabel} (${amount}). ${clientLink}`
                : `Paiement non validé — ${itemLabel}. ${note} ${clientLink}`,
            templateParams: {
                payment_result: approved ? 'approved' : 'rejected',
                border_color: approved ? '#0d9488' : '#d4a020',
                status_title: approved ? 'Paiement validé' : 'Paiement non validé',
                intro_text: approved
                    ? 'Bonne nouvelle — votre virement a été validé. Votre accès est maintenant actif.'
                    : 'Votre paiement n\'a pas pu être validé. Consultez la note de notre équipe ci-dessous.',
                section_title: approved ? 'Paiement confirmé' : 'Paiement non validé',
                status_label: approved ? 'Validé ✓' : 'Non validé',
                status_color: approved ? '#0d9488' : '#b45309',
                admin_note: note || '—',
                note_display: approved ? 'none' : 'block',
                button_bg: approved ? '#197F94' : '#4B5B72',
                action_label: approved ? 'Voir mes paiements' : 'Voir le détail',
            },
        }
    }

    return {
        subject: approved ? `Payment approved — ${itemLabel}` : `Payment update — ${itemLabel}`,
        message: approved
            ? `Payment approved — ${itemLabel} (${amount}). ${clientLink}`
            : `Payment not approved — ${itemLabel}. ${note} ${clientLink}`,
        templateParams: {
            payment_result: approved ? 'approved' : 'rejected',
            border_color: approved ? '#0d9488' : '#d4a020',
            status_title: approved ? 'Payment approved' : 'Payment not approved',
            intro_text: approved
                ? 'Good news — your bank transfer was approved. Your access is now active.'
                : 'Your payment could not be approved. See the note from our team below.',
            section_title: approved ? 'Payment confirmed' : 'Payment not approved',
            status_label: approved ? 'Approved ✓' : 'Not approved',
            status_color: approved ? '#0d9488' : '#b45309',
            admin_note: note || '—',
            note_display: approved ? 'none' : 'block',
            button_bg: approved ? '#197F94' : '#4B5B72',
            action_label: approved ? 'View my payments' : 'View payment details',
        },
    }
}

/** @param {{ locale: Locale, itemLabel: string, amount: string, adminNote?: string, clientLink: string, siteUrl: string }} opts */
export function clientRejectedEmail(opts) {
    const { locale, itemLabel, amount, adminNote, clientLink, siteUrl } = opts
    const note = adminNote
        ? `<p><strong>${locale === 'fr' ? 'Note' : 'Note'}:</strong> ${adminNote.replace(/</g, '&lt;')}</p>`
        : ''
    if (locale === 'fr') {
        return {
            subject: `Mise à jour paiement — ${itemLabel}`,
            message_html: layout(
                `<p>Votre paiement pour <strong>${itemLabel}</strong> (${amount}) n'a pas pu être validé.</p>${note}${btn(clientLink, 'Voir le détail')}`,
                siteUrl,
            ),
            message: `Paiement refusé — ${itemLabel}. ${adminNote || ''} ${clientLink}`,
        }
    }
    return {
        subject: `Payment update — ${itemLabel}`,
        message_html: layout(
            `<p>Your payment for <strong>${itemLabel}</strong> (${amount}) could not be approved.</p>${note}${btn(clientLink, 'View details')}`,
            siteUrl,
        ),
        message: `Payment not approved — ${itemLabel}. ${adminNote || ''} ${clientLink}`,
    }
}

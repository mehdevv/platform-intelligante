/** Mailjet Send API v3.1 — https://dev.mailjet.com/email/guides/send-api-v31/ */

export type MailjetFrom = { Email: string; Name?: string }

export type MailjetSendResult = { sent: boolean; reason?: string; messageId?: number }

function parseFromAddress(raw: string): MailjetFrom {
    const trimmed = raw.trim()
    const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/)
    if (match) {
        return { Name: match[1].trim(), Email: match[2].trim() }
    }
    return { Email: trimmed }
}

export function mailjetFromAddress(): MailjetFrom {
    const raw = Deno.env.get('NOTIFY_FROM_EMAIL') || Deno.env.get('MAILJET_FROM_EMAIL') || ''
    if (raw) return parseFromAddress(raw)
    const email = Deno.env.get('MAILJET_FROM_EMAIL_ONLY')?.trim()
    const name = Deno.env.get('MAILJET_FROM_NAME')?.trim() || 'Researcha'
    if (email) return { Email: email, Name: name }
    return { Email: 'noreply@researcha.com', Name: 'Researcha' }
}

export async function sendMailjet(opts: {
    to: string
    subject: string
    html: string
    text?: string
}): Promise<MailjetSendResult> {
    const apiKey = Deno.env.get('MAILJET_API_KEY')?.trim()
    const secretKey = Deno.env.get('MAILJET_SECRET_KEY')?.trim()
    if (!apiKey || !secretKey) {
        console.warn('MAILJET_API_KEY or MAILJET_SECRET_KEY not set — skipping email')
        return { sent: false, reason: 'no_mailjet_credentials' }
    }

    const from = mailjetFromAddress()
    const payload = {
        Messages: [
            {
                From: from,
                To: [{ Email: opts.to.trim() }],
                Subject: opts.subject,
                HTMLPart: opts.html,
                TextPart: opts.text || stripHtml(opts.html),
            },
        ],
    }

    const auth = btoa(`${apiKey}:${secretKey}`)
    const res = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
        const errMsg =
            typeof body === 'object' && body !== null && 'ErrorMessage' in body
                ? String((body as { ErrorMessage?: string }).ErrorMessage)
                : JSON.stringify(body)
        console.error('Mailjet error', res.status, errMsg)
        return { sent: false, reason: errMsg || `http_${res.status}` }
    }

    const messages = (body as { Messages?: { Status?: string; To?: { MessageID?: number }[] }[] })?.Messages
    const first = messages?.[0]
    const messageId = first?.To?.[0]?.MessageID
    const status = first?.Status
    if (status && status !== 'success') {
        console.error('Mailjet message status', status, body)
        return { sent: false, reason: status, messageId }
    }

    return { sent: true, messageId }
}

function stripHtml(html: string) {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

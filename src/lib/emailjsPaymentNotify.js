import emailjs from '@emailjs/browser'
import { adminNewPaymentEmail, clientPaymentResponseEmail, normalizeLocale } from './paymentEmailContent'

function siteUrl() {
    const u = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
    return String(u).replace(/\/$/, '')
}

function emailjsConfig() {
    const pick = key => {
        const v = import.meta.env[key]
        if (v == null || v === '') return ''
        return String(v).trim()
    }
    return {
        publicKey: pick('VITE_EMAILJS_PUBLIC_KEY'),
        serviceId: pick('VITE_EMAILJS_SERVICE_ID'),
        templateId: pick('VITE_EMAILJS_TEMPLATE_ID'),
        templatePaymentResponse: pick('VITE_EMAILJS_TEMPLATE_PAYMENT_RESPONSE'),
        templateApproved: pick('VITE_EMAILJS_TEMPLATE_APPROVED'),
        templateRejected: pick('VITE_EMAILJS_TEMPLATE_REJECTED'),
    }
}

/** First available template id (admin default, payment response, or legacy approved/rejected). */
function resolveTemplateId(preferred) {
    const c = emailjsConfig()
    return (
        preferred ||
        c.templateId ||
        c.templatePaymentResponse ||
        c.templateApproved ||
        c.templateRejected ||
        ''
    )
}

function resolvePaymentResponseTemplateId() {
    const c = emailjsConfig()
    return c.templatePaymentResponse || c.templateApproved || c.templateRejected || c.templateId || ''
}

function isConfigured() {
    const c = emailjsConfig()
    return Boolean(c.publicKey && c.serviceId && resolveTemplateId())
}

function configDebugSnapshot() {
    const c = emailjsConfig()
    return {
        publicKey: c.publicKey ? `${c.publicKey.slice(0, 6)}…` : '(missing)',
        serviceId: c.serviceId || '(missing)',
        templateId: c.templateId || '(empty)',
        templateApproved: c.templateApproved || '(empty)',
        templateRejected: c.templateRejected || '(empty)',
        resolvedTemplate: resolveTemplateId() || '(missing)',
    }
}

function formatAmount(cents, currency, locale) {
    const major = (Number(cents) || 0) / 100
    const lc = locale === 'fr' ? 'fr-DZ' : 'en-US'
    const code = String(currency || 'DZD')
        .trim()
        .slice(0, 3)
        .toUpperCase()
    try {
        return new Intl.NumberFormat(lc, {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(major)
    } catch {
        return `${major.toFixed(2)} ${code}`
    }
}

function parseAdminEmailsFromEnv() {
    const raw = import.meta.env.VITE_EMAILJS_ADMIN_EMAILS?.trim()
    if (!raw) return []
    return raw
        .split(/[,;]/)
        .map(e => e.trim())
        .filter(Boolean)
}

/** @param {string} toEmail @param {Record<string, string>} [extra] */
async function sendOne({ toEmail, subject, message_html, message, templateId: templateOverride, extra = {} }) {
    const { publicKey, serviceId } = emailjsConfig()
    const tid = resolveTemplateId(templateOverride)
    if (!publicKey || !serviceId || !tid) {
        return { sent: false, to: toEmail, reason: 'emailjs_not_configured' }
    }

    try {
        emailjs.init({ publicKey })
        // EmailJS "To Email" field may use {{to_email}}, {{email}}, or {{user_email}} depending on template.
        const res = await emailjs.send(
            serviceId,
            tid,
            {
                to_email: toEmail,
                email: toEmail,
                user_email: toEmail,
                recipient: toEmail,
                subject,
                message_html,
                message: message || subject,
                ...extra,
            },
            { publicKey },
        )
        return { sent: res.status === 200, to: toEmail, status: res.status, text: res.text }
    } catch (err) {
        const reason =
            err?.text ||
            err?.message ||
            (typeof err === 'object' && err !== null && 'status' in err ? `HTTP ${err.status}` : null) ||
            String(err)
        console.error('EmailJS send failed', { to: toEmail, templateId: tid, reason, err })
        return { sent: false, to: toEmail, reason }
    }
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase */
async function fetchStaffRecipients(supabase) {
    const fromEnv = parseAdminEmailsFromEnv().map(email => ({ email, locale: 'en' }))
    if (fromEnv.length) return fromEnv

    const { data, error } = await supabase.rpc('list_payment_notify_staff')
    if (error) {
        console.warn('list_payment_notify_staff', error.message)
        return []
    }
    if (!Array.isArray(data)) return []
    return data.filter(r => r?.email)
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase */
async function fetchPayment(supabase, paymentRequestId) {
    const { data, error } = await supabase
        .from('payment_requests')
        .select(
            'id, user_id, kind, amount_cents, currency, status, admin_note, bundle_sector_ids, reports:report_id ( title ), sectors:sector_id ( name )',
        )
        .eq('id', paymentRequestId)
        .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new Error('Payment request not found')
    return data
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase */
async function resolveClientRecipient(supabase, userId) {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('get_payment_notify_email', {
        p_user_id: userId,
    })
    if (rpcErr) {
        console.warn('get_payment_notify_email:', rpcErr.message, '— run: npx supabase db push')
    }
    if (rpcData?.email) {
        return { email: String(rpcData.email).trim(), locale: normalizeLocale(rpcData.locale) }
    }

    const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('notification_email, locale')
        .eq('id', userId)
        .maybeSingle()

    if (profErr) console.warn('profiles lookup for notify email:', profErr.message)

    const notify = profile?.notification_email?.trim()
    if (notify) {
        return { email: notify, locale: normalizeLocale(profile?.locale) }
    }

    const { data: authData } = await supabase.auth.getUser()
    if (authData?.user?.id === userId && authData.user.email) {
        return { email: authData.user.email, locale: normalizeLocale(profile?.locale) }
    }

    return null
}

function itemLabel(payment) {
    if (payment.kind === 'report') return payment.reports?.title || 'Report'
    if (payment.kind === 'sector_bundle') {
        const n = payment.bundle_sector_ids?.length || 0
        return n ? `Sector bundle (${n} sectors)` : 'Sector bundle'
    }
    return payment.sectors?.name || 'Sector subscription'
}

/**
 * Send payment emails via EmailJS (browser, no Edge Function / Docker).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ event: 'created' | 'reviewed', paymentRequestId: string, reviewStatus?: 'approved' | 'rejected' }} opts
 */
export async function sendPaymentEmailsViaEmailJS(supabase, { event, paymentRequestId, reviewStatus }) {
    if (!supabase || !paymentRequestId) return { ok: false, reason: 'missing_args' }
    if (!isConfigured()) {
        console.warn(
            'EmailJS not configured. Add VITE_EMAILJS_* to .env and restart npm run dev (Vite only loads .env at startup).',
            configDebugSnapshot(),
        )
        return { ok: false, reason: 'emailjs_not_configured', emails: [], debug: configDebugSnapshot() }
    }

    const base = siteUrl()
    const payment = await fetchPayment(supabase, paymentRequestId)
    const label = itemLabel(payment)
    const results = []

    if (event === 'created') {
        const staff = await fetchStaffRecipients(supabase)
        if (!staff.length) {
            console.warn('No admin emails. Set VITE_EMAILJS_ADMIN_EMAILS or run migration list_payment_notify_staff.')
            return { ok: false, reason: 'no_staff_emails', emails: [] }
        }
        const adminLink = `${base}/admin/payments`
        for (const person of staff) {
            const locale = normalizeLocale(person.locale)
            const amount = formatAmount(payment.amount_cents, payment.currency, locale)
            const { subject, message_html, message } = adminNewPaymentEmail({
                locale,
                itemLabel: label,
                amount,
                adminLink,
                siteUrl: base,
            })
            results.push(
                await sendOne({
                    toEmail: person.email,
                    subject,
                    message_html,
                    message,
                    templateId: resolveTemplateId(),
                    extra: {
                        status_title:
                            locale === 'fr' ? 'Nouvelle demande de paiement' : 'New payment request',
                        item_label: label,
                        amount,
                        action_url: adminLink,
                        action_label:
                            locale === 'fr' ? 'Ouvrir la file des paiements' : 'Open payments queue',
                        admin_note: '—',
                    },
                }),
            )
            await new Promise(r => setTimeout(r, 1100))
        }
    } else {
        const recipient = await resolveClientRecipient(supabase, payment.user_id)
        if (!recipient) {
            console.warn('no_client_email for user', payment.user_id)
            return {
                ok: false,
                reason: 'no_client_email',
                hint: 'Run npx supabase db push (get_payment_notify_email) or set client notification_email on profile',
                emails: [],
            }
        }
        const clientLink = `${base}/profile`
        const amount = formatAmount(payment.amount_cents, payment.currency, recipient.locale)
        const status = reviewStatus || payment.status
        if (status !== 'approved' && status !== 'rejected') {
            return { ok: false, reason: 'payment_not_reviewed', emails: [] }
        }

        const content = clientPaymentResponseEmail({
            locale: recipient.locale,
            status,
            itemLabel: label,
            amount,
            adminNote: payment.admin_note?.trim(),
            clientLink,
        })

        results.push(
            await sendOne({
                toEmail: recipient.email,
                subject: content.subject,
                message_html: '',
                message: content.message,
                templateId: resolvePaymentResponseTemplateId(),
                extra: {
                    item_label: label,
                    amount,
                    action_url: clientLink,
                    ...content.templateParams,
                },
            }),
        )
    }

    const sentCount = results.filter(r => r.sent).length
    const failed = results.find(r => !r.sent)
    return {
        ok: sentCount > 0,
        reason: failed?.reason,
        hint:
            failed?.reason === 'The recipients address is empty'
                ? 'In EmailJS template, set To Email to {{to_email}} or {{email}} (not a fixed address).'
                : undefined,
        emails: results,
    }
}

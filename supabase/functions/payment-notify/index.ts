import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders, corsPreflightResponse, corsJson } from '../_shared/cors.ts'
import { sendMailjet } from '../_shared/mailjet.ts'
import {
    adminNewPaymentEmail,
    clientApprovedEmail,
    clientRejectedEmail,
    normalizeLocale,
} from '../_shared/paymentEmailTemplates.ts'

type EventType = 'created' | 'reviewed'

function siteUrl() {
    return (Deno.env.get('SITE_URL') || Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:5173').replace(/\/$/, '')
}

function formatAmount(cents: number, currency: string, locale: string) {
    const major = (Number(cents) || 0) / 100
    const lc = locale.startsWith('fr') ? 'fr-DZ' : 'en-US'
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

async function resolveRecipient(service: ReturnType<typeof createClient>, userId: string) {
    const { data: profile } = await service
        .from('profiles')
        .select('notification_email, locale')
        .eq('id', userId)
        .maybeSingle()

    let email = profile?.notification_email?.trim() || null
    if (!email) {
        const { data: authData, error } = await service.auth.admin.getUserById(userId)
        if (error) {
            console.error('getUserById', error)
            return null
        }
        email = authData?.user?.email ?? null
    }

    if (!email) return null
    return { email, locale: normalizeLocale(profile?.locale) }
}

Deno.serve(async req => {
    if (req.method === 'OPTIONS') {
        return corsPreflightResponse()
    }

    if (req.method !== 'POST') {
        return corsJson({ error: 'Method not allowed' }, 405)
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return corsJson({ error: 'Unauthorized' }, 401)
        }

        const body = (await req.json()) as { event?: EventType; payment_request_id?: string }
        const event = body.event
        const paymentRequestId = body.payment_request_id
        if (!event || !paymentRequestId || !['created', 'reviewed'].includes(event)) {
            return corsJson({ error: 'event and payment_request_id required' }, 400)
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (!supabaseUrl || !anonKey || !serviceKey) {
            return corsJson({ error: 'Server misconfigured' }, 500)
        }

        const userClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader } },
        })
        const {
            data: { user },
            error: userErr,
        } = await userClient.auth.getUser()
        if (userErr || !user) {
            return corsJson({ error: 'Unauthorized' }, 401)
        }

        const service = createClient(supabaseUrl, serviceKey)
        const { data: payment, error: payErr } = await service
            .from('payment_requests')
            .select(
                'id, user_id, kind, report_id, sector_id, amount_cents, currency, status, admin_note, created_at, reports:report_id ( title ), sectors:sector_id ( name )',
            )
            .eq('id', paymentRequestId)
            .maybeSingle()

        if (payErr || !payment) {
            return corsJson({ error: 'Payment request not found' }, 404)
        }

        const { data: actorProfile } = await service.from('profiles').select('app_role').eq('id', user.id).maybeSingle()
        const isStaff = actorProfile?.app_role === 'admin' || actorProfile?.app_role === 'editor'

        if (event === 'created' && payment.user_id !== user.id) {
            return corsJson({ error: 'Forbidden' }, 403)
        }
        if (event === 'reviewed' && !isStaff) {
            return corsJson({ error: 'Forbidden' }, 403)
        }

        const itemLabel =
            payment.kind === 'report'
                ? payment.reports?.title || 'Report'
                : payment.sectors?.name || 'Sector subscription'
        const base = siteUrl()
        const results: { sent: boolean; to?: string; reason?: string; messageId?: number }[] = []

        if (event === 'created') {
            const { data: staff } = await service.from('profiles').select('id').in('app_role', ['admin', 'editor'])
            const adminLink = `${base}/admin/payments`

            for (const s of staff || []) {
                const recipient = await resolveRecipient(service, s.id)
                if (!recipient) continue
                const amount = formatAmount(payment.amount_cents, payment.currency, recipient.locale)
                const { subject, html } = adminNewPaymentEmail({
                    locale: recipient.locale,
                    itemLabel,
                    amount,
                    adminLink,
                    siteUrl: base,
                })
                const r = await sendMailjet({ to: recipient.email, subject, html })
                results.push({ sent: r.sent, to: recipient.email, reason: r.reason, messageId: r.messageId })
            }
        } else {
            const recipient = await resolveRecipient(service, payment.user_id)
            const clientLink = `${base}/profile`
            if (recipient) {
                const amount = formatAmount(payment.amount_cents, payment.currency, recipient.locale)
                if (payment.status === 'approved') {
                    const { subject, html } = clientApprovedEmail({
                        locale: recipient.locale,
                        itemLabel,
                        amount,
                        clientLink,
                        siteUrl: base,
                    })
                    const r = await sendMailjet({ to: recipient.email, subject, html })
                    results.push({ sent: r.sent, to: recipient.email, reason: r.reason, messageId: r.messageId })
                } else if (payment.status === 'rejected') {
                    const { subject, html } = clientRejectedEmail({
                        locale: recipient.locale,
                        itemLabel,
                        amount,
                        adminNote: payment.admin_note?.trim(),
                        clientLink,
                        siteUrl: base,
                    })
                    const r = await sendMailjet({ to: recipient.email, subject, html })
                    results.push({ sent: r.sent, to: recipient.email, reason: r.reason, messageId: r.messageId })
                }
            }
        }

        return corsJson({ ok: true, emails: results })
    } catch (e) {
        console.error(e)
        return corsJson({ error: 'Internal error' }, 500)
    }
})

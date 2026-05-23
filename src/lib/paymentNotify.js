import { sendPaymentEmailsViaEmailJS } from './emailjsPaymentNotify'

/**
 * Payment notification emails via EmailJS (runs in the browser).
 * In-app notifications still come from DB triggers on payment_requests.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ event: 'created' | 'reviewed', paymentRequestId: string, reviewStatus?: 'approved' | 'rejected' }} opts
 * @returns {Promise<{ ok?: boolean, reason?: string, hint?: string, emails?: unknown[] }>}
 */
export async function notifyPaymentEvent(supabase, { event, paymentRequestId, reviewStatus }) {
    try {
        const result = await sendPaymentEmailsViaEmailJS(supabase, { event, paymentRequestId, reviewStatus })
        if (!result.ok) {
            const detail = result.reason || result.emails?.find(e => e?.reason)?.reason || 'send_failed'
            console.warn('payment-notify', detail, result.hint || '', result.emails)
            return { ...result, reason: detail }
        }
        return result
    } catch (err) {
        console.error('payment-notify', err)
        return { ok: false, reason: err?.message || 'error' }
    }
}

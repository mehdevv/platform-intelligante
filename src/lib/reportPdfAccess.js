import { REPORT_PDFS_BUCKET } from './reportPdfStorage'

/** Short-lived signed URLs — not exposed in UI; fetched into memory only. */
export const REPORT_PDF_SIGNED_URL_TTL_SEC = 180

/** Edge stream is opt-in until `report-pdf-stream` is deployed (avoids CORS noise in dev). */
export function isPdfEdgeStreamEnabled() {
    return import.meta.env.VITE_USE_PDF_EDGE_STREAM === 'true'
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} reportId
 * @param {{ isStaff?: boolean }} [opts]
 */
export async function userCanReadFullReportPdf(supabase, reportId, opts = {}) {
    if (!supabase || !reportId) return false
    if (opts.isStaff) return true
    const { data: entitled, error } = await supabase.rpc('has_report_entitlement', { p_report_id: reportId })
    if (error) {
        console.error('has_report_entitlement', error)
        return false
    }
    return !!entitled
}

/**
 * Load full PDF bytes without leaving a long-lived URL in the DOM.
 * Prefers Edge Function stream (no storage signed URL in Network tab).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} reportId
 * @returns {Promise<{ data: Uint8Array } | { error: Error }>}
 */
export async function loadSecureReportPdfBytes(supabase, reportId) {
    if (!supabase || !reportId) return { error: new Error('Missing client or report.') }

    if (isPdfEdgeStreamEnabled()) {
        const edge = await fetchReportPdfViaEdgeFunction(supabase, reportId)
        if (edge.data) return { data: edge.data }
        if (edge.error && !edge.fallback) return { error: edge.error }
    }

    return loadReportPdfBytesViaSignedUrl(supabase, reportId)
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} reportId
 */
async function fetchReportPdfViaEdgeFunction(supabase, reportId) {
    const baseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!baseUrl || !anonKey) {
        return { error: new Error('Supabase not configured'), fallback: true }
    }

    const {
        data: { session },
    } = await supabase.auth.getSession()
    if (!session?.access_token) {
        return { error: new Error('Sign in to read this report.'), fallback: false }
    }

    const url = `${baseUrl}/functions/v1/report-pdf-stream?report_id=${encodeURIComponent(reportId)}`
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                apikey: anonKey,
            },
            cache: 'no-store',
        })
        if (res.status === 404) {
            return { error: new Error('Full PDF is not available for this report yet.'), fallback: true }
        }
        if (res.status === 401 || res.status === 403) {
            return { error: new Error('You do not have access to this report.'), fallback: false }
        }
        if (!res.ok) {
            const body = await res.text().catch(() => '')
            const isMissingFn =
                res.status === 404 ||
                body.includes('NOT_FOUND') ||
                body.includes('function') ||
                res.status === 502
            return {
                error: new Error(isMissingFn ? 'PDF stream unavailable' : `Could not load PDF (${res.status})`),
                fallback: true,
            }
        }
        const buf = await res.arrayBuffer()
        return { data: clonePdfBytes(buf) }
    } catch (e) {
        return { error: e instanceof Error ? e : new Error('Network error loading PDF'), fallback: true }
    }
}

/** Copy bytes so pdf.js worker transfer cannot detach our only buffer (Strict Mode / re-renders). */
export function clonePdfBytes(source) {
    const view = source instanceof ArrayBuffer ? new Uint8Array(source) : source
    return new Uint8Array(view)
}

/**
 * Object URL for react-pdf — avoids postMessage ArrayBuffer detach errors in the worker.
 * Caller must revoke with URL.revokeObjectURL when done.
 * @param {Uint8Array} bytes
 */
export function pdfBytesToObjectUrl(bytes) {
    const blob = new Blob([bytes], { type: 'application/pdf' })
    return URL.createObjectURL(blob)
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} reportId
 */
async function loadReportPdfBytesViaSignedUrl(supabase, reportId) {
    const { data: ra, error: metaErr } = await supabase
        .from('report_assets')
        .select('storage_path')
        .eq('report_id', reportId)
        .eq('asset_type', 'full_pdf')
        .maybeSingle()

    if (metaErr) return { error: new Error(metaErr.message) }
    if (!ra?.storage_path) return { error: new Error('Full PDF is not available for this report yet.') }

    const { data: signed, error: signErr } = await supabase.storage
        .from(REPORT_PDFS_BUCKET)
        .createSignedUrl(ra.storage_path, REPORT_PDF_SIGNED_URL_TTL_SEC)

    if (signErr || !signed?.signedUrl) {
        return { error: new Error(signErr?.message || 'Could not authorize PDF access.') }
    }

    try {
        const res = await fetch(signed.signedUrl, { cache: 'no-store', credentials: 'omit' })
        if (!res.ok) return { error: new Error(`PDF fetch failed (${res.status})`) }
        const buf = await res.arrayBuffer()
        return { data: clonePdfBytes(buf) }
    } catch (e) {
        return { error: e instanceof Error ? e : new Error('Failed to download PDF') }
    }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} reportId
 */
export async function logReportOpenEvent(supabase, reportId) {
    if (!supabase) return
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('usage_events').insert({
        user_id: user.id,
        event_type: 'report_open',
        report_id: reportId,
        metadata: { viewer: 'secure' },
    })
}

import { reportPublicPath } from './reportPath'

const POPULAR_FETCH_LIMIT = 12
/** ~3 lines of chips (height + gap); extra items are clipped. */
export const POPULAR_MAX_LINES = 3
export const POPULAR_CHIP_LINE_PX = 32

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string[]} [localeFallback] static labels when DB has no sales yet
 */
export async function fetchPopularReportsBySales(supabase, localeFallback = []) {
    if (!supabase) return []

    const { data, error } = await supabase.rpc('popular_reports_by_sales', { p_limit: POPULAR_FETCH_LIMIT })
    if (error) throw error

    const rows = Array.isArray(data) ? data : []
    const withSales = rows
        .filter(r => r?.id && r?.slug && r?.title)
        .map(r => ({
            id: r.id,
            slug: r.slug,
            title: String(r.title),
            salesCount: Number(r.sales_count) || 0,
            href: reportPublicPath(r),
        }))

    if (withSales.length > 0) return withSales

    if (!localeFallback.length) return []

    return localeFallback.slice(0, POPULAR_FETCH_LIMIT).map((label, i) => ({
        id: `fallback-${i}`,
        slug: '',
        title: label,
        salesCount: 0,
        href: '/reports',
    }))
}

/** Short label for chip (one line). */
export function popularReportChipLabel(title, maxLen = 36) {
    const t = String(title || '').trim()
    if (t.length <= maxLen) return t
    return `${t.slice(0, maxLen - 1)}…`
}

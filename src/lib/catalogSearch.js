/** Strip characters that break PostgREST `ilike` patterns. */
export function sanitizeSearchQuery(q) {
    return String(q || '')
        .trim()
        .replace(/[%_,]/g, '')
        .slice(0, 80)
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} query
 * @param {{ limit?: number }} [opts]
 */
export async function searchCatalog(supabase, query, opts = {}) {
    const limit = opts.limit ?? 6
    const safe = sanitizeSearchQuery(query)
    if (!supabase || safe.length < 2) {
        return { reports: [], sectors: [], error: null }
    }

    const pattern = `%${safe}%`
    const [reportsRes, sectorsRes] = await Promise.all([
        supabase
            .from('reports')
            .select('id, slug, title, summary, sectors(name, slug)')
            .eq('status', 'published')
            .or(`title.ilike.${pattern},summary.ilike.${pattern}`)
            .order('published_at', { ascending: false, nullsFirst: false })
            .limit(limit),
        supabase
            .from('sectors')
            .select('id, slug, name, description, icon_image_url')
            .eq('is_published', true)
            .or(`name.ilike.${pattern},slug.ilike.${pattern},description.ilike.${pattern}`)
            .order('sort_order')
            .order('name')
            .limit(limit),
    ])

    const error = reportsRes.error?.message || sectorsRes.error?.message || null
    return {
        reports: reportsRes.data || [],
        sectors: sectorsRes.data || [],
        error,
    }
}

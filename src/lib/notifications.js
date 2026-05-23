/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
export async function fetchUnreadNotifications(supabase, limit = 12) {
    if (!supabase) return { rows: [], count: 0 }
    const { data, error, count } = await supabase
        .from('in_app_notifications')
        .select('id, title, body, href, category, entity_type, entity_id, created_at, read_at', { count: 'exact' })
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(limit)
    if (error) throw error
    return { rows: data || [], count: count ?? 0 }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string[]} ids
 */
export async function markNotificationsRead(supabase, ids) {
    if (!supabase || !ids?.length) return
    const now = new Date().toISOString()
    const { error } = await supabase.from('in_app_notifications').update({ read_at: now }).in('id', ids)
    if (error) throw error
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
export async function markAllNotificationsRead(supabase) {
    if (!supabase) return
    const now = new Date().toISOString()
    const { error } = await supabase.from('in_app_notifications').update({ read_at: now }).is('read_at', null)
    if (error) throw error
}

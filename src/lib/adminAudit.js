/**
 * Append-only admin audit row (RLS: staff, actor_id must be current user).
 */
export async function logAdminAction(supabase, { action, entityType, entityId, diff }) {
    if (!supabase) return
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('admin_audit_log').insert({
        actor_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId != null ? String(entityId) : null,
        diff: diff ?? null,
    })
}

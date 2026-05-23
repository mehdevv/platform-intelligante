/** @param {{ kind: string, reports?: { title?: string }, sectors?: { name?: string }, sector_id?: string, report_id?: string, bundle_sectors?: { name?: string }[], bundle_sector_ids?: string[] }} row */
export function paymentRequestKindLabel(row) {
    if (row.kind === 'sector_bundle') {
        const names = (row.bundle_sectors || []).map(s => s?.name).filter(Boolean)
        const n = row.bundle_sector_ids?.length || names.length || 0
        if (names.length) {
            const preview = names.slice(0, 3).join(', ')
            const more = names.length > 3 ? ` +${names.length - 3}` : ''
            return `Sector bundle (${n}) — ${preview}${more}`
        }
        return n ? `Sector bundle — ${n} sectors` : 'Sector bundle'
    }
    if (row.kind === 'sector_subscription') {
        return `Sector — ${row.sectors?.name || row.sector_id?.slice(0, 8) || '—'}`
    }
    if (row.kind === 'report') {
        return `Report — ${row.reports?.title || row.report_id?.slice(0, 8) || '—'}`
    }
    return row.kind || '—'
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase */
export async function enrichPaymentRowsWithBundleSectors(supabase, rows) {
    if (!supabase || !rows?.length) return rows || []

    const idSet = new Set()
    for (const row of rows) {
        if (row.kind === 'sector_bundle' && row.bundle_sector_ids?.length) {
            for (const id of row.bundle_sector_ids) idSet.add(id)
        }
    }
    if (idSet.size === 0) return rows

    const { data: sectors, error } = await supabase
        .from('sectors')
        .select('id, name, slug')
        .in('id', [...idSet])

    if (error) {
        console.warn('enrichPaymentRowsWithBundleSectors', error.message)
        return rows
    }

    const byId = Object.fromEntries((sectors || []).map(s => [s.id, s]))
    return rows.map(row => {
        if (row.kind !== 'sector_bundle' || !row.bundle_sector_ids?.length) return row
        return {
            ...row,
            bundle_sectors: row.bundle_sector_ids.map(id => byId[id]).filter(Boolean),
        }
    })
}

const SECTOR_SUB_DAYS = 30

/** Grant or renew sector subscription entitlements for one or many sectors (single approval). */
export async function grantSectorSubscriptionAccess(supabase, { userId, sectorIds, notes }) {
    if (!supabase || !userId || !sectorIds?.length) return

    const expiresAt = new Date(Date.now() + SECTOR_SUB_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const patch = { source: 'subscription', expires_at: expiresAt, notes: notes?.trim() || null }

    for (const sectorId of sectorIds) {
        const { data: existing, error: selErr } = await supabase
            .from('user_report_entitlements')
            .select('id')
            .eq('user_id', userId)
            .eq('sector_id', sectorId)
            .maybeSingle()
        if (selErr) throw new Error(selErr.message)

        if (existing?.id) {
            const { error } = await supabase.from('user_report_entitlements').update(patch).eq('id', existing.id)
            if (error) throw new Error(error.message)
        } else {
            const { error } = await supabase.from('user_report_entitlements').insert({
                user_id: userId,
                sector_id: sectorId,
                ...patch,
            })
            if (error) throw new Error(error.message)
        }
    }
}

/** @param {{ kind: string, sector_id?: string, bundle_sector_ids?: string[] }} row */
export function sectorIdsForPaymentApproval(row) {
    if (row.kind === 'sector_bundle' && row.bundle_sector_ids?.length) {
        return row.bundle_sector_ids
    }
    if (row.kind === 'sector_subscription' && row.sector_id) {
        return [row.sector_id]
    }
    return []
}

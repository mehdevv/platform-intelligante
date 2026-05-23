import { isEntitlementActive } from './accountActions'

/**
 * @param {Array<{ report_id?: string, sector_id?: string, expires_at?: string | null }>} entitlements
 */
export function buildOwnedReportAccess(entitlements) {
    const ownedReportIds = new Set()
    const ownedSectorIds = new Set()
    for (const row of entitlements || []) {
        if (!isEntitlementActive(row)) continue
        if (row.report_id) ownedReportIds.add(row.report_id)
        if (row.sector_id) ownedSectorIds.add(row.sector_id)
    }
    return { ownedReportIds, ownedSectorIds }
}

/**
 * @param {{ id: string, sector_id?: string | null }} report
 * @param {{ ownedReportIds: Set<string>, ownedSectorIds: Set<string> }} access
 */
export function isReportOwned(report, access) {
    if (!report?.id || !access) return false
    if (access.ownedReportIds.has(report.id)) return true
    if (report.sector_id && access.ownedSectorIds.has(report.sector_id)) return true
    return false
}

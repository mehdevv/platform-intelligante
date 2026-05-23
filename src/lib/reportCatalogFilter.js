import { priceRangeFilterIsActive, reportMatchesPriceRange10k } from './reportPriceUnits'

/**
 * @param {object} report
 * @param {{ selectedSectorSlugs?: Set<string>, priceRangeUnits?: [number, number], catalogMaxPriceUnit?: number, search?: string }} opts
 */
export function reportPassesCatalogFilters(report, opts = {}) {
    const { selectedSectorSlugs, priceRangeUnits, catalogMaxPriceUnit, search } = opts
    if (selectedSectorSlugs?.size > 0) {
        const slug = report.sectors?.slug
        if (!slug || !selectedSectorSlugs.has(slug)) return false
    }
    if (priceRangeUnits && catalogMaxPriceUnit != null) {
        const [minU, maxU] = priceRangeUnits
        if (
            priceRangeFilterIsActive(minU, maxU, catalogMaxPriceUnit) &&
            !reportMatchesPriceRange10k(report.price_cents, minU, maxU)
        ) {
            return false
        }
    } else if (priceRangeUnits) {
        const [minU, maxU] = priceRangeUnits
        if (!reportMatchesPriceRange10k(report.price_cents, minU, maxU)) return false
    }
    const q = (search || '').trim().toLowerCase()
    if (q) {
        const title = (report.title || '').toLowerCase()
        const summary = (report.summary || '').toLowerCase()
        const sector = (report.sectors?.name || '').toLowerCase()
        if (!title.includes(q) && !summary.includes(q) && !sector.includes(q)) return false
    }
    return true
}

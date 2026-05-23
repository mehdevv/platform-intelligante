/** One filter step = 10,000 DZD (major currency units). */
export const DZD_PRICE_STEP_MAJOR = 10_000

/** Convert stored cents to price-range units (multiples of 10k DZD). */
export function priceCentsToUnit10k(cents) {
    const major = (Number(cents) || 0) / 100
    return major / DZD_PRICE_STEP_MAJOR
}

/** Highest step needed to include all report prices (at least 1). */
export function maxPriceUnit10kFromReports(reports) {
    let max = 0
    for (const r of reports || []) {
        const u = priceCentsToUnit10k(r.price_cents)
        if (u > max) max = u
    }
    return Math.max(Math.ceil(max), 1)
}

/** Human label for a 10k-DZD step, e.g. 0 → "0", 3 → "30k". */
export function formatPriceUnit10kLabel(unit) {
    const n = Number(unit) || 0
    if (n <= 0) return '0'
    return `${Math.round(n * 10)}k`
}

/** Full range label for UI, e.g. "0 – 50k DZD". */
export function formatPriceRange10kLabel(minUnit, maxUnit) {
    const lo = formatPriceUnit10kLabel(minUnit)
    const hi = formatPriceUnit10kLabel(maxUnit)
    if (minUnit <= 0 && maxUnit <= 0) return '0 DZD'
    return `${lo} – ${hi} DZD`
}

/** Major DZD amount for a range step (e.g. unit 3 → 30,000 DZD). */
export function priceUnit10kToMajor(unit) {
    return (Number(unit) || 0) * DZD_PRICE_STEP_MAJOR
}

/** True when min/max differ from the default “show all prices” range. */
export function priceRangeFilterIsActive(minUnit, maxUnit, catalogMaxUnit) {
    const catalogMax = Math.max(1, Math.ceil(Number(catalogMaxUnit) || 1))
    const min = Number(minUnit) || 0
    const max = Number(maxUnit) || 0
    return min > 0 || max < catalogMax
}

/** Whether a stored price (cents) falls within an inclusive 10k-DZD step range. */
export function reportMatchesPriceRange10k(priceCents, minUnit, maxUnit) {
    const major = (Number(priceCents) || 0) / 100
    const minMajor = priceUnit10kToMajor(minUnit)
    const maxMajor = priceUnit10kToMajor(maxUnit)
    return major >= minMajor && major <= maxMajor
}

/** Slider marks at each 10k step (capped for readability). */
export function buildPriceRangeMarks10k(maxUnit) {
    const max = Math.max(1, Math.ceil(Number(maxUnit) || 1))
    const step = max > 12 ? Math.ceil(max / 6) : 1
    const marks = []
    for (let u = 0; u <= max; u += step) {
        marks.push({ value: u, label: formatPriceUnit10kLabel(u) })
    }
    if (marks[marks.length - 1]?.value !== max) {
        marks.push({ value: max, label: formatPriceUnit10kLabel(max) })
    }
    return marks
}

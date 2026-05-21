/**
 * Convert admin price field (major currency units, e.g. 49.99) to integer cents for DB.
 * Accepts comma as decimal separator.
 */
export function majorAmountToCents(input) {
    const s = String(input ?? '')
        .trim()
        .replace(/\s/g, '')
        .replace(',', '.')
    if (!s) return 0
    const n = Number.parseFloat(s)
    if (!Number.isFinite(n) || n < 0) return 0
    return Math.round(n * 100)
}

/**
 * Format stored cents for display with two fraction digits (fixes "missing .00").
 */
export function formatPriceFromCents(cents, currency = 'DZD', locale) {
    const c = Number(cents)
    if (!Number.isFinite(c) || c <= 0) return ''
    const major = c / 100
    const lc = locale || (typeof navigator !== 'undefined' && navigator.language) || 'en-US'
    const code = String(currency || 'DZD')
        .trim()
        .slice(0, 3)
        .toUpperCase()
    try {
        return new Intl.NumberFormat(lc, {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(major)
    } catch {
        return `${major.toFixed(2)} ${code}`.trim()
    }
}

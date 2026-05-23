/** Two-tailed normal quantile (Acklam approximation). */
export function normalQuantile(p) {
    const x = Math.min(0.999999, Math.max(0.000001, p))
    const a = [
        -3.969683028665376e1, 2.209460984245205e2, -2.759285104469138e2, 1.383577518672690e2,
        -3.066479806614716e1, 2.506628277459239e0,
    ]
    const b = [
        -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680654381936774e1,
        -1.328068155288572e1,
    ]
    const c = [
        -7.784894002430293e-3, -3.223964580411365e-1, -2.400758227161838e0, -2.549732539343734e0,
        4.374664141464968e0, 2.938163982698083e0,
    ]
    const d = [7.784695709091636e-3, 3.224671290700398e-1, 2.445134137142996e0, 3.754408661907416e0]
    const pLow = 0.02425
    const pHigh = 1 - pLow
    let q
    let r
    if (x < pLow) {
        q = Math.sqrt(-2 * Math.log(x))
        return (
            (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
        )
    }
    if (x > pHigh) {
        q = Math.sqrt(-2 * Math.log(1 - x))
        return -(
            (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
        )
    }
    q = x - 0.5
    r = q * q
    return (
        ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
        (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    )
}

/** Z for a two-tailed confidence level in percent (e.g. 95 → 1.96). */
export function zScoreFromConfidence(confidencePct) {
    const pct = Math.min(99.99, Math.max(1, Number(confidencePct) || 95))
    const tailProb = 0.5 + pct / 200
    return normalQuantile(tailProb)
}

export function clampConfidencePct(value) {
    const n = Number(value)
    if (!Number.isFinite(n)) return 95
    return Math.min(99.99, Math.max(1, Math.round(n * 100) / 100))
}

/**
 * Finite-population sample size (proportion, p = 0.5).
 * @param {number} population
 * @param {number} confidencePct
 * @param {number} marginPct
 */
export function suggestSample(population, confidencePct, marginPct) {
    const z = zScoreFromConfidence(confidencePct)
    const p = 0.5
    const e = Math.max(0.1, Number(marginPct) || 5) / 100
    if (!population || population <= 0) {
        return Math.ceil((z * z * p * (1 - p)) / (e * e))
    }
    const num = population * z * z * p * (1 - p)
    const den = e * e * (population - 1) + z * z * p * (1 - p)
    return Math.max(1, Math.ceil(num / den))
}

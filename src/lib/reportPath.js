/** Public URL segment: prefer stable slug, else id */
export function reportPublicPath(report) {
    if (!report) return '/reports'
    return `/reports/${report.slug || report.id}`
}

export function isUuid(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ''))
}

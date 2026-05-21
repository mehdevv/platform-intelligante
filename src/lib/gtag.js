/**
 * Google Analytics 4 (gtag.js) — loads only when `VITE_GA_MEASUREMENT_ID` is set.
 * @see https://developers.google.com/analytics/devguides/collection/ga4
 */

const MEASUREMENT_ID = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GA_MEASUREMENT_ID : ''

let initialized = false

export function isGa4Configured() {
    return Boolean(typeof MEASUREMENT_ID === 'string' && MEASUREMENT_ID.trim().startsWith('G-'))
}

/**
 * Injects gtag snippet (matches Google’s recommended order: dataLayer + inline gtag, then async script).
 * Safe to call multiple times (no-op after first success).
 */
export function initGtag() {
    if (!isGa4Configured() || typeof window === 'undefined' || initialized) return
    initialized = true

    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', MEASUREMENT_ID.trim())

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID.trim())}`
    document.head.appendChild(script)
}

/** SPA navigations after the first paint (initial page_view comes from `config`). */
export function gtagPageView(pagePath) {
    if (!isGa4Configured() || typeof window === 'undefined' || typeof window.gtag !== 'function') return
    window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: typeof document !== 'undefined' ? document.title : '',
    })
}

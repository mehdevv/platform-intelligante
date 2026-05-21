import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gtagPageView, isGa4Configured } from '../lib/gtag'

/**
 * Sends GA4 `page_view` on client-side route changes (React Router).
 * Initial load is covered by the first `gtag('config', …)` in `initGtag()`.
 */
export default function GoogleAnalyticsRouteListener() {
    const { pathname, search } = useLocation()
    const skipFirst = useRef(true)

    useEffect(() => {
        if (!isGa4Configured()) return
        const path = pathname + (search || '')
        if (skipFirst.current) {
            skipFirst.current = false
            return
        }
        gtagPageView(path)
    }, [pathname, search])

    return null
}

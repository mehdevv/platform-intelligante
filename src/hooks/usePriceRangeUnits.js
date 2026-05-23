import { useEffect, useMemo, useRef, useState } from 'react'
import { maxPriceUnit10kFromReports } from '../lib/reportPriceUnits'

/** Keeps a [min, max] 10k-DZD slider range in sync with loaded report prices. */
export function usePriceRangeUnits(reports) {
    const maxPriceUnit = useMemo(() => maxPriceUnit10kFromReports(reports), [reports])
    const [priceRangeUnits, setPriceRangeUnits] = useState([0, 1])
    const initialized = useRef(false)

    useEffect(() => {
        const max = maxPriceUnit
        if (!initialized.current) {
            initialized.current = true
            setPriceRangeUnits([0, max])
            return
        }
        setPriceRangeUnits(([lo, hi]) => {
            const nextHi = hi <= 0 ? max : Math.min(Math.max(hi, lo), max)
            return [Math.min(lo, max), nextHi]
        })
    }, [maxPriceUnit])

    return { priceRangeUnits, setPriceRangeUnits, maxPriceUnit }
}

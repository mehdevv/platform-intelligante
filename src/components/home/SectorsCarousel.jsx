import React, { useCallback, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { motion, useMotionValue, animate, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SectorCarouselCard } from './HomeMarketCards'

const CAROUSEL_BG = '#f8fafc'
const EDGE_FADE_PX = 72

function buildEdgeMask({ canLeft, canRight }) {
    const fade = EDGE_FADE_PX
    const start = canLeft ? `transparent 0px, black ${fade}px` : 'black 0px'
    const end = canRight ? `black calc(100% - ${fade}px), transparent 100%` : 'black 100%'
    return `linear-gradient(to right, ${start}, ${end})`
}

function edgeGlowShadow({ canLeft, canRight }) {
    const parts = []
    if (canLeft) parts.push(`inset 48px 0 40px -36px ${CAROUSEL_BG}`)
    if (canRight) parts.push(`inset -48px 0 40px -36px ${CAROUSEL_BG}`)
    return parts.join(', ') || 'none'
}

const spring = { type: 'spring', stiffness: 420, damping: 38, mass: 0.85 }

/**
 * @param {{
 *   sectors: object[],
 *   reportCounts: Record<string, number>,
 *   loading?: boolean,
 * }} props
 */
export default function SectorsCarousel({ sectors, reportCounts, loading = false }) {
    const { t } = useTranslation()
    const reduceMotion = useReducedMotion()
    const viewportRef = useRef(null)
    const trackRef = useRef(null)
    const x = useMotionValue(0)
    const [constraints, setConstraints] = useState({ left: 0, right: 0 })
    const [edgeScroll, setEdgeScroll] = useState({ canLeft: false, canRight: false })

    const measure = useCallback(() => {
        const viewport = viewportRef.current
        const track = trackRef.current
        if (!viewport || !track) return
        const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth)
        const left = -overflow
        setConstraints({ left, right: 0 })
        const current = x.get()
        const clamped = Math.min(0, Math.max(left, current))
        if (clamped !== current) x.set(clamped)
        setEdgeScroll({
            canLeft: clamped < -4,
            canRight: clamped > left + 4,
        })
    }, [x])

    useEffect(() => {
        measure()
        const ro = new ResizeObserver(() => measure())
        if (viewportRef.current) ro.observe(viewportRef.current)
        if (trackRef.current) ro.observe(trackRef.current)
        window.addEventListener('resize', measure, { passive: true })
        return () => {
            ro.disconnect()
            window.removeEventListener('resize', measure)
        }
    }, [measure, sectors.length, loading])

    useEffect(() => {
        const unsub = x.on('change', latest => {
            setEdgeScroll({
                canLeft: latest < -4,
                canRight: latest > constraints.left + 4,
            })
        })
        return unsub
    }, [x, constraints.left])

    const scrollBy = dir => {
        const viewport = viewportRef.current
        if (!viewport) return
        const step = Math.min(340, viewport.clientWidth * 0.82)
        const target = Math.min(0, Math.max(constraints.left, x.get() - dir * step))
        if (reduceMotion) {
            x.set(target)
            return
        }
        animate(x, target, spring)
    }

    const mask = buildEdgeMask(edgeScroll)
    const glow = edgeGlowShadow(edgeScroll)

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0, md: 1 },
                px: 0,
            }}
        >
            <IconButton
                type="button"
                aria-label="Scroll topics left"
                onClick={() => scrollBy(-1)}
                disabled={!edgeScroll.canLeft || loading}
                sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                    flexShrink: 0,
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    ml: 2,
                    zIndex: 2,
                    '&:hover': { bgcolor: 'grey.50' },
                }}
            >
                <ChevronLeftIcon />
            </IconButton>

            <Box
                ref={viewportRef}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    py: 2,
                    px: { xs: 0, md: 0 },
                    maskImage: mask,
                    WebkitMaskImage: mask,
                    boxShadow: glow,
                }}
            >
                <motion.div
                    ref={trackRef}
                    style={{
                        x,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'stretch',
                        gap: 16,
                        paddingLeft: 16,
                        paddingRight: 16,
                        cursor: reduceMotion ? 'default' : 'grab',
                        touchAction: 'pan-y',
                    }}
                    drag={reduceMotion ? false : 'x'}
                    dragConstraints={constraints}
                    dragElastic={0.06}
                    dragMomentum
                    onDragEnd={() => measure()}
                    whileTap={reduceMotion ? undefined : { cursor: 'grabbing' }}
                >
                    {loading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 280, py: 8 }}>
                            <CircularProgress size={32} color="secondary" />
                        </Box>
                    )}
                    {!loading && !sectors.length && (
                        <Box sx={{ px: 2, py: 4, minWidth: '100%' }}>
                            <Alert severity="info" sx={{ maxWidth: 480, mx: 'auto' }}>
                                {t('home.sectorsEmpty')}
                            </Alert>
                        </Box>
                    )}
                    {!loading &&
                        sectors.map(sector => (
                            <SectorCarouselCard key={sector.id} sector={sector} reportCount={reportCounts[sector.id] || 0} />
                        ))}
                </motion.div>
            </Box>

            <IconButton
                type="button"
                aria-label="Scroll topics right"
                onClick={() => scrollBy(1)}
                disabled={!edgeScroll.canRight || loading}
                sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                    flexShrink: 0,
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    mr: 2,
                    zIndex: 2,
                    '&:hover': { bgcolor: 'grey.50' },
                }}
            >
                <ChevronRightIcon />
            </IconButton>
        </Box>
    )
}

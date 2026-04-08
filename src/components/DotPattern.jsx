import { useCallback, useEffect, useMemo, useRef } from 'react'
import { cn } from '../lib/cn'

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
              r: Number.parseInt(result[1], 16),
              g: Number.parseInt(result[2], 16),
              b: Number.parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 }
}

/**
 * Interactive dot grid (canvas). Use variant="hero" inside a position:relative section.
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').ReactNode} [props.children]
 * @param {number} [props.dotSize]
 * @param {number} [props.gap]
 * @param {string} [props.baseColor]
 * @param {string} [props.glowColor]
 * @param {number} [props.proximity]
 * @param {number} [props.glowIntensity]
 * @param {number} [props.waveSpeed] 0 disables wave motion
 * @param {'hero' | 'full'} [props.variant] hero = absolute fill parent; full = fixed viewport (demo)
 * @param {'default' | 'navy' | 'none'} [props.vignette]
 */
export function DotPattern({
    className,
    children,
    dotSize = 2,
    gap = 24,
    baseColor = '#404040',
    glowColor = '#22d3ee',
    proximity = 120,
    glowIntensity = 1,
    waveSpeed = 0.5,
    variant = 'hero',
    vignette = 'navy',
}) {
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const dotsRef = useRef([])
    const mouseRef = useRef({ x: -1000, y: -1000 })

    const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor])
    const glowRgb = useMemo(() => hexToRgb(glowColor), [glowColor])

    const buildGrid = useCallback(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const rect = container.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1

        canvas.width = Math.max(1, Math.floor(rect.width * dpr))
        canvas.height = Math.max(1, Math.floor(rect.height * dpr))
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`

        const ctx = canvas.getContext('2d')
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        const cellSize = dotSize + gap
        const cols = Math.ceil(rect.width / cellSize) + 1
        const rows = Math.ceil(rect.height / cellSize) + 1

        const offsetX = (rect.width - (cols - 1) * cellSize) / 2
        const offsetY = (rect.height - (rows - 1) * cellSize) / 2

        const dots = []
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                dots.push({
                    x: offsetX + col * cellSize,
                    y: offsetY + row * cellSize,
                    baseOpacity: 0.3 + Math.random() * 0.2,
                })
            }
        }
        dotsRef.current = dots
    }, [dotSize, gap])

    useEffect(() => {
        buildGrid()
        const container = containerRef.current
        if (!container) return
        const ro = new ResizeObserver(() => buildGrid())
        ro.observe(container)
        return () => ro.disconnect()
    }, [buildGrid])

    useEffect(() => {
        let rafId
        let startMs = null

        const tick = () => {
            const canvas = canvasRef.current
            if (!canvas) {
                rafId = requestAnimationFrame(tick)
                return
            }

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                rafId = requestAnimationFrame(tick)
                return
            }

            if (startMs == null) startMs = performance.now()

            const dpr = window.devicePixelRatio || 1
            const w = canvas.width / dpr
            const h = canvas.height / dpr
            ctx.clearRect(0, 0, w, h)

            const { x: mx, y: my } = mouseRef.current
            const proxSq = proximity * proximity
            const time = (performance.now() - startMs) * 0.001 * waveSpeed

            for (const dot of dotsRef.current) {
                const dx = dot.x - mx
                const dy = dot.y - my
                const distSq = dx * dx + dy * dy

                const wave = Math.sin(dot.x * 0.02 + dot.y * 0.02 + time) * 0.5 + 0.5
                const waveOpacity = dot.baseOpacity + wave * 0.15
                const waveScale = 1 + wave * 0.2

                let opacity = waveOpacity
                let scale = waveScale
                let r = baseRgb.r
                let g = baseRgb.g
                let b = baseRgb.b
                let glow = 0

                if (distSq < proxSq) {
                    const dist = Math.sqrt(distSq)
                    const t = 1 - dist / proximity
                    const easedT = t * t * (3 - 2 * t)

                    r = Math.round(baseRgb.r + (glowRgb.r - baseRgb.r) * easedT)
                    g = Math.round(baseRgb.g + (glowRgb.g - baseRgb.g) * easedT)
                    b = Math.round(baseRgb.b + (glowRgb.b - baseRgb.b) * easedT)

                    opacity = Math.min(1, waveOpacity + easedT * 0.7)
                    scale = waveScale + easedT * 0.8
                    glow = easedT * glowIntensity
                }

                const radius = (dotSize / 2) * scale

                if (glow > 0) {
                    const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, radius * 4)
                    gradient.addColorStop(0, `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, ${glow * 0.4})`)
                    gradient.addColorStop(0.5, `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, ${glow * 0.1})`)
                    gradient.addColorStop(1, `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, 0)`)
                    ctx.beginPath()
                    ctx.arc(dot.x, dot.y, radius * 4, 0, Math.PI * 2)
                    ctx.fillStyle = gradient
                    ctx.fill()
                }

                ctx.beginPath()
                ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
                ctx.fill()
            }

            rafId = requestAnimationFrame(tick)
        }

        rafId = requestAnimationFrame(tick)
        return () => {
            if (rafId != null) cancelAnimationFrame(rafId)
        }
    }, [proximity, baseRgb, glowRgb, dotSize, glowIntensity, waveSpeed])

    useEffect(() => {
        const handleMouseMove = e => {
            const container = containerRef.current
            if (!container) return
            const rect = container.getBoundingClientRect()
            const inside =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            if (!inside) {
                mouseRef.current = { x: -1000, y: -1000 }
                return
            }
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            }
        }

        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const positionClass = variant === 'full' ? 'fixed inset-0' : 'absolute inset-0'

    const vignetteStyle =
        vignette === 'none'
            ? undefined
            : vignette === 'navy'
              ? {
                    background:
                        'radial-gradient(ellipse at center, transparent 0%, transparent 42%, rgba(15, 23, 42, 0.55) 100%)',
                }
              : {
                    background:
                        'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(10, 10, 10, 0.6) 100%)',
                }

    return (
        <div ref={containerRef} className={cn(positionClass, 'overflow-hidden bg-transparent', className)}>
            <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

            {vignette !== 'none' && (
                <div className="pointer-events-none absolute inset-0" style={vignetteStyle} />
            )}

            {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
        </div>
    )
}

export default DotPattern

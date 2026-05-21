import React, { useId, useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

const VIEW_W = 640
const VIEW_H = 220
const PAD_L = 44
const PAD_R = 14
const PAD_T = 10
const PAD_B = 38

/**
 * @param {{ key: string, label: string, events: number, uniqueUsers: number }[]} series
 */
export default function PlatformTrafficLineChart({ series }) {
    const theme = useTheme()
    const gradId = useId().replace(/:/g, '')
    const lineColor = theme.palette.secondary.main
    const gridColor = theme.palette.divider
    const textMuted = theme.palette.text.secondary

    const innerW = VIEW_W - PAD_L - PAD_R
    const innerH = VIEW_H - PAD_T - PAD_B

    const { maxY, linePath, areaPath, points, yTicks } = useMemo(() => {
        const n = series?.length ?? 0
        if (n === 0) {
            return { maxY: 1, linePath: '', areaPath: '', points: [], yTicks: [0] }
        }
        const rawMax = Math.max(...series.map(d => d.events), 0)
        const maxY = Math.max(rawMax, 1)
        const xi = i => (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
        const yv = v => innerH - (v / maxY) * innerH
        const pts = series.map((d, i) => {
            const x = PAD_L + xi(i)
            const y = PAD_T + yv(d.events)
            return { x, y, ...d }
        })
        const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
        const bottom = PAD_T + innerH
        const areaPath = `M ${pts[0].x.toFixed(2)} ${bottom} L ${pts.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')} L ${pts[pts.length - 1].x.toFixed(2)} ${bottom} Z`
        const mid = Math.max(1, Math.round(maxY / 2))
        const yTicks = maxY <= 1 ? [0, 1] : [0, mid, maxY].filter((v, i, a) => a.indexOf(v) === i)
        return { maxY, linePath, areaPath, points: pts, yTicks }
    }, [series, innerW, innerH])

    if (!series?.length) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    No data in this range.
                </Typography>
            </Box>
        )
    }

    const bottomY = PAD_T + innerH
    const showXLabel = i => {
        const n = series.length
        if (n <= 8) return true
        if (i === 0 || i === n - 1) return true
        const step = Math.max(1, Math.ceil(n / 7))
        return i % step === 0
    }

    return (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <Box
                component="svg"
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Daily traffic: events per calendar day"
                sx={{ width: '100%', height: 'auto', display: 'block', maxHeight: 260 }}
            >
                <defs>
                    <linearGradient id={`trafficAreaGrad-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={lineColor} stopOpacity={0.22} />
                        <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
                    </linearGradient>
                </defs>

                {/* Y grid + labels */}
                {yTicks.map((tick, idx) => {
                    const y = PAD_T + innerH - (tick / maxY) * innerH
                    return (
                        <g key={`y-${idx}`}>
                            <line x1={PAD_L} y1={y} x2={PAD_L + innerW} y2={y} stroke={gridColor} strokeWidth={1} strokeDasharray={tick === 0 ? 'none' : '4 4'} />
                            <text
                                x={PAD_L - 6}
                                y={y + 4}
                                textAnchor="end"
                                fill={textMuted}
                                fontSize={11}
                                fontFamily={typeof theme.typography.fontFamily === 'string' ? theme.typography.fontFamily : 'system-ui, sans-serif'}
                            >
                                {tick}
                            </text>
                        </g>
                    )
                })}

                <line x1={PAD_L} y1={bottomY} x2={PAD_L + innerW} y2={bottomY} stroke={gridColor} strokeWidth={1} />

                {areaPath ? <path d={areaPath} fill={`url(#trafficAreaGrad-${gradId})`} stroke="none" /> : null}
                {linePath ? (
                    <path
                        d={linePath}
                        fill="none"
                        stroke={lineColor}
                        strokeWidth={2.25}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ) : null}

                {points.map(p => (
                    <g key={p.key}>
                        <circle cx={p.x} cy={p.y} r={5} fill={theme.palette.background.paper} stroke={lineColor} strokeWidth={2} />
                        <circle cx={p.x} cy={p.y} r={12} fill="transparent">
                            <title>{`${p.label}: ${p.events} event(s), ${p.uniqueUsers} distinct user(s)`}</title>
                        </circle>
                    </g>
                ))}

                {points.map((p, i) =>
                    showXLabel(i) ? (
                        <text
                            key={`xl-${p.key}`}
                            x={p.x}
                            y={VIEW_H - 10}
                            textAnchor="middle"
                            fill={textMuted}
                            fontSize={10}
                            fontFamily={typeof theme.typography.fontFamily === 'string' ? theme.typography.fontFamily : 'system-ui, sans-serif'}
                        >
                            {p.label}
                        </text>
                    ) : null,
                )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, px: 0.5 }}>
                Line graph: one point per calendar day (local time). Hover a point for counts.
            </Typography>
        </Box>
    )
}

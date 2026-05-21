import React, { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useAuth } from '../../context/AuthContext'
import PlatformTrafficLineChart from './PlatformTrafficLineChart.jsx'

/** Only https embeds (e.g. Looker Studio “Embed report”). */
function isSafeHttpsEmbedUrl(raw) {
    if (!raw || typeof raw !== 'string') return false
    const u = raw.trim()
    try {
        const x = new URL(u)
        return x.protocol === 'https:'
    } catch {
        return false
    }
}

function isoDaysAgo(days) {
    return new Date(Date.now() - days * 86400000).toISOString()
}

function userLabel(p) {
    if (!p) return '—'
    return p.full_name || p.notification_email || p.id?.slice(0, 8) || '—'
}

function aggregateEventTypes(rows) {
    const m = new Map()
    for (const r of rows || []) {
        const t = r.event_type || 'unknown'
        m.set(t, (m.get(t) || 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
}

/** Local calendar day key YYYY-MM-DD (browser timezone). */
function localDateKey(isoOrDate) {
    const t = new Date(isoOrDate)
    if (Number.isNaN(t.getTime())) return ''
    const y = t.getFullYear()
    const m = String(t.getMonth() + 1).padStart(2, '0')
    const d = String(t.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Bucket `usage_events` rows into consecutive local calendar days ending today.
 * @param {{ created_at: string, user_id?: string }[]} rows
 * @param {7|14|30} days
 */
function buildDailyTrafficSeries(rows, days) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - (days - 1))
    const series = []
    for (let i = 0; i < days; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        const key = localDateKey(d)
        const label =
            days > 14
                ? d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
                : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
        series.push({ key, label, events: 0, uniqueUsers: new Set() })
    }
    const map = new Map(series.map((s, i) => [s.key, i]))
    for (const row of rows || []) {
        const k = localDateKey(row.created_at)
        const idx = map.get(k)
        if (idx == null) continue
        series[idx].events += 1
        if (row.user_id) series[idx].uniqueUsers.add(row.user_id)
    }
    return series.map(s => ({
        key: s.key,
        label: s.label,
        events: s.events,
        uniqueUsers: s.uniqueUsers.size,
    }))
}

/**
 * Live platform usage from Supabase `usage_events` (staff can read all rows),
 * plus optional **Looker Studio** iframe when `VITE_GA_ADMIN_EMBED_URL` is set.
 * GA4’s own UI cannot be iframed; connect GA4 in Looker → File → Embed report.
 */
export default function AdminGoogleAnalyticsEmbed() {
    const { supabase } = useAuth()
    const raw = import.meta.env.VITE_GA_ADMIN_EMBED_URL
    const url = typeof raw === 'string' ? raw.trim() : ''
    const ok = isSafeHttpsEmbedUrl(url)

    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')
    const [count7d, setCount7d] = useState(0)
    const [count30d, setCount30d] = useState(0)
    const [recent, setRecent] = useState([])
    const [typeRows, setTypeRows] = useState([])
    const [trafficRows, setTrafficRows] = useState([])
    const [chartDays, setChartDays] = useState(14)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase) {
                setLoading(false)
                return
            }
            setErr('')
            const since7 = isoDaysAgo(7)
            const since30 = isoDaysAgo(30)

            const [r7, r30, rRecent, rTypes, rTraffic] = await Promise.all([
                supabase.from('usage_events').select('*', { count: 'exact', head: true }).gte('created_at', since7),
                supabase.from('usage_events').select('*', { count: 'exact', head: true }).gte('created_at', since30),
                supabase
                    .from('usage_events')
                    .select(
                        'id, event_type, created_at, user_id, report_id, profiles:user_id ( id, full_name, notification_email ), reports:report_id ( title )',
                    )
                    .order('created_at', { ascending: false })
                    .limit(20),
                supabase.from('usage_events').select('event_type').gte('created_at', since30).limit(4000),
                supabase.from('usage_events').select('created_at, user_id').gte('created_at', since30).limit(15000),
            ])
            if (cancelled) return
            const msg =
                r7.error?.message ||
                r30.error?.message ||
                rRecent.error?.message ||
                rTypes.error?.message ||
                rTraffic.error?.message
            if (msg) setErr(msg)
            setCount7d(r7.count ?? 0)
            setCount30d(r30.count ?? 0)
            setRecent(rRecent.data || [])
            setTypeRows(rTypes.data || [])
            setTrafficRows(rTraffic.data || [])
            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase])

    const topTypes = useMemo(() => aggregateEventTypes(typeRows), [typeRows])
    const dailySeries = useMemo(() => buildDailyTrafficSeries(trafficRows, chartDays), [trafficRows, chartDays])

    return (
        <Card variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, overflow: 'hidden' }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                Traffic & analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.65 }}>
                <strong>Platform activity</strong> below is read from your Supabase <code>usage_events</code> table (all users).{' '}
                <strong>GA4</strong> in-browser traffic uses <code>VITE_GA_MEASUREMENT_ID</code> separately; optional charts here use Looker Studio.
            </Typography>

            {loading ? (
                <Stack alignItems="center" py={3}>
                    <CircularProgress size={28} />
                </Stack>
            ) : (
                <>
                    {err && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {err}
                        </Alert>
                    )}
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
                        Platform usage (Supabase)
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(25,127,148,0.08)', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    Events (7 days)
                                </Typography>
                                <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                                    {count7d}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(25,127,148,0.08)', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    Events (30 days)
                                </Typography>
                                <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                                    {count30d}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(25,127,148,0.08)', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    Distinct event labels (30 d)
                                </Typography>
                                <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                                    {topTypes.length}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    From up to 4k recent rows
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ mb: 3, p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={1.5} sx={{ mb: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={800}>
                                    Daily traffic (platform)
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                    Events per day from <code>usage_events</code> (sample up to 15k rows in the last 30 days).
                                </Typography>
                            </Box>
                            <ToggleButtonGroup
                                exclusive
                                size="small"
                                color="secondary"
                                value={chartDays}
                                onChange={(_, v) => v != null && setChartDays(v)}
                                aria-label="Chart range"
                            >
                                <ToggleButton value={7}>7 days</ToggleButton>
                                <ToggleButton value={14}>14 days</ToggleButton>
                                <ToggleButton value={30}>30 days</ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
                        <PlatformTrafficLineChart series={dailySeries} />
                    </Box>

                    {topTypes.length > 0 && (
                        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 3 }}>
                            {topTypes.map(([type, n]) => (
                                <Chip key={type} size="small" variant="outlined" color="secondary" label={`${type}: ${n}`} />
                            ))}
                        </Stack>
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                        Latest events
                    </Typography>
                    <Table size="small" sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>When</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Event</TableCell>
                                <TableCell>Report</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!recent.length ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                            No usage events yet. Open reports from the catalogue while signed in to record activity (e.g.{' '}
                                            <code>report_open</code>).
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recent.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleString()}</TableCell>
                                        <TableCell>{userLabel(r.profiles)}</TableCell>
                                        <TableCell>{r.event_type}</TableCell>
                                        <TableCell>{r.reports?.title || '—'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
                Google Analytics (Looker Studio embed)
            </Typography>
            {!ok ? (
                <Alert severity="info">
                    <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
                        To show GA4 charts in this frame, link your <strong>GA4</strong> property in <strong>Looker Studio</strong>, then use{' '}
                        <strong>File → Embed report</strong> and copy the <code>https://</code> embed URL into{' '}
                        <Box component="code" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', px: 0.5 }}>VITE_GA_ADMIN_EMBED_URL</Box> in{' '}
                        <Box component="code" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', px: 0.5 }}>.env</Box>, then rebuild the app.
                    </Typography>
                </Alert>
            ) : (
                <Box
                    sx={{
                        width: '100%',
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'grey.50',
                    }}
                >
                    <Box
                        component="iframe"
                        src={url}
                        title="Google Analytics (embedded dashboard)"
                        allow="fullscreen"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        sx={{
                            width: '100%',
                            border: 0,
                            display: 'block',
                            minHeight: { xs: 420, md: 560 },
                            height: { xs: '60vh', md: 'min(70vh, 720px)' },
                            maxHeight: 900,
                        }}
                    />
                </Box>
            )}
        </Card>
    )
}

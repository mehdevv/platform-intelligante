import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import EmptyState from '../../components/shell/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { isEntitlementActive } from '../../lib/accountActions'
import { reportPublicPath } from '../../lib/reportPath'

function formatExpiry(expiresAt) {
    if (!expiresAt) return 'No expiry'
    const d = new Date(expiresAt)
    return isEntitlementActive({ expires_at: expiresAt })
        ? `Until ${d.toLocaleDateString()}`
        : `Ended ${d.toLocaleDateString()}`
}

function ReportActions({ report, size = 'small' }) {
    if (!report) return null
    return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <Button component={Link} to={`${reportPublicPath(report)}/read`} size={size} variant="contained" color="secondary">
                Read
            </Button>
            <Button component={Link} to={reportPublicPath(report)} size={size} variant="outlined">
                Details
            </Button>
        </Stack>
    )
}

export default function DashboardLibraryPage() {
    const { supabase, user } = useAuth()
    const [entitlements, setEntitlements] = useState([])
    const [sectorReports, setSectorReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !user) {
                setLoading(false)
                return
            }
            setError('')
            const { data: ent, error: entErr } = await supabase
                .from('user_report_entitlements')
                .select(
                    'id, source, expires_at, granted_at, report_id, sector_id, reports(id, title, slug, sector_id, sectors(name, slug)), sectors:sector_id(id, name, slug, icon_image_url)',
                )
                .eq('user_id', user.id)
                .order('granted_at', { ascending: false })

            if (cancelled) return
            if (entErr) {
                setError(entErr.message)
                setLoading(false)
                return
            }

            const rows = ent || []
            setEntitlements(rows)

            const activeSectorIds = rows
                .filter(r => r.sector_id && isEntitlementActive(r))
                .map(r => r.sector_id)

            if (activeSectorIds.length === 0) {
                setSectorReports([])
                setLoading(false)
                return
            }

            const { data: reports, error: repErr } = await supabase
                .from('reports')
                .select('id, title, slug, summary, sector_id, published_at, sectors:sector_id(id, name, slug)')
                .eq('status', 'published')
                .in('sector_id', activeSectorIds)
                .order('published_at', { ascending: false })

            if (!cancelled) {
                if (repErr) setError(repErr.message)
                else setSectorReports(reports || [])
                setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, user])

    const { activeSectors, expiredSectors, reportEntitlements, reportsBySector } = useMemo(() => {
        const activeSectors = []
        const expiredSectors = []
        const reportEntitlements = []

        for (const row of entitlements) {
            if (row.sector_id) {
                if (isEntitlementActive(row)) activeSectors.push(row)
                else expiredSectors.push(row)
            } else if (row.report_id) {
                reportEntitlements.push(row)
            }
        }

        const sectorIdSet = new Set(activeSectors.map(s => s.sector_id))
        const reportsBySector = {}
        for (const rep of sectorReports) {
            if (!rep.sector_id || !sectorIdSet.has(rep.sector_id)) continue
            if (!reportsBySector[rep.sector_id]) reportsBySector[rep.sector_id] = []
            reportsBySector[rep.sector_id].push(rep)
        }

        return { activeSectors, expiredSectors, reportEntitlements, reportsBySector }
    }, [entitlements, sectorReports])

    const activeReportPurchases = useMemo(
        () => reportEntitlements.filter(r => isEntitlementActive(r) && r.reports),
        [reportEntitlements],
    )

    const totalReadableReports = useMemo(() => {
        const ids = new Set()
        for (const rep of sectorReports) {
            if (rep?.id) ids.add(rep.id)
        }
        for (const row of activeReportPurchases) {
            if (row.reports?.id) ids.add(row.reports.id)
        }
        return ids.size
    }, [sectorReports, activeReportPurchases])

    const hasAnyAccess = activeSectors.length > 0 || activeReportPurchases.length > 0

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                    Library
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Everything you can read right now — sector subscriptions and individual report purchases.
                </Typography>
            </Box>

            {!loading && hasAnyAccess && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={`${totalReadableReports} report${totalReadableReports === 1 ? '' : 's'} available`} color="secondary" variant="outlined" />
                    {activeSectors.length > 0 && (
                        <Chip label={`${activeSectors.length} active sector${activeSectors.length === 1 ? '' : 's'}`} variant="outlined" />
                    )}
                    {activeReportPurchases.length > 0 && (
                        <Chip label={`${activeReportPurchases.length} purchased report${activeReportPurchases.length === 1 ? '' : 's'}`} variant="outlined" />
                    )}
                </Stack>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {loading && (
                <Stack alignItems="center" py={6}>
                    <CircularProgress color="secondary" />
                </Stack>
            )}

            {!loading && !hasAnyAccess && !expiredSectors.length && (
                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <EmptyState
                        title="Your library is empty"
                        description="Subscribe to a sector or buy a report. After your payment is approved, all entitled content appears here."
                    >
                        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                            <Button component={Link} to="/pricing" variant="contained" color="secondary" size="small">
                                Sector subscriptions
                            </Button>
                            <Button component={Link} to="/reports" variant="outlined" size="small">
                                Browse reports
                            </Button>
                        </Stack>
                    </EmptyState>
                </Card>
            )}

            {!loading && activeSectors.length > 0 && (
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                        Sector access
                    </Typography>
                    <Stack spacing={2}>
                        {activeSectors.map(ent => {
                            const sector = ent.sectors
                            const reports = reportsBySector[ent.sector_id] || []
                            return (
                                <Card key={ent.id} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                    <Box sx={{ p: 2.5, bgcolor: 'rgba(25,127,148,0.05)', borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
                                            {sector?.icon_image_url ? (
                                                <Avatar src={sector.icon_image_url} alt="" variant="rounded" sx={{ width: 44, height: 44 }} />
                                            ) : (
                                                <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: 'rgba(25,127,148,0.12)', color: 'secondary.main' }}>
                                                    <span className="material-symbols-outlined">category</span>
                                                </Avatar>
                                            )}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography fontWeight={800}>{sector?.name || 'Sector'}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatExpiry(ent.expires_at)} · {reports.length} published report{reports.length === 1 ? '' : 's'}
                                                </Typography>
                                            </Box>
                                            {sector?.slug && (
                                                <Button component={Link} to={`/sectors/${sector.slug}`} size="small" variant="outlined">
                                                    Sector page
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>
                                    <Box sx={{ p: 2 }}>
                                        {!reports.length ? (
                                            <Typography variant="body2" color="text.secondary">
                                                No published reports in this sector yet.
                                            </Typography>
                                        ) : (
                                            <Stack spacing={1.5} divider={<Divider flexItem />}>
                                                {reports.map(rep => (
                                                    <Stack
                                                        key={rep.id}
                                                        direction={{ xs: 'column', sm: 'row' }}
                                                        justifyContent="space-between"
                                                        alignItems={{ sm: 'center' }}
                                                        gap={1}
                                                    >
                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography fontWeight={600}>{rep.title}</Typography>
                                                            {rep.summary && (
                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                                                                    {rep.summary.length > 120 ? `${rep.summary.slice(0, 120)}…` : rep.summary}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <ReportActions report={rep} />
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </Card>
                            )
                        })}
                    </Stack>
                </Box>
            )}

            {!loading && activeReportPurchases.length > 0 && (
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                        Purchased reports
                    </Typography>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <Stack spacing={0} divider={<Divider />}>
                            {activeReportPurchases.map(row => (
                                <Stack
                                    key={row.id}
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    alignItems={{ sm: 'center' }}
                                    gap={1}
                                    sx={{ p: 2 }}
                                >
                                    <Box>
                                        <Typography fontWeight={600}>{row.reports?.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {row.source} · {formatExpiry(row.expires_at)}
                                            {row.reports?.sectors?.name && ` · ${row.reports.sectors.name}`}
                                        </Typography>
                                    </Box>
                                    <ReportActions report={row.reports} />
                                </Stack>
                            ))}
                        </Stack>
                    </Card>
                </Box>
            )}

            {!loading && expiredSectors.length > 0 && (
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ mb: 1.5 }}>
                        Expired access
                    </Typography>
                    <Grid container spacing={1.5}>
                        {expiredSectors.map(ent => (
                            <Grid key={ent.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card variant="outlined" sx={{ p: 2, borderRadius: 2, opacity: 0.85 }}>
                                    <Typography fontWeight={600}>{ent.sectors?.name || 'Sector'}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                        {formatExpiry(ent.expires_at)}
                                    </Typography>
                                    <Button
                                        component={Link}
                                        to={ent.sector_id ? `/checkout?sectorIds=${ent.sector_id}` : '/pricing'}
                                        size="small"
                                        variant="outlined"
                                    >
                                        Renew
                                    </Button>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Stack>
    )
}

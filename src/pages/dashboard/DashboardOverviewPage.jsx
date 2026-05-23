import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import CategoryIcon from '@mui/icons-material/Category'
import ArticleIcon from '@mui/icons-material/Article'
import ScheduleIcon from '@mui/icons-material/Schedule'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useTranslation } from 'react-i18next'
import EmptyState from '../../components/shell/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { isEntitlementActive, formatPlanTier } from '../../lib/accountActions'
import { reportPublicPath } from '../../lib/reportPath'

function StatCard({ icon: Icon, label, value, caption, to, linkLabel }) {
    return (
        <Card variant="outlined" sx={{ p: 2.5, height: '100%', borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                {Icon && (
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(25, 127, 148, 0.08)',
                            color: 'secondary.main',
                            display: 'flex',
                        }}
                    >
                        <Icon fontSize="small" />
                    </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1.4 }}>
                        {label}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 0.25, lineHeight: 1.2 }}>
                        {value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.45 }}>
                        {caption}
                    </Typography>
                    {to && linkLabel && (
                        <Button component={Link} to={to} size="small" variant="outlined" sx={{ mt: 1.5, fontWeight: 700, alignSelf: 'flex-start' }}>
                            {linkLabel}
                        </Button>
                    )}
                </Box>
            </Stack>
        </Card>
    )
}

export default function DashboardOverviewPage() {
    const { t } = useTranslation()
    const { supabase, user, profile, subscription } = useAuth()
    const [entitlements, setEntitlements] = useState([])
    const [sectorReportCount, setSectorReportCount] = useState(0)
    const [payments, setPayments] = useState([])
    const [usageCounts, setUsageCounts] = useState({ report_open: 0 })
    const [recent, setRecent] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !user) {
                setLoading(false)
                return
            }

            const [entRes, payRes, usageRes] = await Promise.all([
                supabase
                    .from('user_report_entitlements')
                    .select('id, sector_id, report_id, expires_at, granted_at, source')
                    .eq('user_id', user.id),
                supabase
                    .from('payment_requests')
                    .select('id, status, created_at')
                    .eq('user_id', user.id),
                supabase
                    .from('usage_events')
                    .select('id, event_type, created_at, report_id, reports(title, slug)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(200),
            ])

            if (cancelled) return

            const entRows = entRes.data || []
            setEntitlements(entRows)
            setPayments(payRes.data || [])

            const usageRows = usageRes.data || []
            const openCount = usageRows.filter(r => r.event_type === 'report_open').length
            setUsageCounts({ report_open: openCount })
            setRecent(usageRows.filter(r => r.event_type === 'report_open').slice(0, 5))

            const activeSectorIds = entRows
                .filter(r => r.sector_id && isEntitlementActive(r))
                .map(r => r.sector_id)

            if (activeSectorIds.length === 0) {
                setSectorReportCount(0)
            } else {
                const { count } = await supabase
                    .from('reports')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'published')
                    .in('sector_id', activeSectorIds)
                if (!cancelled) setSectorReportCount(count || 0)
            }

            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, user])

    const stats = useMemo(() => {
        const activeSectors = entitlements.filter(r => r.sector_id && isEntitlementActive(r))
        const purchasedReports = entitlements.filter(r => r.report_id && isEntitlementActive(r))
        const now = Date.now()
        const in30 = now + 30 * 24 * 60 * 60 * 1000
        const expiringSoon = entitlements.filter(r => {
            if (!r.expires_at || !isEntitlementActive(r)) return false
            const exp = new Date(r.expires_at).getTime()
            return exp > now && exp <= in30
        }).length

        const pendingPayments = payments.filter(p => p.status === 'pending').length
        const approvedPayments = payments.filter(p => p.status === 'approved').length
        const libraryTotal = sectorReportCount + purchasedReports.length

        return {
            libraryTotal,
            activeSectors: activeSectors.length,
            purchasedReports: purchasedReports.length,
            expiringSoon,
            pendingPayments,
            approvedPayments,
            reportsOpened: usageCounts.report_open ?? 0,
        }
    }, [entitlements, sectorReportCount, payments, usageCounts])

    const planTier = formatPlanTier(subscription?.plan_tier)

    const statCards = [
        {
            key: 'library',
            icon: LibraryBooksIcon,
            label: t('dashboard.overview.stats.library'),
            value: stats.libraryTotal,
            caption: t('dashboard.overview.stats.libraryCaption'),
            to: '/dashboard/library',
            linkLabel: t('dashboard.overview.stats.libraryLink'),
        },
        {
            key: 'sectors',
            icon: CategoryIcon,
            label: t('dashboard.overview.stats.sectors'),
            value: stats.activeSectors,
            caption: t('dashboard.overview.stats.sectorsCaption'),
            to: '/dashboard/library',
            linkLabel: t('dashboard.overview.stats.sectorsLink'),
        },
        {
            key: 'purchased',
            icon: ArticleIcon,
            label: t('dashboard.overview.stats.purchased'),
            value: stats.purchasedReports,
            caption: t('dashboard.overview.stats.purchasedCaption'),
            to: '/dashboard/library',
            linkLabel: t('dashboard.overview.stats.purchasedLink'),
        },
        {
            key: 'expiring',
            icon: ScheduleIcon,
            label: t('dashboard.overview.stats.expiring'),
            value: stats.expiringSoon,
            caption: t('dashboard.overview.stats.expiringCaption'),
            to: '/dashboard/billing',
            linkLabel: t('dashboard.overview.stats.expiringLink'),
        },
        {
            key: 'pending',
            icon: PendingActionsIcon,
            label: t('dashboard.overview.stats.pendingPayments'),
            value: stats.pendingPayments,
            caption: t('dashboard.overview.stats.pendingPaymentsCaption'),
            to: '/dashboard/payments',
            linkLabel: t('dashboard.overview.stats.pendingPaymentsLink'),
        },
        {
            key: 'opened',
            icon: MenuBookIcon,
            label: t('dashboard.overview.stats.opened'),
            value: stats.reportsOpened,
            caption: t('dashboard.overview.stats.openedCaption'),
            to: '/reports',
            linkLabel: t('dashboard.overview.stats.openedLink'),
        },
    ]

    return (
        <Stack spacing={4}>
            <Box>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
                    <Typography variant="h5" fontWeight={800}>
                        {profile?.full_name
                            ? t('dashboard.overview.welcome', { name: profile.full_name.split(' ')[0] })
                            : t('dashboard.overview.welcomeGeneric')}
                    </Typography>
                    <Chip label={t('dashboard.overview.planChip', { plan: planTier })} size="small" variant="outlined" color="secondary" />
                    {stats.approvedPayments > 0 && (
                        <Chip
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: '16px !important' }} />}
                            label={t('dashboard.overview.approvedPayments', { count: stats.approvedPayments })}
                            size="small"
                            color="success"
                            variant="outlined"
                        />
                    )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    {t('dashboard.overview.subtitle')}
                </Typography>
            </Box>

            <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                    {t('dashboard.overview.statsTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('dashboard.overview.statsSubtitle')}
                </Typography>
                {loading ? (
                    <Stack alignItems="center" py={4}>
                        <CircularProgress size={32} color="secondary" />
                    </Stack>
                ) : (
                    <Grid container spacing={2}>
                        {statCards.map(card => (
                            <Grid key={card.key} size={{ xs: 12, sm: 6, lg: 4 }}>
                                <StatCard {...card} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                    {t('dashboard.overview.continueTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('dashboard.overview.continueSubtitle')}
                </Typography>
                {loading ? (
                    <Stack alignItems="center" py={3}>
                        <CircularProgress size={28} />
                    </Stack>
                ) : !recent.length ? (
                    <EmptyState
                        title={t('dashboard.overview.noActivityTitle')}
                        description={t('dashboard.overview.noActivityDesc')}
                    >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                            <Button component={Link} to="/reports" variant="contained" color="secondary" size="small" disableElevation>
                                {t('dashboard.overview.browseReports')}
                            </Button>
                            <Button component={Link} to="/dashboard/library" variant="outlined" size="small">
                                {t('nav.myReports')}
                            </Button>
                        </Stack>
                    </EmptyState>
                ) : (
                    <List disablePadding>
                        {recent.map(row => (
                            <ListItem key={row.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                                <ListItemText
                                    primary={row.reports?.title || t('dashboard.overview.reportOpened')}
                                    secondary={new Date(row.created_at).toLocaleString()}
                                />
                                {row.reports && (
                                    <Button component={Link} to={reportPublicPath(row.reports)} size="small">
                                        {t('dashboard.overview.openReport')}
                                    </Button>
                                )}
                            </ListItem>
                        ))}
                    </List>
                )}
            </Card>
        </Stack>
    )
}

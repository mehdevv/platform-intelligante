import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import { alpha } from '@mui/material/styles'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DashboardIcon from '@mui/icons-material/Dashboard'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import TimelineIcon from '@mui/icons-material/Timeline'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { MotionFadeInUp } from '../components/motion/Motion'
import { useAuth } from '../context/AuthContext'
import { reportPublicPath } from '../lib/reportPath'
import { formatPriceFromCents } from '../lib/moneyFormat'
import {
    deleteOwnAccount,
    exportPersonalData,
    formatPlanTier,
    isEntitlementActive,
    updateAccountEmail,
    updateAccountPassword,
} from '../lib/accountActions'
import { enrichPaymentRowsWithBundleSectors, paymentRequestKindLabel } from '../lib/paymentRequestDisplay'

const DELETE_CONFIRM = 'DELETE'

const PAYMENT_STATUS_COLOR = {
    pending: 'warning',
    approved: 'success',
    rejected: 'default',
}

function describePayment(row) {
    const primary = paymentRequestKindLabel(row)
    if (row.kind === 'sector_subscription') {
        return { primary, link: row.sectors?.slug ? `/sectors/${row.sectors.slug}` : null }
    }
    if (row.kind === 'report') {
        return { primary, link: row.reports?.slug ? `/reports/${row.reports.slug}` : null }
    }
    if (row.kind === 'sector_bundle') {
        return { primary, link: '/pricing' }
    }
    return { primary, link: null }
}

function StatCard({ icon, label, value, sub }) {
    return (
        <Card
            variant="outlined"
            sx={{
                p: { xs: 2, md: 2.5 },
                height: '100%',
                borderRadius: 2,
                transition: 'box-shadow 0.2s, border-color 0.2s',
                '&:hover': { boxShadow: 2, borderColor: 'secondary.light' },
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha('#197F94', 0.12),
                        color: 'secondary.main',
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.8125rem' } }}>
                        {label}
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.35rem', md: '1.5rem' }, lineHeight: 1.2 }}>
                        {value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {sub}
                    </Typography>
                </Box>
            </Stack>
        </Card>
    )
}

export default function ProfilePage() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { supabase, user, profile, subscription, refreshProfile, signOut } = useAuth()

    const [tab, setTab] = useState(0)
    const [entitlements, setEntitlements] = useState([])
    const [payments, setPayments] = useState([])
    const [usageCount, setUsageCount] = useState(0)
    const [loadingExtras, setLoadingExtras] = useState(true)
    const [loadErr, setLoadErr] = useState('')

    const [fullName, setFullName] = useState('')
    const [locale, setLocale] = useState('en')
    const [notificationEmail, setNotificationEmail] = useState('')
    const [digest, setDigest] = useState('off')
    const [newEmail, setNewEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const [msg, setMsg] = useState('')
    const [err, setErr] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingEmail, setSavingEmail] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState('')
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!profile) return
        queueMicrotask(() => {
            setFullName(profile.full_name || '')
            setLocale(profile.locale || 'en')
            setNotificationEmail(profile.notification_email || '')
            setDigest(profile.digest_frequency || 'off')
            setNewEmail(user?.email || '')
        })
    }, [profile, user?.email])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !user) {
                setLoadingExtras(false)
                return
            }
            setLoadErr('')
            const [entRes, payRes, usageRes] = await Promise.all([
                supabase
                    .from('user_report_entitlements')
                    .select(
                        'id, source, expires_at, granted_at, report_id, sector_id, reports(id, title, slug, sectors(name, slug)), sectors:sector_id(id, name, slug, icon_image_url)',
                    )
                    .eq('user_id', user.id)
                    .order('granted_at', { ascending: false }),
                supabase
                    .from('payment_requests')
                    .select(
                        'id, kind, report_id, sector_id, bundle_sector_ids, amount_cents, currency, status, admin_note, created_at, reviewed_at, reports:report_id ( id, title, slug ), sectors:sector_id ( id, name, slug )',
                    )
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(100),
                supabase.from('usage_events').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            ])
            if (cancelled) return
            if (entRes.error || payRes.error) {
                setLoadErr(entRes.error?.message || payRes.error?.message || '')
            }
            setEntitlements(entRes.data || [])
            setPayments(await enrichPaymentRowsWithBundleSectors(supabase, payRes.data || []))
            setUsageCount(usageRes.count || 0)
            setLoadingExtras(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, user])

    const { activeRows, expiredRows, activeAccessCount, pendingCount } = useMemo(() => {
        const active = []
        const expired = []
        for (const row of entitlements) {
            if (isEntitlementActive(row)) active.push(row)
            else expired.push(row)
        }
        return {
            activeRows: active,
            expiredRows: expired,
            activeAccessCount: active.length,
            pendingCount: payments.filter(p => p.status === 'pending').length,
        }
    }, [entitlements, payments])

    const quota = subscription?.report_quota
    const libCount = activeAccessCount
    const pct = quota && quota > 0 ? Math.min(100, Math.round((libCount / quota) * 100)) : 0

    const planLabel = subscription?.plan_tier ? formatPlanTier(subscription.plan_tier) : t('profilePage.noPlan')
    const dateLocale = locale === 'fr' ? 'fr-DZ' : 'en-US'

    const saveProfile = async () => {
        if (!supabase || !user) return
        setSavingProfile(true)
        setMsg('')
        setErr('')
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName.trim() || null,
                locale,
                notification_email: notificationEmail.trim() || null,
                digest_frequency: digest,
            })
            .eq('id', user.id)
        setSavingProfile(false)
        if (error) setErr(error.message)
        else {
            setMsg(t('profilePage.account.saved'))
            if (i18n.language !== locale) {
                i18n.changeLanguage(locale)
                try {
                    localStorage.setItem('researcha-lang', locale)
                } catch {
                    /* ignore */
                }
            }
            refreshProfile()
        }
    }

    const saveEmail = async () => {
        if (!user) return
        const trimmed = newEmail.trim()
        if (!trimmed || trimmed === user.email) {
            setErr('Enter a new email address different from your current one.')
            return
        }
        setSavingEmail(true)
        setMsg('')
        setErr('')
        const { error } = await updateAccountEmail(supabase, trimmed)
        setSavingEmail(false)
        if (error) setErr(error.message)
        else setMsg(t('profilePage.account.emailSent'))
    }

    const savePassword = async () => {
        setMsg('')
        setErr('')
        if (newPassword.length < 8) {
            setErr('Password must be at least 8 characters.')
            return
        }
        if (newPassword !== confirmPassword) {
            setErr('New passwords do not match.')
            return
        }
        setSavingPassword(true)
        if (currentPassword && supabase) {
            const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            })
            if (signInErr) {
                setSavingPassword(false)
                setErr('Current password is incorrect.')
                return
            }
        }
        const { error } = await updateAccountPassword(supabase, newPassword)
        setSavingPassword(false)
        if (error) setErr(error.message)
        else {
            setMsg(t('profilePage.account.passwordUpdated'))
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        }
    }

    const handleExport = async () => {
        if (!user) return
        setExporting(true)
        setErr('')
        const { data, error } = await exportPersonalData(supabase, user.id)
        setExporting(false)
        if (error) {
            setErr(error.message)
            return
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `researcha-data-export-${user.id.slice(0, 8)}.json`
        a.click()
        URL.revokeObjectURL(url)
        setMsg(t('profilePage.account.exported'))
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== DELETE_CONFIRM) return
        setDeleting(true)
        setErr('')
        const { error } = await deleteOwnAccount(supabase)
        if (error) {
            setDeleting(false)
            const hint =
                error.message?.includes('Could not find the function') || error.code === 'PGRST202'
                    ? ' Apply migration user_subscription_and_account_rls on Supabase first.'
                    : ''
            setErr((error.message || 'Could not delete account') + hint)
            return
        }
        await signOut()
        setDeleting(false)
        setDeleteOpen(false)
        navigate('/', { replace: true })
    }

    const renderEntitlementRow = row => {
        const active = isEntitlementActive(row)
        const expiryLabel = row.expires_at
            ? t('profilePage.access.expires', { date: new Date(row.expires_at).toLocaleDateString(dateLocale) })
            : t('profilePage.access.permanent')

        if (row.sector_id && row.sectors) {
            return (
                <Card key={row.id} variant="outlined" sx={{ p: 2, borderRadius: 2, opacity: active ? 1 : 0.72 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.5}>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                                {row.sectors.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                                {t('profilePage.access.source', { source: row.source || 'sector' })} · {expiryLabel}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Chip size="small" label={active ? t('profilePage.access.active') : t('profilePage.access.expired')} color={active ? 'success' : 'default'} variant="outlined" />
                            {row.sectors.slug && (
                                <Button component={Link} to={`/sectors/${row.sectors.slug}`} size="small" variant="outlined">
                                    {t('profilePage.overview.sectors')}
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Card>
            )
        }

        return (
            <Card key={row.id} variant="outlined" sx={{ p: 2, borderRadius: 2, opacity: active ? 1 : 0.72 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.5}>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {row.reports?.title || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {t('profilePage.access.source', { source: row.source || 'purchase' })}
                            {row.reports?.sectors?.name && ` · ${t('profilePage.access.sector', { name: row.reports.sectors.name })}`}
                            {' · '}
                            {expiryLabel}
                        </Typography>
                    </Box>
                    {row.reports && (
                        <Stack direction="row" spacing={1}>
                            <Button component={Link} to={`${reportPublicPath(row.reports)}/read`} size="small" variant="contained" color="secondary" disableElevation>
                                {t('profilePage.access.open')}
                            </Button>
                            <Button component={Link} to={reportPublicPath(row.reports)} size="small" variant="outlined">
                                {t('reportsListing.details')}
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </Card>
        )
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 5, pt: 12 }}>
                <MotionFadeInUp>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                            {t('profilePage.title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
                            {t('profilePage.subtitle')}
                        </Typography>
                    </Box>
                </MotionFadeInUp>

                <MotionFadeInUp delay={0.05}>
                    <Card
                        sx={{
                            p: { xs: 3, md: 4 },
                            mb: 3,
                            borderRadius: 3,
                            background: theme =>
                                `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 55%, #fff 100%)`,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Stack direction={{ xs: 'column', md: 'row' }} gap={3} alignItems={{ md: 'center' }} justifyContent="space-between">
                            <Stack direction="row" gap={2.5} alignItems="center">
                                <Avatar
                                    src={profile?.avatar_url || undefined}
                                    sx={{
                                        width: { xs: 64, md: 80 },
                                        height: { xs: 64, md: 80 },
                                        bgcolor: 'secondary.main',
                                        fontSize: '1.75rem',
                                        fontWeight: 700,
                                        boxShadow: 2,
                                    }}
                                >
                                    {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight={800}>
                                        {profile?.full_name || user?.email}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user?.email}
                                    </Typography>
                                    <Stack direction="row" gap={1} sx={{ mt: 1.25 }} flexWrap="wrap" useFlexGap>
                                        <Chip icon={<WorkspacePremiumIcon sx={{ fontSize: 14 }} />} label={planLabel} size="small" color="secondary" variant="outlined" />
                                        {profile?.created_at && (
                                            <Chip
                                                icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                                                label={t('profilePage.memberSince', {
                                                    date: new Date(profile.created_at).toLocaleDateString(dateLocale, {
                                                        month: 'long',
                                                        year: 'numeric',
                                                    }),
                                                })}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>
                            <Button component={Link} to="/dashboard" variant="contained" color="secondary" disableElevation startIcon={<DashboardIcon />}>
                                {t('profilePage.openDashboard')}
                            </Button>
                        </Stack>
                    </Card>
                </MotionFadeInUp>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <MotionFadeInUp delay={0.1}>
                            <StatCard
                                icon={<MenuBookIcon fontSize="small" />}
                                label={t('profilePage.stats.library')}
                                value={String(activeAccessCount)}
                                sub={t('profilePage.stats.librarySub')}
                            />
                        </MotionFadeInUp>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <MotionFadeInUp delay={0.15}>
                            <StatCard
                                icon={<PendingActionsIcon fontSize="small" />}
                                label={t('profilePage.stats.pending')}
                                value={String(pendingCount)}
                                sub={t('profilePage.stats.pendingSub')}
                            />
                        </MotionFadeInUp>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <MotionFadeInUp delay={0.2}>
                            <StatCard
                                icon={<TimelineIcon fontSize="small" />}
                                label={t('profilePage.stats.usage')}
                                value={String(usageCount)}
                                sub={t('profilePage.stats.usageSub')}
                            />
                        </MotionFadeInUp>
                    </Grid>
                </Grid>

                <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            px: { xs: 1, md: 2 },
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 52 },
                        }}
                    >
                        <Tab label={t('profilePage.tabs.overview')} />
                        <Tab label={t('profilePage.tabs.access')} />
                        <Tab label={t('profilePage.tabs.payments')} />
                        <Tab label={t('profilePage.tabs.account')} />
                    </Tabs>

                    <Box sx={{ p: { xs: 2, md: 4 } }}>
                        {loadErr && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {loadErr}
                            </Alert>
                        )}

                        {loadingExtras && tab !== 3 && (
                            <Stack alignItems="center" py={5}>
                                <CircularProgress size={32} color="secondary" />
                            </Stack>
                        )}

                        {!loadingExtras && tab === 0 && (
                            <Stack spacing={3}>
                                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                                        {t('profilePage.overview.subscriptionTitle')}
                                    </Typography>
                                    {subscription ? (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
                                            {formatPlanTier(subscription.plan_tier)} —{' '}
                                            {t('profilePage.overview.planStatus', { status: subscription.status })}
                                            {subscription.current_period_end &&
                                                ` · ${t('profilePage.overview.renews', {
                                                    date: new Date(subscription.current_period_end).toLocaleDateString(dateLocale),
                                                })}`}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
                                            {t('profilePage.overview.noSubscription')}
                                        </Typography>
                                    )}
                                    <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                                        <Button component={Link} to="/pricing" variant="contained" color="secondary" size="small" disableElevation>
                                            {t('profilePage.overview.viewPlans')}
                                        </Button>
                                        <Button component={Link} to="/dashboard/billing" variant="outlined" size="small">
                                            {t('profilePage.overview.billing')}
                                        </Button>
                                    </Stack>
                                </Card>

                                {quota != null && quota > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                            {t('profilePage.overview.quotaTitle')}
                                        </Typography>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                            <Typography variant="body2">{t('profilePage.overview.quotaReports')}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {libCount} / {quota}
                                            </Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={pct} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                                    </Box>
                                )}

                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                        {t('profilePage.overview.quickTitle')}
                                    </Typography>
                                    <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                                        <Button component={Link} to="/dashboard/library" variant="outlined" size="small">
                                            {t('profilePage.overview.library')}
                                        </Button>
                                        <Button component={Link} to="/reports" variant="outlined" size="small">
                                            {t('profilePage.overview.catalogue')}
                                        </Button>
                                        <Button component={Link} to="/sectors" variant="outlined" size="small">
                                            {t('profilePage.overview.sectors')}
                                        </Button>
                                        <Button component={Link} to="/pricing" variant="outlined" size="small" color="secondary">
                                            {t('profilePage.overview.pricing')}
                                        </Button>
                                    </Stack>
                                </Box>
                            </Stack>
                        )}

                        {!loadingExtras && tab === 1 && (
                            <Stack spacing={3}>
                                {!entitlements.length && (
                                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                                        {t('profilePage.access.empty')}
                                    </Alert>
                                )}
                                {!!activeRows.length && (
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', mb: 1, display: 'block' }}>
                                            {t('profilePage.access.active')}
                                        </Typography>
                                        <Stack spacing={1.5}>{activeRows.map(renderEntitlementRow)}</Stack>
                                    </Box>
                                )}
                                {!!expiredRows.length && (
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', mb: 1, display: 'block' }}>
                                            {t('profilePage.access.expired')}
                                        </Typography>
                                        <Stack spacing={1.5}>{expiredRows.map(renderEntitlementRow)}</Stack>
                                    </Box>
                                )}
                            </Stack>
                        )}

                        {!loadingExtras && tab === 2 && (
                            <Stack spacing={2}>
                                {payments.length === 0 ? (
                                    <Card variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                            {t('profilePage.payments.empty')}
                                        </Typography>
                                        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                                            <Button component={Link} to="/pricing" variant="contained" color="secondary" disableElevation>
                                                {t('profilePage.payments.browseSubscriptions')}
                                            </Button>
                                            <Button component={Link} to="/reports" variant="outlined">
                                                {t('profilePage.payments.browseReports')}
                                            </Button>
                                        </Stack>
                                    </Card>
                                ) : (
                                    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>{t('dashboard.payments.colSubmitted')}</TableCell>
                                                    <TableCell>{t('dashboard.payments.colFor')}</TableCell>
                                                    <TableCell>{t('dashboard.payments.colAmount')}</TableCell>
                                                    <TableCell>{t('dashboard.payments.colStatus')}</TableCell>
                                                    <TableCell>{t('dashboard.payments.colNote')}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {payments.map(r => {
                                                    const d = describePayment(r)
                                                    const statusKey = `dashboard.payments.status.${r.status}`
                                                    const statusLabel = t(statusKey, { defaultValue: r.status })
                                                    return (
                                                        <TableRow key={r.id}>
                                                            <TableCell>{new Date(r.created_at).toLocaleString(dateLocale)}</TableCell>
                                                            <TableCell>
                                                                {d.link ? (
                                                                    <Box component={Link} to={d.link} sx={{ color: 'secondary.main', fontWeight: 600, textDecoration: 'none' }}>
                                                                        {d.primary}
                                                                    </Box>
                                                                ) : (
                                                                    d.primary
                                                                )}
                                                            </TableCell>
                                                            <TableCell>{formatPriceFromCents(r.amount_cents, r.currency || 'DZD', dateLocale)}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    size="small"
                                                                    label={statusLabel}
                                                                    color={PAYMENT_STATUS_COLOR[r.status] || 'default'}
                                                                    variant={r.status === 'rejected' ? 'outlined' : 'filled'}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ maxWidth: 240 }}>
                                                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                                                    {r.admin_note || '—'}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                )}
                            </Stack>
                        )}

                        {tab === 3 && (
                            <Stack spacing={3}>
                                {msg && (
                                    <Alert severity="success" onClose={() => setMsg('')}>
                                        {msg}
                                    </Alert>
                                )}
                                {err && (
                                    <Alert severity="error" onClose={() => setErr('')}>
                                        {err}
                                    </Alert>
                                )}

                                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                                        {t('profilePage.account.profileTitle')}
                                    </Typography>
                                    <Stack spacing={2} sx={{ maxWidth: 520 }}>
                                        <TextField label={t('profilePage.account.displayName')} value={fullName} onChange={e => setFullName(e.target.value)} size="small" fullWidth />
                                        <TextField label={t('profilePage.account.locale')} select value={locale} onChange={e => setLocale(e.target.value)} size="small" fullWidth>
                                            <MenuItem value="en">English</MenuItem>
                                            <MenuItem value="fr">Français</MenuItem>
                                        </TextField>
                                        <TextField
                                            label={t('profilePage.account.notificationEmail')}
                                            type="email"
                                            value={notificationEmail}
                                            onChange={e => setNotificationEmail(e.target.value)}
                                            size="small"
                                            fullWidth
                                            helperText={t('profilePage.account.notificationEmailHint')}
                                        />
                                        <TextField label={t('profilePage.account.digest')} select value={digest} onChange={e => setDigest(e.target.value)} size="small" fullWidth>
                                            <MenuItem value="off">{t('profilePage.account.digestOff')}</MenuItem>
                                            <MenuItem value="daily">{t('profilePage.account.digestDaily')}</MenuItem>
                                            <MenuItem value="weekly">{t('profilePage.account.digestWeekly')}</MenuItem>
                                        </TextField>
                                        <Button variant="contained" color="secondary" onClick={saveProfile} disabled={savingProfile} sx={{ alignSelf: 'flex-start', fontWeight: 700 }} disableElevation>
                                            {savingProfile ? t('profilePage.account.saving') : t('profilePage.account.saveProfile')}
                                        </Button>
                                    </Stack>
                                </Card>

                                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                                        {t('profilePage.account.securityTitle')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {t('profilePage.account.loginEmail')}: <strong>{user?.email || '—'}</strong>
                                    </Typography>
                                    <Stack spacing={2} sx={{ maxWidth: 520 }}>
                                        <TextField
                                            label={t('profilePage.account.newEmail')}
                                            type="email"
                                            value={newEmail}
                                            onChange={e => setNewEmail(e.target.value)}
                                            size="small"
                                            fullWidth
                                            helperText={t('profilePage.account.newEmailHint')}
                                        />
                                        <Button variant="outlined" onClick={saveEmail} disabled={savingEmail} sx={{ alignSelf: 'flex-start', fontWeight: 700 }}>
                                            {savingEmail ? t('profilePage.account.saving') : t('profilePage.account.updateEmail')}
                                        </Button>
                                        <Divider />
                                        <TextField
                                            label={t('profilePage.account.currentPassword')}
                                            type={showPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={e => setCurrentPassword(e.target.value)}
                                            size="small"
                                            fullWidth
                                            autoComplete="current-password"
                                            helperText={t('profilePage.account.currentPasswordHint')}
                                        />
                                        <TextField
                                            label={t('profilePage.account.newPassword')}
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            size="small"
                                            fullWidth
                                            autoComplete="new-password"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(v => !v)} edge="end" aria-label="toggle password">
                                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            label={t('profilePage.account.confirmPassword')}
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            size="small"
                                            fullWidth
                                            autoComplete="new-password"
                                        />
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <Button variant="contained" color="secondary" onClick={savePassword} disabled={savingPassword} sx={{ fontWeight: 700 }} disableElevation>
                                                {savingPassword ? t('profilePage.account.saving') : t('profilePage.account.changePassword')}
                                            </Button>
                                            <Button component={Link} to="/forgot-password" state={{ redirectTo: '/profile' }} size="small">
                                                {t('profilePage.account.forgotPassword')}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Card>

                                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                                        {t('profilePage.account.privacyTitle')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 560, lineHeight: 1.65 }}>
                                        {t('profilePage.account.privacyBody')}{' '}
                                        <Box component={Link} to="/privacy" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                                            {t('profilePage.account.privacyLink')}
                                        </Box>
                                    </Typography>
                                    <Button variant="outlined" onClick={handleExport} disabled={exporting}>
                                        {exporting ? t('profilePage.account.exporting') : t('profilePage.account.exportData')}
                                    </Button>
                                </Card>

                                <Card variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: 'error.light' }}>
                                    <Typography variant="subtitle1" fontWeight={700} color="error.main" sx={{ mb: 1 }}>
                                        {t('profilePage.account.deleteTitle')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 560, lineHeight: 1.65 }}>
                                        {t('profilePage.account.deleteBody')}
                                    </Typography>
                                    <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
                                        {t('profilePage.account.deleteButton')}
                                    </Button>
                                </Card>

                                <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} maxWidth="xs" fullWidth>
                                    <DialogTitle>{t('profilePage.account.deleteDialogTitle')}</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText sx={{ mb: 2 }}>
                                            {t('profilePage.account.deleteDialogBody', { word: DELETE_CONFIRM })}
                                        </DialogContentText>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={t('profilePage.account.deleteConfirmLabel', { word: DELETE_CONFIRM })}
                                            value={deleteConfirm}
                                            onChange={e => setDeleteConfirm(e.target.value)}
                                            autoComplete="off"
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
                                            {t('profilePage.account.cancel')}
                                        </Button>
                                        <Button color="error" variant="contained" onClick={handleDeleteAccount} disabled={deleting || deleteConfirm !== DELETE_CONFIRM}>
                                            {deleting ? t('profilePage.account.deleting') : t('profilePage.account.deleteForever')}
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </Stack>
                        )}
                    </Box>
                </Card>
            </Container>
            <Footer />
        </Box>
    )
}

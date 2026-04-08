import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PersonIcon from '@mui/icons-material/Person'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { reportPublicPath } from '../lib/reportPath'

function tierLabel(t) {
    if (!t) return 'No active plan'
    return t.charAt(0).toUpperCase() + t.slice(1)
}

export default function ProfilePage() {
    const { supabase, user, profile, subscription, refreshProfile } = useAuth()
    const [tab, setTab] = useState(0)
    const [entitlements, setEntitlements] = useState([])
    const [invoices, setInvoices] = useState([])
    const [usageCount, setUsageCount] = useState(0)
    const [fullName, setFullName] = useState('')
    const [locale, setLocale] = useState('en')
    const [msg, setMsg] = useState('')
    const [err, setErr] = useState('')
    const [saving, setSaving] = useState(false)
    const [loadingExtras, setLoadingExtras] = useState(true)

    useEffect(() => {
        if (!profile) return
        queueMicrotask(() => {
            setFullName(profile.full_name || '')
            setLocale(profile.locale || 'en')
        })
    }, [profile])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !user) {
                setLoadingExtras(false)
                return
            }
            const [e, inv, uc] = await Promise.all([
                supabase.from('user_report_entitlements').select('id, source, expires_at, reports(id, title, slug)').eq('user_id', user.id),
                supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
                supabase.from('usage_events').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            ])
            if (cancelled) return
            setEntitlements(e.data || [])
            setInvoices(inv.data || [])
            setUsageCount(uc.count || 0)
            setLoadingExtras(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, user])

    const saveIdentity = async () => {
        if (!supabase || !user) return
        setSaving(true)
        setMsg('')
        setErr('')
        const { error } = await supabase.from('profiles').update({ full_name: fullName.trim() || null, locale }).eq('id', user.id)
        setSaving(false)
        if (error) setErr(error.message)
        else {
            setMsg('Profile updated.')
            refreshProfile()
        }
    }

    const quota = subscription?.report_quota
    const libCount = entitlements.length
    const pct = quota && quota > 0 ? Math.min(100, Math.round((libCount / quota) * 100)) : 0

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 5, pt: 12 }}>
                <Card sx={{ p: 4, mb: 4 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={3} alignItems={{ md: 'center' }} justifyContent="space-between">
                        <Stack direction="row" gap={3} alignItems="center">
                            <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                                {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h5">{profile?.full_name || 'Your profile'}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user?.email}
                                </Typography>
                                <Stack direction="row" gap={1} sx={{ mt: 1 }} flexWrap="wrap">
                                    <Chip icon={<WorkspacePremiumIcon sx={{ fontSize: 14 }} />} label={tierLabel(subscription?.plan_tier)} size="small" variant="outlined" />
                                    {profile?.created_at && (
                                        <Chip icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />} label={`Joined ${new Date(profile.created_at).toLocaleDateString()}`} size="small" variant="outlined" />
                                    )}
                                    {profile?.app_role && profile.app_role !== 'user' && <Chip label={profile.app_role} size="small" color="secondary" />}
                                </Stack>
                            </Box>
                        </Stack>
                        <Button component={Link} to="/dashboard/settings" variant="outlined" startIcon={<PersonIcon />}>
                            Workspace settings
                        </Button>
                    </Stack>
                </Card>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                        { label: 'Library reports', value: String(libCount), sub: 'Entitlements' },
                        { label: 'Usage events', value: String(usageCount), sub: 'Recorded activity' },
                        { label: 'Invoices', value: String(invoices.length), sub: 'Billing history' },
                        { label: 'Role', value: profile?.app_role || 'user', sub: 'App access' },
                    ].map((s, i) => (
                        <Grid key={i} size={{ xs: 6, lg: 3 }}>
                            <Card sx={{ p: { xs: 2, md: 3 } }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
                                    {s.label}
                                </Typography>
                                <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                                    {s.value}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {s.sub}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Card>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: '1px solid #e2e8f0', px: { xs: 0, md: 2 } }}>
                        <Tab label="Subscription" />
                        <Tab label="Purchased" />
                        <Tab label="Invoices" />
                        <Tab label="Identity" />
                    </Tabs>
                    <Box sx={{ p: { xs: 2, md: 4 } }}>
                        {loadingExtras && (
                            <Stack alignItems="center" py={4}>
                                <CircularProgress size={28} />
                            </Stack>
                        )}
                        {!loadingExtras && tab === 0 && (
                            <Stack spacing={3}>
                                <Card variant="outlined" sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {subscription ? `${tierLabel(subscription.plan_tier)} plan` : 'No subscription row'}
                                    </Typography>
                                    {subscription && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Status: {subscription.status}
                                            {subscription.current_period_end && ` · Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`}
                                        </Typography>
                                    )}
                                    <Stack direction="row" gap={1} flexWrap="wrap">
                                        <Button component={Link} to="/pricing" variant="contained" size="small" color="secondary">
                                            Plans
                                        </Button>
                                        <Button component={Link} to="/dashboard/billing" variant="outlined" size="small">
                                            Billing detail
                                        </Button>
                                    </Stack>
                                </Card>
                                {quota != null && quota > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                            Library vs quota
                                        </Typography>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                            <Typography variant="body2">Reports</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {libCount} / {quota}
                                            </Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3 }} />
                                    </Box>
                                )}
                            </Stack>
                        )}
                        {!loadingExtras && tab === 1 && (
                            <Stack spacing={2}>
                                {!entitlements.length && <Alert severity="info">No purchases or grants yet.</Alert>}
                                {entitlements.map(row => (
                                    <Card key={row.id} variant="outlined" sx={{ p: 2 }}>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1}>
                                            <Box>
                                                <Typography variant="subtitle2">{row.reports?.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {row.source} {row.expires_at && `· Expires ${new Date(row.expires_at).toLocaleDateString()}`}
                                                </Typography>
                                            </Box>
                                            {row.reports && (
                                                <Button component={Link} to={reportPublicPath(row.reports)} size="small" variant="outlined">
                                                    Open
                                                </Button>
                                            )}
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                        {!loadingExtras && tab === 2 && (
                            <Stack spacing={2}>
                                {!invoices.length && <Alert severity="info">No invoices.</Alert>}
                                {invoices.map(inv => (
                                    <Card key={inv.id} variant="outlined" sx={{ p: 2 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle2">
                                                {inv.amount_cents / 100} {inv.currency}
                                            </Typography>
                                            <Typography variant="caption">{new Date(inv.created_at).toLocaleString()}</Typography>
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                        {!loadingExtras && tab === 3 && (
                            <Stack spacing={3} sx={{ maxWidth: 560 }}>
                                {msg && <Alert severity="success">{msg}</Alert>}
                                {err && <Alert severity="error">{err}</Alert>}
                                <Typography variant="subtitle2">Display name & locale</Typography>
                                <TextField fullWidth label="Display name" value={fullName} onChange={e => setFullName(e.target.value)} size="small" />
                                <TextField fullWidth label="Locale" select value={locale} onChange={e => setLocale(e.target.value)} size="small">
                                    <MenuItem value="en">English</MenuItem>
                                    <MenuItem value="fr">Français</MenuItem>
                                </TextField>
                                <Typography variant="caption" color="text.secondary">
                                    Email and password are managed in Supabase Auth (use password reset from login).
                                </Typography>
                                <Divider />
                                <Button variant="contained" color="secondary" onClick={saveIdentity} disabled={saving}>
                                    {saving ? 'Saving…' : 'Save'}
                                </Button>
                            </Stack>
                        )}
                    </Box>
                </Card>
            </Container>
            <Footer />
        </Box>
    )
}

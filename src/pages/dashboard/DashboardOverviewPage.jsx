import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import EmptyState from '../../components/shell/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { reportPublicPath } from '../../lib/reportPath'

function tierLabel(t) {
    if (!t) return 'No plan'
    return t.charAt(0).toUpperCase() + t.slice(1)
}

export default function DashboardOverviewPage() {
    const { supabase, user, profile, subscription } = useAuth()
    const [entitlementCount, setEntitlementCount] = useState(0)
    const [recent, setRecent] = useState([])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !user) return
            const { count } = await supabase.from('user_report_entitlements').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
            if (!cancelled) setEntitlementCount(count || 0)
            const { data: ev } = await supabase
                .from('usage_events')
                .select('id, event_type, created_at, report_id, reports(title, slug)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5)
            if (!cancelled) setRecent(ev || [])
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, user])

    const quota = subscription?.report_quota
    const pct = quota && quota > 0 ? Math.min(100, Math.round((entitlementCount / quota) * 100)) : 0

    return (
        <Stack spacing={4}>
            <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                    {profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}` : 'Welcome back'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Your workspace — plan, library, and shortcuts. Data comes from your Supabase project.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
                            Plan & quota
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1, mb: 2, fontWeight: 800 }}>
                            {tierLabel(subscription?.plan_tier)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Reports in your library vs plan quota (when set)
                        </Typography>
                        {quota != null && quota > 0 ? (
                            <>
                                <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 1, mb: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    {entitlementCount} of {quota} (library count as proxy)
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="caption" color="text.secondary">
                                {entitlementCount} entitled report(s). Set `report_quota` on subscriptions for a progress bar.
                            </Typography>
                        )}
                        <Button component={Link} to="/dashboard/billing" size="small" sx={{ mt: 2, fontWeight: 700 }}>
                            Billing
                        </Button>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                            Continue
                        </Typography>
                        {!recent.length ? (
                            <EmptyState title="No recent activity" description="Open reports from the catalogue to record usage_events (e.g. report_open).">
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                                    <Button component={Link} to="/reports" variant="contained" color="secondary" size="small" disableElevation>
                                        Browse reports
                                    </Button>
                                    <Button component={Link} to="/dashboard/reports" variant="outlined" size="small">
                                        Library
                                    </Button>
                                </Stack>
                            </EmptyState>
                        ) : (
                            <List disablePadding>
                                {recent.map(row => (
                                    <ListItem key={row.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                                        <ListItemText
                                            primary={row.reports?.title || row.event_type}
                                            secondary={new Date(row.created_at).toLocaleString()}
                                        />
                                        {row.reports && (
                                            <Button component={Link} to={reportPublicPath(row.reports)} size="small">
                                                Open
                                            </Button>
                                        )}
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {[
                    { title: 'Statistics', desc: 'Usage and trends for your plan only.', to: '/dashboard/statistics', label: 'View stats' },
                    { title: 'Search', desc: 'Full-text search across the catalogue.', to: '/search', label: 'Open search' },
                    { title: 'AI assistant', desc: 'Ask questions with paywall-aware answers.', to: '/ai', label: 'Open AI' },
                    { title: 'Watchlist', desc: 'Track sectors and new publications.', to: '/dashboard/watchlist', label: 'Manage' },
                ].map(item => (
                    <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                            <Typography fontWeight={700} sx={{ mb: 1 }}>
                                {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
                                {item.desc}
                            </Typography>
                            <Button component={Link} to={item.to} size="small" sx={{ fontWeight: 700 }}>
                                {item.label}
                            </Button>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    )
}

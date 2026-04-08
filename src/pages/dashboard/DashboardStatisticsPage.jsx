import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import EmptyState from '../../components/shell/EmptyState'
import { useAuth } from '../../context/AuthContext'

const METRICS = [
    { key: 'report_open', title: 'Reports opened' },
    { key: 'search', title: 'Search queries' },
    { key: 'ai_message', title: 'AI messages' },
    { key: 'export', title: 'Exports' },
]

export default function DashboardStatisticsPage() {
    const { supabase, user, subscription } = useAuth()
    const [counts, setCounts] = useState({})
    const [loading, setLoading] = useState(true)

    const tier = subscription?.plan_tier ? subscription.plan_tier.charAt(0).toUpperCase() + subscription.plan_tier.slice(1) : 'None'

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !user) {
                setLoading(false)
                return
            }
            const { data } = await supabase.from('usage_events').select('event_type').eq('user_id', user.id)
            if (cancelled) return
            const c = {}
            ;(data || []).forEach(r => {
                c[r.event_type] = (c[r.event_type] || 0) + 1
            })
            setCounts(c)
            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, user])

    return (
        <Stack spacing={3}>
            <Box>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
                    <Typography variant="h5" fontWeight={800}>
                        Statistics & usage
                    </Typography>
                    <Chip label={`Plan: ${tier}`} size="small" variant="outlined" color="secondary" />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    Aggregated from <strong>usage_events</strong> for your user only.
                </Typography>
            </Box>

            {loading && (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={32} />
                </Stack>
            )}

            <Grid container spacing={2}>
                {METRICS.map(m => (
                    <Grid key={m.key} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card variant="outlined" sx={{ p: 2.5, height: '100%', borderRadius: 2 }}>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.06em' }}>
                                {m.title}
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                                {counts[m.key] ?? 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                All time
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Trends
                </Typography>
                <EmptyState title="Charts next" description="Connect a time-series query or BI tool; raw events are in usage_events.">
                    <Button component={Link} to="/pricing" variant="outlined" size="small">
                        Compare plans
                    </Button>
                </EmptyState>
            </Card>
        </Stack>
    )
}

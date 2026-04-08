import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'

export default function AdminOverviewPage() {
    const { supabase } = useAuth()
    const [counts, setCounts] = useState({ reports: '—', profiles: '—', published: '—' })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase) {
                setLoading(false)
                return
            }
            const [r1, r2, r3] = await Promise.all([
                supabase.from('reports').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'published'),
            ])
            if (!cancelled) {
                setCounts({
                    reports: r1.count ?? 0,
                    profiles: r2.count ?? 0,
                    published: r3.count ?? 0,
                })
                setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [supabase])

    const shortcuts = [
        { title: 'Reports', desc: 'Publish, draft, and review catalogue entries.', to: '/admin/reports' },
        { title: 'Sectors', desc: 'Taxonomy, slugs, and featured catalogue groupings.', to: '/admin/sectors' },
        { title: 'Blog', desc: 'News posts and editorial content for the marketing site.', to: '/admin/blog' },
        { title: 'Import', desc: 'Bulk ingest PDFs and metadata.', to: '/admin/import' },
        { title: 'Promotions', desc: 'Coupons and featured homepage slots.', to: '/admin/promotions' },
        { title: 'Users', desc: 'Subscribers and entitlements.', to: '/admin/users' },
        { title: 'Analytics', desc: 'Traffic and conversions (requires events API).', to: '/admin/analytics' },
        { title: 'Audit log', desc: 'Who changed what, and when.', to: '/admin/audit' },
    ]

    return (
        <Stack spacing={4}>
            <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                    Overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage all catalogue content (reports, sectors, blog), imports, promotions, and every subscriber from here. Counts load from Supabase.
                </Typography>
            </Box>
            {loading ? (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={36} />
                </Stack>
            ) : (
                <Grid container spacing={3}>
                    {[
                        { label: 'Reports (all)', value: counts.reports },
                        { label: 'Published reports', value: counts.published },
                        { label: 'Profiles', value: counts.profiles },
                    ].map(k => (
                        <Grid key={k.label} size={{ xs: 12, sm: 4 }}>
                            <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    {k.label}
                                </Typography>
                                <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                                    {k.value}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
            <Grid container spacing={2}>
                {shortcuts.map(s => (
                    <Grid key={s.to} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card variant="outlined" sx={{ p: 2.5, height: '100%', borderRadius: 2 }}>
                            <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                                {s.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                                {s.desc}
                            </Typography>
                            <Button component={Link} to={s.to} size="small" sx={{ fontWeight: 700 }}>
                                Open
                            </Button>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    )
}

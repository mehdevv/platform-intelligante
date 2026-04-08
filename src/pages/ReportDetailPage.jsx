import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import LockIcon from '@mui/icons-material/Lock'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { isUuid } from '../lib/reportPath'

export default function ReportDetailPage() {
    const { id } = useParams()
    const { supabase, user } = useAuth()
    const [report, setReport] = useState(null)
    const [entitled, setEntitled] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !id) {
                setLoading(false)
                return
            }
            setLoading(true)
            setError('')
            const col = isUuid(id) ? 'id' : 'slug'
            const { data: rep, error: e1 } = await supabase.from('reports').select('*, sectors(id, name, slug)').eq(col, id).maybeSingle()
            if (cancelled) return
            if (e1 || !rep) {
                setError(e1?.message || 'Report not found')
                setReport(null)
                setLoading(false)
                return
            }
            setReport(rep)
            if (user) {
                const { data: ent } = await supabase
                    .from('user_report_entitlements')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('report_id', rep.id)
                    .maybeSingle()
                if (!cancelled) setEntitled(!!ent)
            } else {
                setEntitled(false)
            }
            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, id, user])

    const priceLabel =
        report && report.price_cents > 0
            ? `${(report.price_cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })} ${report.currency}`
            : 'Contact us'

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 4, pt: 12 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress color="secondary" />
                    </Box>
                )}
                {!loading && error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {!loading && report && (
                    <>
                        <Breadcrumbs sx={{ mb: 3, fontSize: '0.875rem' }}>
                            <Box component={Link} to="/" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                                Home
                            </Box>
                            <Box component={Link} to="/reports" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                                Reports
                            </Box>
                            {report.sectors?.slug && (
                                <Box component={Link} to={`/sectors/${report.sectors.slug}`} sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                                    {report.sectors.name}
                                </Box>
                            )}
                            <Typography variant="body2" color="text.primary" fontWeight={600}>
                                {report.title}
                            </Typography>
                        </Breadcrumbs>

                        <Grid container spacing={6}>
                            <Grid size={{ xs: 12, lg: 7 }}>
                                <Stack spacing={3}>
                                    <Box>
                                        <Stack direction="row" gap={1} sx={{ mb: 2 }} flexWrap="wrap">
                                            <Chip label={report.status} size="small" color={report.status === 'published' ? 'secondary' : 'default'} />
                                            {report.sectors?.name && <Chip label={report.sectors.name} size="small" variant="outlined" />}
                                            {entitled && <Chip label="In your library" size="small" color="success" variant="outlined" />}
                                        </Stack>
                                        <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: '1.75rem', sm: '2.25rem' }, lineHeight: 1.2 }}>
                                            {report.title}
                                        </Typography>
                                        {report.summary && (
                                            <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ lineHeight: 1.6 }}>
                                                {report.summary}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Divider />
                                    {!entitled && report.status === 'published' && (
                                        <Card variant="outlined" sx={{ p: 3, borderStyle: 'dashed' }}>
                                            <Stack direction="row" gap={2} alignItems="flex-start">
                                                <LockIcon color="action" />
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                                                        Preview ({report.preview_pct}% free in product policy)
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                        Purchase or subscribe to unlock the full PDF and datasets. Entitlements are enforced server-side in production.
                                                    </Typography>
                                                    <Button component={Link} to={user ? '/checkout' : '/login'} state={{ reportId: report.id }} variant="contained" color="secondary" size="small">
                                                        {user ? 'Checkout' : 'Sign in to purchase'}
                                                    </Button>
                                                </Box>
                                            </Stack>
                                        </Card>
                                    )}
                                    {entitled && (
                                        <Alert severity="success">You have access to this report. Download links will use signed URLs once storage is wired.</Alert>
                                    )}
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, lg: 5 }}>
                                <Box sx={{ position: 'sticky', top: '5rem' }}>
                                    <Card sx={{ overflow: 'hidden' }}>
                                        <Box sx={{ bgcolor: 'rgba(25,127,148,0.06)', p: 3, borderBottom: '1px solid #f1f5f9' }}>
                                            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary' }}>
                                                Price
                                            </Typography>
                                            <Typography variant="h3" sx={{ mt: 0.5 }}>
                                                {priceLabel}
                                            </Typography>
                                        </Box>
                                        <CardContent sx={{ p: 3 }}>
                                            <Stack spacing={2}>
                                                <Button fullWidth variant="contained" size="large" component={Link} to="/pricing" sx={{ py: 1.5 }}>
                                                    View plans
                                                </Button>
                                                <Button fullWidth variant="outlined" size="large" component={Link} to="/checkout" state={{ reportId: report.id }} sx={{ py: 1.5 }}>
                                                    Buy this report
                                                </Button>
                                                <Divider />
                                                <Stack direction="row" gap={1} alignItems="center">
                                                    <PictureAsPdfIcon color="primary" fontSize="small" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Full PDF after purchase
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Container>
            <Footer />
        </Box>
    )
}

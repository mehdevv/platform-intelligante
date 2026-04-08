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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { reportPublicPath } from '../lib/reportPath'

export default function SectorDetailPage() {
    const { id: slug } = useParams()
    const { supabase, user } = useAuth()
    const [sector, setSector] = useState(null)
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !slug) {
                setLoading(false)
                return
            }
            const { data: sec, error: e1 } = await supabase.from('sectors').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()
            if (cancelled) return
            if (e1 || !sec) {
                setError(e1?.message || 'Sector not found')
                setSector(null)
                setLoading(false)
                return
            }
            setSector(sec)
            const { data: reps } = await supabase
                .from('reports')
                .select('id, slug, title, summary, published_at, price_cents, currency')
                .eq('sector_id', sec.id)
                .eq('status', 'published')
                .order('published_at', { ascending: false, nullsFirst: false })
            if (!cancelled) setReports(reps || [])
            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, slug])

    const followSector = async () => {
        if (!supabase || !user || !sector) return
        await supabase.from('watchlist_items').insert({ user_id: user.id, sector_id: sector.id })
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 4, pt: 12 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress color="secondary" />
                    </Box>
                )}
                {!loading && error && <Alert severity="error">{error}</Alert>}
                {!loading && sector && (
                    <>
                        <Breadcrumbs sx={{ mb: 3, fontSize: '0.875rem' }}>
                            <Box component={Link} to="/" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                                Home
                            </Box>
                            <Box component={Link} to="/sectors" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                                Sectors
                            </Box>
                            <Typography variant="body2" color="text.primary" fontWeight={600}>
                                {sector.name}
                            </Typography>
                        </Breadcrumbs>

                        <Card sx={{ p: 4, mb: 4 }}>
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={3}>
                                <Box>
                                    <Typography variant="h4" sx={{ mb: 1 }}>
                                        {sector.name}
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.7 }}>
                                        {sector.description || 'Reports and insights for this sector.'}
                                    </Typography>
                                    <Chip label={`${reports.length} published reports`} size="small" sx={{ mt: 2 }} />
                                </Box>
                                {user && (
                                    <Button variant="outlined" startIcon={<BookmarkBorderIcon />} onClick={followSector} sx={{ whiteSpace: 'nowrap' }}>
                                        Add to watchlist
                                    </Button>
                                )}
                            </Stack>
                        </Card>

                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
                            Reports
                        </Typography>
                        {!reports.length && <Alert severity="info">No published reports in this sector yet.</Alert>}
                        <Grid container spacing={2}>
                            {reports.map(r => (
                                <Grid key={r.id} size={{ xs: 12, sm: 6 }}>
                                    <Card variant="outlined" component={Link} to={reportPublicPath(r)} sx={{ textDecoration: 'none' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {r.title}
                                            </Typography>
                                            {r.summary && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
                                                    {r.summary}
                                                </Typography>
                                            )}
                                            <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 2, color: 'secondary.main' }}>
                                                <Typography variant="body2" fontWeight={700}>
                                                    Open
                                                </Typography>
                                                <ArrowForwardIcon sx={{ fontSize: 16 }} />
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
            </Container>
            <Footer />
        </Box>
    )
}

import React, { useEffect, useMemo, useState } from 'react'
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
import Avatar from '@mui/material/Avatar'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StarIcon from '@mui/icons-material/Star'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { formatPriceFromCents } from '../lib/moneyFormat'
import { reportPublicPath } from '../lib/reportPath'
import LockOpenIcon from '@mui/icons-material/LockOpen'

export default function SectorDetailPage() {
    const { id: slug } = useParams()
    const { supabase, user } = useAuth()
    const [sector, setSector] = useState(null)
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [sectorSubscribed, setSectorSubscribed] = useState(false)

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
                .select('id, slug, title, summary, published_at, price_cents, currency, thumbnail_image_url')
                .eq('sector_id', sec.id)
                .eq('status', 'published')
                .order('published_at', { ascending: false, nullsFirst: false })
            if (!cancelled) setReports(reps || [])
            if (user) {
                const nowIso = new Date().toISOString()
                const { data: ent } = await supabase
                    .from('user_report_entitlements')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('sector_id', sec.id)
                    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
                    .limit(1)
                if (!cancelled) setSectorSubscribed(Array.isArray(ent) && ent.length > 0)
            } else {
                setSectorSubscribed(false)
            }
            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, slug, user])

    const sectorStats = useMemo(() => {
        const total = reports.length
        const paid = reports.filter(r => (r.price_cents ?? 0) > 0).length
        const free = total - paid
        const times = reports.map(r => r.published_at).filter(Boolean)
        const latestTs = times.length ? Math.max(...times.map(t => new Date(t).getTime())) : null
        const latest = latestTs ? new Date(latestTs) : null
        return { total, paid, free, latest }
    }, [reports])

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
                            <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ lg: 'stretch' }} gap={3}>
                                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
                                    {sector.icon_image_url ? (
                                        <Avatar src={sector.icon_image_url} alt="" variant="rounded" sx={{ width: 72, height: 72 }} />
                                    ) : (
                                        <Avatar variant="rounded" sx={{ width: 72, height: 72, bgcolor: 'rgba(25,127,148,0.12)', color: 'secondary.main' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
                                                category
                                            </span>
                                        </Avatar>
                                    )}
                                    <Box>
                                        <Typography variant="h4" sx={{ mb: 1 }}>
                                            {sector.name}
                                        </Typography>
                                        <Typography color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.7 }}>
                                            {sector.description || 'Reports and insights for this sector.'}
                                        </Typography>
                                        {sectorSubscribed && (
                                            <Chip icon={<LockOpenIcon />} label="Subscribed — full sector access" color="success" sx={{ mt: 2, fontWeight: 700 }} />
                                        )}
                                        {!sectorSubscribed && (sector.subscription_price_cents ?? 0) > 0 && (
                                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                                                <Typography variant="body2" color="text.secondary">
                                                    Monthly subscription:
                                                </Typography>
                                                <Typography variant="h6" color="secondary.main" sx={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 800 }}>
                                                    {formatPriceFromCents(sector.subscription_price_cents, sector.currency || 'DZD')}
                                                </Typography>
                                                <Button
                                                    component={Link}
                                                    to={user ? `/checkout?sectorId=${sector.id}` : '/login'}
                                                    state={user ? undefined : { redirectTo: `/checkout?sectorId=${sector.id}` }}
                                                    variant="contained"
                                                    color="secondary"
                                                    disableElevation
                                                    size="small"
                                                >
                                                    Subscribe
                                                </Button>
                                            </Stack>
                                        )}
                                    </Box>
                                </Stack>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' },
                                        gap: { xs: 1.5, sm: 2 },
                                        p: 2,
                                        flexShrink: 0,
                                        width: { xs: '100%', lg: 'auto' },
                                        minWidth: { lg: 320 },
                                        bgcolor: 'rgba(25, 127, 148, 0.06)',
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    {[
                                        { label: 'Published reports', value: String(sectorStats.total), caption: 'in catalogue' },
                                        {
                                            label: 'Paid vs free',
                                            value: sectorStats.total ? `${sectorStats.paid} / ${sectorStats.free}` : '—',
                                            caption: 'priced / complimentary',
                                        },
                                        {
                                            label: 'Latest update',
                                            value: sectorStats.latest
                                                ? sectorStats.latest.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                                : '—',
                                            caption: 'newest publish date',
                                        },
                                    ].map(s => (
                                        <Box key={s.label} sx={{ px: { xs: 0.5, sm: 1 }, py: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
                                                {s.label}
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 800, mt: 0.5, lineHeight: 1.2 }}>
                                                {s.value}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                                {s.caption}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Stack>
                        </Card>

                        <Stack spacing={1} sx={{ mb: 3 }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontFamily: '"League Spartan", sans-serif',
                                    fontWeight: 800,
                                    fontSize: { xs: '1.35rem', sm: '1.5rem' },
                                }}
                            >
                                Reports in this sector
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {reports.length
                                    ? `${reports.length} report${reports.length === 1 ? '' : 's'} — open a card for the full overview and purchase options.`
                                    : 'Published catalogue items will appear here.'}
                            </Typography>
                        </Stack>
                        {!reports.length && <Alert severity="info">No published reports in this sector yet.</Alert>}
                        <Grid container spacing={3}>
                            {reports.map(r => {
                                const summaryIsDistinct = r.summary && r.summary.trim() !== r.title.trim()
                                return (
                                    <Grid key={r.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                                        <Card
                                            component={Link}
                                            to={reportPublicPath(r)}
                                            elevation={0}
                                            sx={{
                                                textDecoration: 'none',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                overflow: 'hidden',
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)',
                                                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                                                '&:hover': {
                                                    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
                                                    transform: 'translateY(-3px)',
                                                },
                                                '&:hover .sector-report-title': { color: 'primary.main' },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    aspectRatio: '4/3',
                                                    overflow: 'hidden',
                                                    background: 'linear-gradient(135deg, #4B5B72, #197F94)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {r.thumbnail_image_url ? (
                                                    <Box
                                                        component="img"
                                                        src={r.thumbnail_image_url}
                                                        alt=""
                                                        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'rgba(255,255,255,0.2)' }}>
                                                        analytics
                                                    </span>
                                                )}
                                                {r.price_cents > 0 && (
                                                    <Chip
                                                        icon={<StarIcon sx={{ fontSize: 14 }} />}
                                                        label="Paid"
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 12,
                                                            right: 12,
                                                            zIndex: 1,
                                                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                            color: '#fff',
                                                            fontWeight: 700,
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'text.secondary', mb: 1 }}
                                                >
                                                    {r.published_at ? new Date(r.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Published'}
                                                </Typography>
                                                <Typography
                                                    className="sector-report-title"
                                                    variant="h6"
                                                    sx={{
                                                        fontFamily: '"League Spartan", sans-serif',
                                                        fontWeight: 700,
                                                        mb: 1,
                                                        color: 'text.primary',
                                                        lineHeight: 1.25,
                                                        fontSize: '1.05rem',
                                                    }}
                                                >
                                                    {r.title}
                                                </Typography>
                                                {summaryIsDistinct && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mb: 2,
                                                            flexGrow: 1,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            lineHeight: 1.5,
                                                        }}
                                                    >
                                                        {r.summary}
                                                    </Typography>
                                                )}
                                                {!summaryIsDistinct && <Box sx={{ flexGrow: 1, minHeight: 8 }} />}
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, mt: 'auto' }}>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        {r.price_cents > 0 ? formatPriceFromCents(r.price_cents, r.currency) : 'Free'}
                                                    </Typography>
                                                    <Button
                                                        component="span"
                                                        size="small"
                                                        variant="contained"
                                                        color="secondary"
                                                        disableElevation
                                                        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                                                        sx={{ fontSize: '0.75rem', pointerEvents: 'none' }}
                                                    >
                                                        View report
                                                    </Button>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </>
                )}
            </Container>
            <Footer />
        </Box>
    )
}

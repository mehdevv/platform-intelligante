import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { formatPriceFromCents } from '../lib/moneyFormat'

const CARD_WIDTH = 320

export default function PricingPage() {
    const { t } = useTranslation()
    const { supabase } = useAuth()
    const [sectors, setSectors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const scrollerRef = useRef(null)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase) {
                setLoading(false)
                return
            }
            setError('')
            const { data, error: e } = await supabase
                .from('sectors')
                .select('id, slug, name, description, icon_image_url, subscription_price_cents, currency, sort_order')
                .eq('is_published', true)
                .gt('subscription_price_cents', 0)
                .order('sort_order', { ascending: true })
                .order('name', { ascending: true })
            if (cancelled) return
            if (e) setError(e.message)
            else setSectors(data || [])
            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase])

    const scrollBy = direction => {
        const el = scrollerRef.current
        if (!el) return
        const amount = el.clientWidth * 0.85 * (direction === 'next' ? 1 : -1)
        el.scrollBy({ left: amount, behavior: 'smooth' })
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ pt: '72px' }}>
                <Box className="page-hero-slant section-fade-in" sx={{ py: { xs: 6, md: 10 }, px: 2, background: 'linear-gradient(180deg, #fff 0%, #EBECF1 100%)' }}>
                    <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                        <Typography variant="overline" color="secondary.main" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
                            {t('pricing.sectorCarousel.overline')}
                        </Typography>
                        <Typography variant="h2" sx={{ mt: 1, mb: 2, fontSize: { xs: '2rem', md: '3rem' }, fontFamily: '"League Spartan", sans-serif', fontWeight: 800 }}>
                            {t('pricing.sectorCarousel.title')}
                        </Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 640, mx: 'auto', lineHeight: 1.7 }}>
                            {t('pricing.sectorCarousel.subtitle')}
                        </Typography>
                    </Container>
                </Box>

                <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
                    {loading && (
                        <Stack alignItems="center" py={6}>
                            <CircularProgress color="secondary" />
                        </Stack>
                    )}
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {!loading && sectors.length === 0 && !error && (
                        <Alert severity="info">
                            {t('pricing.sectorCarousel.empty')}
                        </Alert>
                    )}
                    {!loading && sectors.length > 0 && (
                        <Box sx={{ position: 'relative' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                                    {sectors.length} {t('pricing.sectorCarousel.subscriptionsAvailable')}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <IconButton onClick={() => scrollBy('prev')} aria-label="Previous" sx={{ border: '1px solid', borderColor: 'divider' }}>
                                        <ChevronLeftIcon />
                                    </IconButton>
                                    <IconButton onClick={() => scrollBy('next')} aria-label="Next" sx={{ border: '1px solid', borderColor: 'divider' }}>
                                        <ChevronRightIcon />
                                    </IconButton>
                                </Stack>
                            </Stack>
                            <Box
                                ref={scrollerRef}
                                sx={{
                                    display: 'flex',
                                    gap: 3,
                                    overflowX: 'auto',
                                    scrollSnapType: 'x mandatory',
                                    pb: 2,
                                    px: 0.5,
                                    scrollbarWidth: 'thin',
                                    '&::-webkit-scrollbar': { height: 8 },
                                    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.18)', borderRadius: 4 },
                                }}
                            >
                                {sectors.map(s => (
                                    <Card
                                        key={s.id}
                                        elevation={0}
                                        sx={{
                                            flex: `0 0 ${CARD_WIDTH}px`,
                                            width: CARD_WIDTH,
                                            scrollSnapAlign: 'start',
                                            p: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 3,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.06)',
                                            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                                            '&:hover': { boxShadow: '0 18px 48px rgba(15, 23, 42, 0.14)', transform: 'translateY(-4px)' },
                                        }}
                                    >
                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                                            {s.icon_image_url ? (
                                                <Avatar src={s.icon_image_url} alt="" variant="rounded" sx={{ width: 52, height: 52 }} />
                                            ) : (
                                                <Avatar variant="rounded" sx={{ width: 52, height: 52, bgcolor: 'rgba(25,127,148,0.12)', color: 'secondary.main' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 26 }}>category</span>
                                                </Avatar>
                                            )}
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="h6" fontWeight={800} sx={{ fontFamily: '"League Spartan", sans-serif', lineHeight: 1.2, overflowWrap: 'anywhere' }}>
                                                    {s.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('pricing.sectorCarousel.sectorSubscription')}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <Box sx={{ my: 2 }}>
                                            <Typography variant="h4" fontWeight={800} color="secondary.main" sx={{ fontFamily: '"League Spartan", sans-serif' }}>
                                                {formatPriceFromCents(s.subscription_price_cents, s.currency || 'DZD')}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('pricing.sectorCarousel.perMonth')}
                                            </Typography>
                                        </Box>
                                        {s.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    lineHeight: 1.5,
                                                    overflowWrap: 'anywhere',
                                                }}
                                            >
                                                {s.description}
                                            </Typography>
                                        )}
                                        <Stack spacing={1} sx={{ mb: 3, flexGrow: 1 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'inherit' }}>check_circle</span>
                                                {t('pricing.sectorCarousel.benefit1')}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'inherit' }}>check_circle</span>
                                                {t('pricing.sectorCarousel.benefit2')}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'inherit' }}>check_circle</span>
                                                {t('pricing.sectorCarousel.benefit3')}
                                            </Typography>
                                        </Stack>
                                        <Stack spacing={1}>
                                            <Button
                                                component={Link}
                                                to={`/checkout?sectorId=${s.id}`}
                                                variant="contained"
                                                color="secondary"
                                                disableElevation
                                                fullWidth
                                            >
                                                {t('pricing.sectorCarousel.cta')}
                                            </Button>
                                            <Button component={Link} to={`/sectors/${s.slug}`} size="small" fullWidth>
                                                {t('pricing.sectorCarousel.exploreSector')}
                                            </Button>
                                        </Stack>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Container>

                <Box sx={{ py: 8, px: 2 }}>
                    <Container maxWidth="md">
                        <Box className="shimmer-border" sx={{ bgcolor: 'primary.main', borderRadius: 6, p: { xs: 4, md: 6 }, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <Typography variant="h4" sx={{ color: '#fff', mb: 2, fontFamily: '"League Spartan", sans-serif', fontWeight: 800 }}>
                                {t('pricing.sectorCarousel.singleReportTitle')}
                            </Typography>
                            <Typography sx={{ color: 'rgba(225,244,247,0.95)', mb: 4 }}>
                                {t('pricing.sectorCarousel.singleReportBody')}
                            </Typography>
                            <Button component={Link} to="/reports" variant="contained" color="secondary" disableElevation size="large" sx={{ px: 5 }}>
                                {t('pricing.sectorCarousel.singleReportCta')}
                            </Button>
                        </Box>
                    </Container>
                </Box>
            </Box>
            <Footer />
        </Box>
    )
}

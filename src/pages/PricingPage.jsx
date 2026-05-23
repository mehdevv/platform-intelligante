import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { MotionFadeInUp, MotionInView, MotionStagger, MotionStaggerItem } from '../components/motion/Motion'
import { useAuth } from '../context/AuthContext'
import { formatPriceFromCents } from '../lib/moneyFormat'

function PricingSummaryCard({ t, selectedSectors, totalCents, currency, onCheckout }) {
    return (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, position: { lg: 'sticky' }, top: 96 }}>
            <Typography variant="h6" fontWeight={800} sx={{ fontFamily: '"League Spartan", sans-serif', mb: 1 }}>
                {t('pricing.wizard.offerTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                {t('pricing.wizard.offerBody')}
            </Typography>
            <Stack spacing={1.25} sx={{ mb: 2.5 }}>
                {[1, 2, 3].map(i => (
                    <Stack key={i} direction="row" gap={1.25} alignItems="flex-start">
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#197F94', flexShrink: 0 }}>
                            check_circle
                        </span>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                            {t(`pricing.wizard.offerBenefit${i}`)}
                        </Typography>
                    </Stack>
                ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                {t('pricing.wizard.summary')}
            </Typography>

            {!selectedSectors.length ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('pricing.wizard.noneSelected')}
                </Typography>
            ) : (
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                    {selectedSectors.map(s => (
                        <Stack key={s.id} direction="row" justifyContent="space-between" gap={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {s.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                                {formatPriceFromCents(s.subscription_price_cents, s.currency || 'DZD')}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            )}

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 3 }}>
                <Typography fontWeight={800}>{t('checkout.total')}</Typography>
                <Typography variant="h5" fontWeight={800} color="secondary.main" sx={{ fontFamily: '"League Spartan", sans-serif' }}>
                    {formatPriceFromCents(totalCents, currency)}
                </Typography>
            </Stack>

            <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                disableElevation
                disabled={!selectedSectors.length}
                onClick={onCheckout}
            >
                {t('pricing.wizard.checkout')}
            </Button>
            <Button component={Link} to="/reports" size="small" fullWidth sx={{ mt: 1.5 }}>
                {t('pricing.sectorCarousel.singleReportCta')}
            </Button>
        </Paper>
    )
}

export default function PricingPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { supabase } = useAuth()
    const [sectors, setSectors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selected, setSelected] = useState(() => new Set())

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

    const selectedSectors = useMemo(() => sectors.filter(s => selected.has(s.id)), [sectors, selected])

    const totalCents = useMemo(
        () => selectedSectors.reduce((sum, s) => sum + (s.subscription_price_cents ?? 0), 0),
        [selectedSectors],
    )

    const currency = selectedSectors[0]?.currency || sectors[0]?.currency || 'DZD'

    const toggleSector = id => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const goCheckout = () => {
        if (!selectedSectors.length) return
        const ids = selectedSectors.map(s => s.id).join(',')
        navigate(`/checkout?sectorIds=${ids}`)
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ pt: '72px' }}>
                <MotionInView>
                    <Box sx={{ py: { xs: 5, md: 8 }, px: 2, background: 'linear-gradient(180deg, #fff 0%, #EBECF1 100%)' }}>
                        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                            <Typography variant="overline" color="secondary.main" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
                                {t('pricing.wizard.overline')}
                            </Typography>
                            <Typography variant="h2" sx={{ mt: 1, mb: 2, fontSize: { xs: '2rem', md: '3rem' }, fontFamily: '"League Spartan", sans-serif', fontWeight: 800 }}>
                                {t('pricing.wizard.title')}
                            </Typography>
                            <Typography color="text.secondary" sx={{ maxWidth: 640, mx: 'auto', lineHeight: 1.7 }}>
                                {t('pricing.wizard.subtitle')}
                            </Typography>
                        </Container>
                    </Box>
                </MotionInView>

                <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    {loading && (
                        <Stack alignItems="center" py={6}>
                            <CircularProgress color="secondary" />
                        </Stack>
                    )}

                    {!loading && (
                        <MotionFadeInUp>
                            <Grid container spacing={4} alignItems="flex-start">
                                <Grid size={{ xs: 12, lg: 8 }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                                        {t('pricing.wizard.chooseTitle')}
                                    </Typography>
                                    {!sectors.length && <Alert severity="info" sx={{ mb: 2 }}>{t('pricing.sectorCarousel.empty')}</Alert>}
                                    <MotionStagger style={{ width: '100%' }}>
                                        <Grid container spacing={2}>
                                            {sectors.map(s => {
                                                const checked = selected.has(s.id)
                                                return (
                                                    <Grid key={s.id} size={{ xs: 12, sm: 6 }}>
                                                        <MotionStaggerItem style={{ height: '100%' }}>
                                                            <Card
                                                                variant="outlined"
                                                                onClick={() => toggleSector(s.id)}
                                                                sx={{
                                                                    p: 2,
                                                                    height: '100%',
                                                                    cursor: 'pointer',
                                                                    borderColor: checked ? 'secondary.main' : 'divider',
                                                                    bgcolor: checked ? 'rgba(25,127,148,0.04)' : 'background.paper',
                                                                    transition: 'border-color 0.2s, background 0.2s',
                                                                }}
                                                            >
                                                                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                                    <Checkbox checked={checked} tabIndex={-1} disableRipple sx={{ p: 0, mt: 0.25 }} />
                                                                    {s.icon_image_url ? (
                                                                        <Avatar src={s.icon_image_url} alt="" variant="rounded" sx={{ width: 48, height: 48 }} />
                                                                    ) : (
                                                                        <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: 'rgba(25,127,148,0.12)', color: 'secondary.main' }}>
                                                                            <span className="material-symbols-outlined">category</span>
                                                                        </Avatar>
                                                                    )}
                                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                        <Typography fontWeight={800}>{s.name}</Typography>
                                                                        <Typography variant="body2" color="secondary.main" fontWeight={700}>
                                                                            {formatPriceFromCents(s.subscription_price_cents, s.currency || 'DZD')}
                                                                            <Typography component="span" variant="caption" color="text.secondary">
                                                                                {' '}
                                                                                {t('pricing.sectorCarousel.perMonth')}
                                                                            </Typography>
                                                                        </Typography>
                                                                        {s.description && (
                                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.5 }}>
                                                                                {s.description}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </Stack>
                                                            </Card>
                                                        </MotionStaggerItem>
                                                    </Grid>
                                                )
                                            })}
                                        </Grid>
                                    </MotionStagger>
                                </Grid>
                                <Grid size={{ xs: 12, lg: 4 }}>
                                    <PricingSummaryCard
                                        t={t}
                                        selectedSectors={selectedSectors}
                                        totalCents={totalCents}
                                        currency={currency}
                                        onCheckout={goCheckout}
                                    />
                                </Grid>
                            </Grid>
                        </MotionFadeInUp>
                    )}
                </Container>

                {!loading && (
                    <Box sx={{ py: 8, px: 2 }}>
                        <Container maxWidth="md">
                            <MotionInView>
                                <Box
                                    className="shimmer-border"
                                    sx={{
                                        bgcolor: 'primary.main',
                                        borderRadius: 6,
                                        p: { xs: 4, md: 6 },
                                        textAlign: 'center',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
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
                            </MotionInView>
                        </Container>
                    </Box>
                )}
            </Box>
            <Footer />
        </Box>
    )
}

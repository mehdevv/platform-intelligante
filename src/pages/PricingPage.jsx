import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Chip from '@mui/material/Chip'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function PricingPage() {
    const { t, i18n } = useTranslation()
    const [annual, setAnnual] = useState(true)

    const plans = useMemo(() => {
        const v = t('pricingPage.plans', { returnObjects: true })
        return Array.isArray(v) ? v : []
    }, [t, i18n.language])

    const faqs = useMemo(() => {
        const v = t('pricingPage.faqs', { returnObjects: true })
        return Array.isArray(v) ? v : []
    }, [t, i18n.language])

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ pt: '72px' }}>
                <Box className="page-hero-slant section-fade-in" sx={{ py: { xs: 8, md: 12 }, px: 2, background: 'linear-gradient(180deg, #fff 0%, #EBECF1 100%)' }}>
                    <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ mb: 3, fontSize: { xs: '2rem', md: '3.5rem' }, fontFamily: '"League Spartan", sans-serif', fontWeight: 800 }}>{t('pricingPage.heroTitle')}</Typography>
                        <Typography component="p" color="text.secondary" className="typography-premium-small" sx={{ mb: 5, maxWidth: 640, mx: 'auto' }}>{t('pricingPage.heroSub')}</Typography>
                        <Stack direction="row" alignItems="center" justifyContent="center" gap={2} sx={{ mb: 6 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: annual ? 'text.secondary' : 'text.primary' }}>{t('common.monthly')}</Typography>
                            <Switch checked={annual} onChange={() => setAnnual(!annual)} color="primary" />
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: annual ? 'text.primary' : 'text.secondary' }}>{t('common.annual')}</Typography>
                                <Chip label={t('common.savePct')} size="small" sx={{ bgcolor: 'rgba(25,127,148,0.12)', color: 'secondary.main' }} />
                            </Stack>
                        </Stack>
                    </Container>
                    <Container maxWidth="lg">
                        <Grid container spacing={4} alignItems="stretch">
                            {plans.map(plan => (
                                <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
                                    <Card className="card-lift" sx={{
                                        p: 4, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
                                        overflow: 'visible',
                                        ...(plan.popular && { border: '2px solid', borderColor: 'primary.main', transform: { md: 'scale(1.05)' }, zIndex: 10, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', mt: 2 }),
                                    }}>
                                        {plan.popular && (
                                            <Chip label={t('home.mostPopularChip')} size="small" color="secondary" sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }} />
                                        )}
                                        <Box sx={{ mb: 4 }}>
                                            <Typography variant="h5" sx={{ mb: 1 }}>{plan.name}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{plan.desc}</Typography>
                                            <Typography variant="h3" sx={{ fontSize: '2.25rem' }}>
                                                {plan.priceMonthly != null ? (
                                                    <>
                                                        {annual ? plan.priceAnnual : plan.priceMonthly}
                                                        <Typography component="span" color="text.secondary" sx={{ fontSize: '1rem', ml: 1 }}>/month</Typography>
                                                    </>
                                                ) : (
                                                    <>
                                                        {plan.price}
                                                        {!['Custom', 'Sur mesure'].includes(plan.price) && !String(plan.price).match(/^[$€]?0/) && (
                                                            <Typography component="span" color="text.secondary" sx={{ fontSize: '1rem', ml: 1 }}>/month</Typography>
                                                        )}
                                                    </>
                                                )}
                                            </Typography>
                                        </Box>
                                        <Stack spacing={2} sx={{ mb: 5, flexGrow: 1 }}>
                                            {plan.features?.map(f => (
                                                <Stack key={f} direction="row" gap={1.5} alignItems="flex-start">
                                                    <CheckCircleIcon sx={{ fontSize: 18, color: 'primary.main', mt: 0.3 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: plan.popular ? 600 : 400 }}>{f}</Typography>
                                                </Stack>
                                            ))}
                                            {plan.blocked?.map(f => (
                                                <Stack key={f} direction="row" gap={1.5} alignItems="flex-start" sx={{ opacity: 0.5 }}>
                                                    <BlockIcon sx={{ fontSize: 18, mt: 0.3 }} />
                                                    <Typography variant="body2">{f}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                        {plan.ctaColor === 'inherit' ? (
                                            <Button component={Link} to="/#corporate" fullWidth variant={plan.ctaVariant || 'outlined'} sx={{ py: 1.5, bgcolor: '#1a2332', color: '#fff', '&:hover': { bgcolor: '#2d3d52' } }}>
                                                {plan.cta}
                                            </Button>
                                        ) : (
                                            <Button component={Link} to={`/checkout?plan=${encodeURIComponent(plan.name)}`} fullWidth variant={plan.ctaVariant || 'contained'} color="primary" sx={{ py: 1.5 }}>
                                                {plan.cta}
                                            </Button>
                                        )}
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
                    <Container maxWidth="sm">
                        <Typography variant="h4" textAlign="center" sx={{ mb: 6, fontFamily: '"League Spartan", sans-serif', fontWeight: 800 }}>{t('pricingPage.faqTitle')}</Typography>
                        <Stack spacing={2}>
                            {faqs.map((faq, i) => (
                                <Accordion key={i} elevation={0} sx={{ border: '1px solid #dde1e9', '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle2">{faq.q}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" color="text.secondary">{faq.a}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>
                    </Container>
                </Box>

                <Box sx={{ py: 10, px: 2 }}>
                    <Container maxWidth="md">
                        <Box className="shimmer-border" sx={{ bgcolor: 'primary.main', borderRadius: 6, p: { xs: 4, md: 8 }, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: -48, right: -48, width: 256, height: 256, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(48px)' }} />
                            <Box sx={{ position: 'absolute', bottom: -48, left: -48, width: 256, height: 256, bgcolor: 'rgba(64,130,141,0.35)', borderRadius: '50%', filter: 'blur(48px)' }} />
                            <Typography variant="h3" sx={{ color: '#fff', mb: 3, position: 'relative', zIndex: 10, fontSize: { xs: '1.75rem', md: '2.5rem' }, fontFamily: '"League Spartan", sans-serif', fontWeight: 800 }}>{t('pricingPage.ctaTitle')}</Typography>
                            <Typography sx={{ color: 'rgba(225,244,247,0.95)', mb: 5, fontSize: '1.125rem', position: 'relative', zIndex: 10 }}>{t('pricingPage.ctaSub')}</Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" gap={2} sx={{ position: 'relative', zIndex: 10 }}>
                                <Button component={Link} to="/signup" variant="contained" color="secondary" size="large" sx={{ px: 5 }} className="btn-shimmer">{t('pricingPage.trial')}</Button>
                                <Button component={Link} to="/reports" variant="outlined" size="large" sx={{ px: 5, color: '#fff', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>{t('pricingPage.demo')}</Button>
                            </Stack>
                        </Box>
                    </Container>
                </Box>
            </Box>
            <Footer />
        </Box>
    )
}

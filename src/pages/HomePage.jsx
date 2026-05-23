import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Tooltip from '@mui/material/Tooltip'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { FeaturedReportCard } from '../components/home/HomeMarketCards'
import HomeHero from '../components/home/HomeHero'
import HomeInsightsHighlight from '../components/home/HomeInsightsHighlight'
import SectorsCarousel from '../components/home/SectorsCarousel'
import {
    MotionFadeInUp,
    MotionInView,
    MotionRevealLeft,
    MotionRevealRight,
    MotionStagger,
    MotionStaggerItem,
} from '../components/motion/Motion'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { homeImagery } from '../constants/homeImagery'
import { clampConfidencePct, suggestSample } from '../lib/sampleSize'
import { fetchPopularReportsBySales } from '../lib/popularReports'
import { reportPublicPath } from '../lib/reportPath'
import { submitCorporateMessage } from '../lib/corporateMessage'

// ─── Component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
    const { t, i18n } = useTranslation()
    const { supabase } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [population, setPopulation] = useState(100000)
    const [confidence, setConfidence] = useState(95)
    const [margin, setMargin] = useState(5)
    const [sampleResult, setSampleResult] = useState(null)

    useEffect(() => {
        const n = suggestSample(population || 0, confidence, margin || 5)
        setSampleResult(n)
    }, [population, confidence, margin])

    useEffect(() => {
        const id = (location.hash || '').replace(/^#/, '')
        if (!id) return
        const el = document.getElementById(id)
        if (el) queueMicrotask(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }, [location.hash, location.pathname])

    const localePopularFallback = useMemo(() => {
        const v = t('home.popularTags', { returnObjects: true })
        return Array.isArray(v) ? v : []
    }, [t, i18n.language])
    const [popularReports, setPopularReports] = useState([])
    const [publishedSectors, setPublishedSectors] = useState([])
    const [sectorReportCounts, setSectorReportCounts] = useState({})
    const [featuredReports, setFeaturedReports] = useState([])
    const [catalogLoading, setCatalogLoading] = useState(true)
    const [corporateForm, setCorporateForm] = useState({ name: '', email: '', subject: '', body: '' })
    const [corporateSubmitting, setCorporateSubmitting] = useState(false)
    const [corporateNotice, setCorporateNotice] = useState(null)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase) return
            try {
                const list = await fetchPopularReportsBySales(supabase, localePopularFallback)
                if (!cancelled) setPopularReports(list)
            } catch {
                if (!cancelled) {
                    setPopularReports(
                        localePopularFallback.map((label, i) => ({
                            id: `fallback-${i}`,
                            slug: '',
                            title: label,
                            salesCount: 0,
                            href: '/reports',
                        })),
                    )
                }
            }
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, localePopularFallback])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase) {
                setCatalogLoading(false)
                return
            }
            setCatalogLoading(true)
            const [sectorsRes, reportsRes, countsRes] = await Promise.all([
                supabase.from('sectors').select('id, slug, name, icon_image_url').eq('is_published', true).order('sort_order').order('name'),
                supabase
                    .from('reports')
                    .select('id, slug, title, summary, price_cents, currency, thumbnail_image_url, published_at, sectors:sector_id(name)')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
                    .limit(3),
                supabase.from('reports').select('sector_id').eq('status', 'published'),
            ])
            if (cancelled) return
            setPublishedSectors(sectorsRes.data || [])
            setFeaturedReports(reportsRes.data || [])
            const counts = {}
            for (const row of countsRes.data || []) {
                if (row.sector_id) counts[row.sector_id] = (counts[row.sector_id] || 0) + 1
            }
            setSectorReportCounts(counts)
            setCatalogLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase])

    const pricingPlans = useMemo(() => {
        const v = t('home.pricingPlans', { returnObjects: true })
        return Array.isArray(v) ? v : []
    }, [t, i18n.language])
    const sideReports = useMemo(() => {
        const v = t('home.sideReports', { returnObjects: true })
        return Array.isArray(v) ? v : []
    }, [t, i18n.language])
    return (
        <Box sx={{ bgcolor: 'background.paper' }}>
            <Header />
            <Box component="main" sx={{ pt: 0 }}>

                <HomeHero t={t} searchPlaceholder={t('home.searchPlaceholder')} popularReports={popularReports} />

                {/* ═══ FEATURED REPORTS (latest published) ═══════════════════ */}
                <Box
                    sx={{
                        py: { xs: 8, md: 11 },
                        background: 'linear-gradient(180deg, #f0f1f5 0%, #e8eaef 100%)',
                    }}
                >
                    <Container maxWidth="lg">
                        <MotionInView>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 6 }} gap={2}>
                            <Box>
                                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>{t('home.trendingNow')}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, fontFamily: '"League Spartan", sans-serif' }}>{t('home.featuredReportsTitle')}</Typography>
                                <Typography color="text.secondary" sx={{ mt: 0.5 }}>{t('home.featuredReportsSub')}</Typography>
                            </Box>
                            <Button component={Link} to="/reports" endIcon={<ArrowRightAltIcon />} sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>{t('home.viewAllReports')}</Button>
                        </Stack>
                        </MotionInView>

                        {catalogLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                <CircularProgress color="secondary" />
                            </Box>
                        )}
                        {!catalogLoading && !featuredReports.length && (
                            <Alert severity="info">{t('home.featuredReportsEmpty')}</Alert>
                        )}
                        {!catalogLoading && featuredReports.length > 0 && (
                        <MotionStagger style={{ width: '100%' }}>
                        <Grid container spacing={4}>
                            {featuredReports.map(report => (
                                <Grid key={report.id} size={{ xs: 12, md: 4 }}>
                                    <MotionStaggerItem style={{ height: '100%' }}>
                                        <FeaturedReportCard report={report} />
                                    </MotionStaggerItem>
                                </Grid>
                            ))}
                        </Grid>
                        </MotionStagger>
                        )}
                    </Container>
                </Box>

                {/* ═══ PUBLISHED SECTORS (carousel) ═══ */}
                <Box
                    component="section"
                    aria-labelledby="explore-topics-heading"
                    sx={{
                        bgcolor: '#f8fafc',
                        py: { xs: 6, md: 8 },
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Container maxWidth="lg">
                        <MotionInView>
                        <Box
                            sx={{
                                maxWidth: 720,
                                mx: 'auto',
                                px: { xs: 1.5, sm: 2 },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                mb: { xs: 4, md: 5 },
                            }}
                        >
                            <Box
                                aria-hidden
                                sx={{ width: 40, height: 4, bgcolor: 'secondary.main', borderRadius: 1, mb: 2 }}
                            />
                            <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.14em' }}>
                                {t('home.categories')}
                            </Typography>
                            <Typography
                                id="explore-topics-heading"
                                variant="h4"
                                sx={{ fontWeight: 800, mt: 1, lineHeight: 1.15, fontFamily: '"League Spartan", sans-serif', maxWidth: 640 }}
                            >
                                {t('home.exploreTopicsTitle')}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mt: 1.5, mb: 0, lineHeight: 1.75, maxWidth: 560, mx: 'auto' }}
                            >
                                {t('home.exploreTopicsSub')}
                            </Typography>
                        </Box>
                        </MotionInView>
                    </Container>

                    <SectorsCarousel
                        sectors={publishedSectors}
                        reportCounts={sectorReportCounts}
                        loading={catalogLoading}
                    />

                    <MotionFadeInUp>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4, md: 6 } }}>
                        <Button
                            component={Link}
                            to="/sectors"
                            variant="contained"
                            color="secondary"
                            endIcon={<ArrowForwardIcon />}
                            disableElevation
                            sx={{ fontWeight: 700, px: 4, py: 1.25, borderRadius: 2 }}
                        >
                            {t('home.viewAllSectors')}
                        </Button>
                    </Box>
                    </MotionFadeInUp>
                </Box>

                <HomeInsightsHighlight
                    sideReports={sideReports}
                    featuredHref={featuredReports[0] ? reportPublicPath(featuredReports[0]) : '/reports'}
                />

                {/* ═══ PRICING PLANS ═══════════════════════════════════════════ */}
                <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 11 } }}>
                    <Container maxWidth="lg">
                        <MotionInView>
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>{t('home.pricingOverline')}</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, mb: 1.5, fontFamily: '"League Spartan", sans-serif' }}>{t('home.choosePlan')}</Typography>
                            <Typography color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>{t('home.pricingSub')}</Typography>
                        </Box>
                        </MotionInView>
                        <MotionStagger style={{ width: '100%' }}>
                        <Grid container spacing={4} alignItems="stretch">
                            {pricingPlans.map((plan, i) => (
                                <Grid key={i} size={{ xs: 12, md: 4 }}>
                                    <MotionStaggerItem style={{ height: '100%' }}>
                                    <Card
                                        component={motion.div}
                                        whileHover={{ y: -6, transition: { type: 'spring', stiffness: 280, damping: 22 } }}
                                        sx={{
                                            p: 4,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            overflow: 'visible',
                                            borderRadius: 3,
                                            border: '1px solid',
                                            borderColor: plan.highlight ? 'secondary.main' : 'divider',
                                            boxShadow: plan.highlight ? '0 12px 40px rgba(25, 127, 148, 0.12)' : '0 4px 24px rgba(15, 23, 42, 0.05)',
                                            ...(plan.highlight === true && { mt: 2 }),
                                        }}
                                    >
                                        {plan.highlight === true && (
                                            <Chip label={t('home.mostPopularChip')} size="small" color="primary"
                                                sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 700, px: 1 }} />
                                        )}
                                        <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.12em', color: plan.highlight === true ? 'primary.main' : 'text.secondary' }}>{plan.name}</Typography>
                                        <Stack direction="row" alignItems="baseline" gap={0.5} sx={{ mb: 0.5, mt: 1 }}>
                                            <Typography sx={{ fontWeight: 900, fontSize: '2.25rem', color: 'text.primary', lineHeight: 1 }}>{plan.price}</Typography>
                                            <Typography variant="body2" color="text.secondary">{plan.per}</Typography>
                                        </Stack>
                                        <Divider sx={{ my: 3 }} />
                                        <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 4 }}>
                                            {plan.features.map((f, j) => (
                                                <Stack key={j} direction="row" alignItems="center" gap={1.5}>
                                                    <CheckCircleIcon sx={{ fontSize: 18, color: plan.highlight === true ? 'primary.main' : 'success.main', flexShrink: 0 }} />
                                                    <Typography variant="body2" color="text.secondary">{f}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                        <Button
                                            component={Link}
                                            to={plan.link || '/pricing'}
                                            variant={plan.variant}
                                            color={plan.highlight ? 'secondary' : 'primary'}
                                            fullWidth
                                            size="large"
                                            sx={{ fontWeight: 700, py: 1.5 }}
                                            disableElevation
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Card>
                                    </MotionStaggerItem>
                                </Grid>
                            ))}
                        </Grid>
                        </MotionStagger>
                    </Container>
                </Box>

                {/* ═══ TRUST + CTA BANNER ══════════════════════════════════════ */}
                <Box sx={{ position: 'relative', py: { xs: 9, md: 12 }, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `linear-gradient(105deg, rgba(26,35,50,0.92) 0%, rgba(26,35,50,0.88) 45%, rgba(15,23,42,0.85) 100%), url(${homeImagery.trust})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                    <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <MotionInView>
                        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, mb: 2.5, fontSize: { xs: '1.75rem', md: '2.5rem' }, fontFamily: '"League Spartan", sans-serif' }}>
                            {t('home.trustTitle')}
                        </Typography>
                        <Typography sx={{ color: '#cbd5e1', fontSize: '1.0625rem', mb: 5, lineHeight: 1.75, maxWidth: 520, mx: 'auto' }}>
                            {t('home.trustSub')}
                        </Typography>
                        </MotionInView>
                        <MotionFadeInUp delay={0.15}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" gap={2}>
                            <Button component={Link} to="/pricing" variant="contained" color="secondary" size="large" sx={{ px: 6, py: 1.75, fontWeight: 700, fontSize: '1rem', borderRadius: 2 }} disableElevation>
                                {t('home.startTrial')}
                            </Button>
                            <Button component={Link} to="/reports" variant="outlined" size="large"
                                sx={{ px: 6, py: 1.75, fontWeight: 700, fontSize: '1rem', borderRadius: 2, color: '#fff', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.4)' } }}>
                                {t('home.browseData')}
                            </Button>
                        </Stack>
                        </MotionFadeInUp>
                    </Container>
                </Box>

                {/* ═══ METHODOLOGY ═════════════════════════════════════════════ */}
                <Box
                    component="section"
                    sx={{
                        bgcolor: '#f8fafc',
                        py: { xs: 6, md: 8 },
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Container maxWidth="lg">
                        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
                            <Grid size={{ xs: 12, md: 5 }}>
                                <MotionRevealLeft>
                                <Box id="methodology" sx={{ scrollMarginTop: '88px', width: '100%' }}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>
                                            {t('home.categories')}
                                        </Typography>
                                        <Typography
                                            id="home-methodology-strip-title"
                                            variant="h4"
                                            sx={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 800, color: 'text.primary', mt: 0.5, mb: 1.5, lineHeight: 1.15 }}
                                        >
                                            {t('methodology.title')}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                                            {t('home.methodologyStripHint')}
                                        </Typography>
                                    </Box>
                                </Box>
                                </MotionRevealLeft>
                            </Grid>
                            <Grid size={{ xs: 12, md: 7 }}>
                                <MotionRevealRight delay={0.08}>
                                <Paper
                                    component={motion.div}
                                    elevation={0}
                                    sx={{
                                        p: { xs: 3, md: 4 },
                                        borderRadius: 3,
                                        bgcolor: '#fff',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: '0 8px 32px rgba(25, 127, 148, 0.08)',
                                    }}
                                >
                                    <Grid container spacing={4}>
                                        <Grid size={{ xs: 12, sm: 7 }}>
                                            <Stack spacing={3.5}>
                                                <Box>
                                                    <Stack direction="row" justifyContent="space-between" mb={1}>
                                                        <Typography variant="subtitle2" fontWeight={700}>{t('methodology.population')}</Typography>
                                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>{population.toLocaleString()}</Typography>
                                                    </Stack>
                                                    <Slider
                                                        value={population}
                                                        onChange={(e, val) => setPopulation(val)}
                                                        min={100}
                                                        max={1000000}
                                                        step={100}
                                                        color="secondary"
                                                        valueLabelDisplay="off"
                                                    />
                                                </Box>

                                                <Box>
                                                    <Stack direction="row" justifyContent="space-between" mb={1}>
                                                        <Typography variant="subtitle2" fontWeight={700}>{t('methodology.margin')}</Typography>
                                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>{margin}%</Typography>
                                                    </Stack>
                                                    <Slider
                                                        value={margin}
                                                        onChange={(e, val) => setMargin(val)}
                                                        min={1}
                                                        max={10}
                                                        step={0.5}
                                                        color="secondary"
                                                        valueLabelDisplay="off"
                                                    />
                                                </Box>

                                                <Box>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} gap={1}>
                                                        <Typography variant="subtitle2" fontWeight={700}>{t('methodology.confidence')}</Typography>
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={confidence}
                                                            onChange={e => setConfidence(clampConfidencePct(e.target.value))}
                                                            slotProps={{
                                                                htmlInput: { min: 1, max: 99.99, step: 0.1 },
                                                                input: {
                                                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                                },
                                                            }}
                                                            sx={{ width: 100, '& input': { textAlign: 'right', fontWeight: 600 } }}
                                                        />
                                                    </Stack>
                                                    <Slider
                                                        value={confidence}
                                                        onChange={(e, val) => setConfidence(clampConfidencePct(val))}
                                                        min={50}
                                                        max={99.9}
                                                        step={0.1}
                                                        color="secondary"
                                                        valueLabelDisplay="off"
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {t('methodology.confidenceHint')}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 5 }}>
                                            <Box
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    p: 3,
                                                    borderRadius: 2,
                                                    bgcolor: '#f8fafc',
                                                    border: '1px solid',
                                                    borderColor: 'rgba(25, 127, 148, 0.15)',
                                                    boxShadow: '0 8px 32px rgba(25, 127, 148, 0.05)',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <Typography variant="overline" color="secondary.main" sx={{ fontWeight: 800, letterSpacing: '0.1em', mb: 1 }}>
                                                    {t('methodology.result')}
                                                </Typography>
                                                <Box
                                                    component={motion.div}
                                                    key={sampleResult}
                                                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                                                >
                                                    <Typography
                                                        variant="h2"
                                                        sx={{
                                                            fontWeight: 900,
                                                            color: '#1a2332',
                                                            lineHeight: 1,
                                                            fontFamily: '"League Spartan", sans-serif',
                                                            mb: 1.5,
                                                        }}
                                                    >
                                                        {sampleResult?.toLocaleString() || 0}
                                                    </Typography>
                                                </Box>
                                                
                                                <Chip 
                                                    icon={<InfoOutlinedIcon sx={{ fontSize: '16px !important' }}/>} 
                                                    label={margin <= 3 ? "High Precision" : margin <= 5 ? "Standard Precision" : "Estimate"} 
                                                    size="small"
                                                    color={margin <= 3 ? "success" : margin <= 5 ? "primary" : "default"}
                                                    variant="outlined"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                                </MotionRevealRight>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* ═══ CORPORATE ══════════════════════════════════════════════ */}
                <Box
                    component="section"
                    sx={{
                        bgcolor: '#1a2332',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        py: { xs: 4, md: 5 },
                    }}
                >
                    <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
                        <Box id="corporate" sx={{ scrollMarginTop: '88px' }}>
                            <Grid container spacing={{ xs: 4, md: 8 }} alignItems="stretch">
                                <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                                    <MotionRevealLeft style={{ flex: 1, display: 'flex', minHeight: 0, width: '100%' }}>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            minHeight: { xs: 300, md: 0 },
                                            width: '100%',
                                        }}
                                    >
                                        <Box
                                            component={motion.img}
                                            src="/contact.png"
                                            alt="Contact Us"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                flex: 1,
                                                objectFit: 'cover',
                                                borderRadius: 3,
                                                display: 'block',
                                                boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                                            }}
                                        />
                                    </Box>
                                    </MotionRevealLeft>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                                    <MotionRevealRight delay={0.1} style={{ flex: 1, display: 'flex', width: '100%' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1 }}>
                                        <Typography
                                            id="home-corporate-heading"
                                            variant="h4"
                                            sx={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 800, color: '#fff', mb: 1, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
                                        >
                                            {t('corporate.title')}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(226,232,240,0.85)', mb: 4, lineHeight: 1.65 }}>
                                            {t('corporate.subtitle')}
                                        </Typography>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: { xs: 3, md: 4 },
                                                borderRadius: 3,
                                                bgcolor: '#fff',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <Stack
                                                spacing={2.5}
                                                component="form"
                                                onSubmit={async e => {
                                                    e.preventDefault()
                                                    if (!supabase || corporateSubmitting) return
                                                    setCorporateNotice(null)
                                                    setCorporateSubmitting(true)
                                                    try {
                                                        await submitCorporateMessage(supabase, corporateForm)
                                                        setCorporateForm({ name: '', email: '', subject: '', body: '' })
                                                        setCorporateNotice({ severity: 'success', text: t('corporate.sentSuccess') })
                                                    } catch (err) {
                                                        const code = err?.code || err?.message
                                                        const text =
                                                            code === 'invalid_email' || code === 'email'
                                                                ? t('corporate.invalidEmail')
                                                                : code === 'missing_fields' || code === 'missing'
                                                                  ? t('corporate.fillAll')
                                                                  : t('corporate.sentError')
                                                        setCorporateNotice({ severity: 'error', text })
                                                    } finally {
                                                        setCorporateSubmitting(false)
                                                    }
                                                }}
                                            >
                                                {corporateNotice && (
                                                    <Alert severity={corporateNotice.severity} onClose={() => setCorporateNotice(null)}>
                                                        {corporateNotice.text}
                                                    </Alert>
                                                )}
                                                <TextField
                                                    label={t('corporate.name')}
                                                    name="name"
                                                    autoComplete="name"
                                                    fullWidth
                                                    required
                                                    value={corporateForm.name}
                                                    onChange={ev => setCorporateForm(f => ({ ...f, name: ev.target.value }))}
                                                />
                                                <TextField
                                                    label={t('corporate.email')}
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    fullWidth
                                                    required
                                                    value={corporateForm.email}
                                                    onChange={ev => setCorporateForm(f => ({ ...f, email: ev.target.value }))}
                                                />
                                                <TextField
                                                    label={t('corporate.subject')}
                                                    name="subject"
                                                    fullWidth
                                                    required
                                                    value={corporateForm.subject}
                                                    onChange={ev => setCorporateForm(f => ({ ...f, subject: ev.target.value }))}
                                                />
                                                <TextField
                                                    label={t('corporate.body')}
                                                    name="body"
                                                    multiline
                                                    rows={4}
                                                    fullWidth
                                                    required
                                                    value={corporateForm.body}
                                                    onChange={ev => setCorporateForm(f => ({ ...f, body: ev.target.value }))}
                                                />
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    color="secondary"
                                                    disableElevation
                                                    fullWidth
                                                    size="large"
                                                    disabled={corporateSubmitting || !supabase}
                                                    sx={{ fontWeight: 700, py: 1.5, mt: 1 }}
                                                >
                                                    {corporateSubmitting ? t('corporate.sending') : t('corporate.send')}
                                                </Button>
                                            </Stack>
                                        </Paper>
                                    </Box>
                                    </MotionRevealRight>
                                </Grid>
                            </Grid>
                        </Box>
                    </Container>
                </Box>

            </Box>
            <Footer />
        </Box>
    )
}

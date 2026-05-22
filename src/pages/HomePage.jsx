import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Tooltip from '@mui/material/Tooltip'
import SearchIcon from '@mui/icons-material/Search'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Header from '../components/Header'
import Footer from '../components/Footer'
import DotPattern from '../components/DotPattern'
import { homeImagery } from '../constants/homeImagery'

// ─── Mini bar chart used inside stat cards ───────────────────────────────────
function MiniBarChart({ bars = [40, 65, 90, 50, 35, 70, 55], color = '#4B5B72' }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 72 }}>
            {bars.map((h, i) => (
                <Box key={i} sx={{ flex: 1, bgcolor: color, opacity: 0.15 + (h / 100) * 0.85, borderRadius: '3px 3px 0 0', height: `${h}%`, transition: 'height 0.3s' }} />
            ))}
        </Box>
    )
}

// ─── Mini horizontal bar chart ────────────────────────────────────────────────
function MiniHBarChart({ rows }) {
    return (
        <Stack spacing={0.8}>
            {rows.map((r, i) => (
                <Stack key={i} direction="row" alignItems="center" gap={1}>
                    <Typography variant="caption" sx={{ width: 80, fontSize: '0.65rem', color: 'text.secondary', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</Typography>
                    <LinearProgress variant="determinate" value={r.pct} sx={{ flex: 1, height: 8, borderRadius: 1, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: r.color || '#4B5B72', borderRadius: 1 } }} />
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, width: 32, textAlign: 'right' }}>{r.pct}%</Typography>
                </Stack>
            ))}
        </Stack>
    )
}

const infographicBars = [
    { label: 'United States', pct: 87, color: '#4B5B72' },
    { label: 'Germany', pct: 72, color: '#3d5668' },
    { label: 'United Kingdom', pct: 68, color: '#197F94' },
    { label: 'France', pct: 61, color: '#3d8a9a' },
    { label: 'Japan', pct: 55, color: '#6b9faf' },
]

function suggestSample(population, confidencePct, marginPct) {
    const z = confidencePct >= 99 ? 2.576 : confidencePct >= 95 ? 1.96 : 1.645
    const p = 0.5
    const e = marginPct / 100
    if (!population || population <= 0) {
        return Math.ceil((z * z * p * (1 - p)) / (e * e))
    }
    const num = population * z * z * p * (1 - p)
    const den = e * e * (population - 1) + z * z * p * (1 - p)
    return Math.max(1, Math.ceil(num / den))
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const [heroSearch, setHeroSearch] = useState('')
    const [population, setPopulation] = useState(100000)
    const [confidence, setConfidence] = useState(95)
    const [margin, setMargin] = useState(5)
    const [sampleResult, setSampleResult] = useState(null)

    const confidenceLevels = useMemo(
        () => [
            { value: 90, label: '90%' },
            { value: 95, label: '95%' },
            { value: 99, label: '99%' },
        ],
        [],
    )

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

    const popularTags = useMemo(() => {
        const v = t('home.popularTags', { returnObjects: true })
        return Array.isArray(v) ? v : []
    }, [t, i18n.language])
    const featuredStats = useMemo(() => {
        const v = t('home.featuredStats', { returnObjects: true })
        return Array.isArray(v) ? v : []
    }, [t, i18n.language])
    const topics = useMemo(() => {
        const v = t('home.topics', { returnObjects: true })
        return Array.isArray(v) ? v : []
    }, [t, i18n.language])
    const topicsScrollRef = useRef(null)
    const [topicsCarouselScroll, setTopicsCarouselScroll] = useState({ canLeft: false, canRight: true })

    const syncTopicsCarouselScroll = () => {
        const el = topicsScrollRef.current
        if (!el) return
        const { scrollLeft, scrollWidth, clientWidth } = el
        setTopicsCarouselScroll({
            canLeft: scrollLeft > 6,
            canRight: scrollLeft < scrollWidth - clientWidth - 6,
        })
    }

    const scrollTopicsCarousel = dir => {
        const el = topicsScrollRef.current
        if (!el) return
        el.scrollBy({ left: dir * Math.min(320, el.clientWidth * 0.75), behavior: 'smooth' })
    }

    useEffect(() => {
        syncTopicsCarouselScroll()
        const onResize = () => syncTopicsCarouselScroll()
        window.addEventListener('resize', onResize, { passive: true })
        const id = requestAnimationFrame(syncTopicsCarouselScroll)
        return () => {
            window.removeEventListener('resize', onResize)
            cancelAnimationFrame(id)
        }
    }, [topics])

    const pricingPlans = useMemo(() => {
        const v = t('home.pricingPlans', { returnObjects: true })
        return Array.isArray(v) ? v : []
    }, [t, i18n.language])
    const sideReports = useMemo(() => {
        const v = t('home.sideReports', { returnObjects: true })
        return Array.isArray(v) ? v : []
    }, [t, i18n.language])
    const platformFeatures = useMemo(() => [t('home.platformF1'), t('home.platformF2'), t('home.platformF3'), t('home.platformF4')], [t, i18n.language])

    const runHeroSearch = () => {
        const q = heroSearch.trim()
        if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
    }

    return (
        <Box sx={{ bgcolor: 'background.paper' }}>
            <Header />
            <Box component="main" sx={{ pt: 0 }}>

                {/* ═══ HERO (full bleed under fixed header; inner pad clears toolbar) ═══ */}
                <Box
                    sx={{
                        bgcolor: '#1a2332',
                        borderBottom: '3px solid',
                        borderColor: 'secondary.main',
                        position: 'relative',
                        overflowX: 'hidden',
                    }}
                >
                    <DotPattern
                        variant="hero"
                        className="z-0"
                        baseColor="#4d5d78"
                        glowColor="#22d3ee"
                        dotSize={2}
                        gap={22}
                        proximity={100}
                        waveSpeed={0.45}
                        vignette="navy"
                    />
                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            minHeight: '100vh',
                            boxSizing: 'border-box',
                            display: 'flex',
                            alignItems: 'center',
                            pt: { xs: 'calc(64px + 32px)', md: 'calc(64px + 48px)' },
                            pb: { xs: 4, md: 6 },
                        }}
                    >
                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, width: '100%' }} className="section-fade-in">
                        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
                            <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography
                                    variant="h1"
                                    sx={{
                                        color: '#fff',
                                        fontSize: { xs: '2.125rem', sm: '2.75rem', md: '3.25rem' },
                                        fontWeight: 800,
                                        lineHeight: 1.08,
                                        mb: 1.5,
                                        fontFamily: '"League Spartan", sans-serif',
                                    }}
                                    className="animate-hero-line"
                                >
                                    {t('home.heroLine1')}
                                </Typography>
                                <Typography
                                    variant="h1"
                                    sx={{
                                        color: '#22d3ee',
                                        fontSize: { xs: '2.125rem', sm: '2.75rem', md: '3.25rem' },
                                        fontWeight: 800,
                                        lineHeight: 1.08,
                                        mb: 3,
                                        fontFamily: '"League Spartan", sans-serif',
                                    }}
                                    className="animate-hero-line delay-1"
                                >
                                    {t('home.heroLine2')}
                                </Typography>
                                <Typography
                                    component="p"
                                    className="typography-premium-small"
                                    sx={{
                                        color: 'rgba(226,232,240,0.92)',
                                        mb: 4,
                                        maxWidth: { md: 520 },
                                        mx: { xs: 'auto', md: 0 },
                                        textAlign: { xs: 'center', md: 'left' },
                                    }}
                                >
                                    {t('home.heroSub')}
                                </Typography>

                                <Box
                                    className="hero-search-glow"
                                    sx={{
                                        display: 'flex',
                                        maxWidth: { xs: '100%', md: '100%' },
                                        mx: { xs: 'auto', md: 0 },
                                        bgcolor: '#fff',
                                        borderRadius: 2,
                                        border: '1px solid #cbd5e1',
                                        overflow: 'hidden',
                                        mb: 3,
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        value={heroSearch}
                                        onChange={e => setHeroSearch(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), runHeroSearch())}
                                        placeholder={t('home.searchPlaceholder')}
                                        variant="standard"
                                        slotProps={{
                                            input: {
                                                disableUnderline: true,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ color: '#64748b', ml: 1 }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={{ px: 1.5, py: 0.5, '& input': { fontSize: '0.9375rem', py: '12px' } }}
                                    />
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        disableElevation
                                        onClick={runHeroSearch}
                                        sx={{ m: 0.75, px: 3, borderRadius: 1.5, fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.875rem' }}
                                    >
                                        {t('common.search')}
                                    </Button>
                                </Box>

                                <Stack direction="row" flexWrap="wrap" justifyContent={{ xs: 'center', md: 'flex-start' }} gap={1} alignItems="center">
                                    <Typography sx={{ color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 600 }}>{t('common.popular')}</Typography>
                                    {popularTags.map(tag => (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            size="small"
                                            component={Link}
                                            to="/reports"
                                            sx={{
                                                color: '#e0f2fe',
                                                borderColor: 'rgba(34,211,238,0.35)',
                                                bgcolor: 'rgba(255,255,255,0.04)',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: 'rgba(34,211,238,0.12)', borderColor: '#22d3ee' },
                                            }}
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box
                                    sx={{
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '2px solid',
                                        borderColor: '#22d3ee',
                                        bgcolor: '#0f172a',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={homeImagery.hero}
                                        alt=""
                                        sx={{
                                            width: '100%',
                                            height: { xs: 'min(42vh, 280px)', sm: 'min(45vh, 360px)', md: 'min(52vh, 520px)' },
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                    </Box>
                </Box>

                {/* ═══ FEATURED STATS ══════════════════════════════════════════ */}
                <Box sx={{ bgcolor: '#EBECF1', py: { xs: 8, md: 11 } }}>
                    <Container maxWidth="lg">
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 6 }} gap={2}>
                            <Box>
                                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>{t('home.trendingNow')}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{t('home.featuredTitle')}</Typography>
                                <Typography color="text.secondary" sx={{ mt: 0.5 }}>{t('home.featuredSub')}</Typography>
                            </Box>
                            <Button component={Link} to="/reports" endIcon={<ArrowRightAltIcon />} sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>{t('home.viewAllStats')}</Button>
                        </Stack>

                        <Grid container spacing={4}>
                            {featuredStats.map((stat, i) => (
                                <Grid key={i} size={{ xs: 12, md: 4 }}>
                                    <Card component={Link} to="/reports/1" className="card-lift" sx={{ textDecoration: 'none', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 0, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 28px rgba(26,35,50,0.08)' } }}>
                                        <Box
                                            component="img"
                                            src={homeImagery.featured[i % homeImagery.featured.length]}
                                            alt=""
                                            sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                                        />
                                        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                                            <Chip label={stat.tag} size="small" sx={{ bgcolor: 'rgba(75,91,114,0.08)', color: 'primary.main', fontWeight: 700 }} />
                                            <Chip label={t(`common.${stat.freeLabelKey}`)} size="small"
                                                sx={{ bgcolor: stat.freeLabelKey === 'premium' ? 'rgba(212,175,55,0.1)' : 'rgba(16,185,129,0.1)', color: stat.freeLabelKey === 'premium' ? '#b8860b' : '#059669', fontWeight: 700 }} />
                                        </Stack>
                                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.55, mb: 3, flexGrow: 1, color: 'text.primary' }}>{stat.title}</Typography>

                                        {/* Chart area */}
                                        <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2, mb: 2 }}>
                                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>{stat.value}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', bgcolor: '#e2e8f0', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.65rem' }}>{stat.unit}</Typography>
                                            </Stack>
                                            <MiniBarChart bars={stat.bars} />
                                        </Box>

                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" alignItems="center" gap={0.5}><ScheduleIcon sx={{ fontSize: 13, color: 'text.secondary' }} /><Typography variant="caption" color="text.secondary">{stat.date}</Typography></Stack>
                                            <Stack direction="row" alignItems="center" gap={0.5}><AnalyticsIcon sx={{ fontSize: 13, color: 'text.secondary' }} /><Typography variant="caption" color="text.secondary">{stat.source}</Typography></Stack>
                                        </Stack>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                {/* ═══ EXPLORE TOPICS & INDUSTRIES (carousel + heading) ═══ */}
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
                    </Container>

                    <Stack
                        direction="row"
                        alignItems="center"
                        sx={{
                            px: 0,
                            gap: { xs: 0, md: 1 },
                        }}
                    >
                        <IconButton
                            type="button"
                            aria-label="Scroll topics left"
                            onClick={() => scrollTopicsCarousel(-1)}
                            disabled={!topicsCarouselScroll.canLeft}
                            sx={{
                                display: { xs: 'none', md: 'inline-flex' },
                                flexShrink: 0,
                                alignSelf: 'center',
                                bgcolor: 'background.paper',
                                boxShadow: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                ml: 2,
                                zIndex: 2,
                                '&:hover': { bgcolor: 'grey.50' },
                            }}
                        >
                            <ChevronLeftIcon />
                        </IconButton>

                        <Box
                            ref={topicsScrollRef}
                            onScroll={syncTopicsCarouselScroll}
                            className="no-scrollbar"
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'stretch',
                                gap: 2,
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                scrollSnapType: 'x mandatory',
                                py: 2,
                                px: { xs: 2, md: 0 },
                                WebkitOverflowScrolling: 'touch',
                            }}
                        >
                            {topics.map((topic, i) => {
                                const src = homeImagery.topicTiles[i % homeImagery.topicTiles.length]
                                return (
                                    <Card
                                        key={`${topic.label}-${i}`}
                                        component={Link}
                                        to="/sectors"
                                        sx={{
                                            flex: '0 0 auto',
                                            scrollSnapAlign: 'start',
                                            width: { xs: 'min(85vw, 300px)', sm: 280, md: 300 },
                                            height: { xs: 320, sm: 340, md: 360 },
                                            position: 'relative',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            p: 0,
                                            overflow: 'hidden',
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            boxSizing: 'border-box',
                                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                                            '&:hover': {
                                                borderColor: 'secondary.main',
                                                boxShadow: '0 12px 32px rgba(25, 127, 148, 0.14)',
                                                transform: 'translateY(-3px)',
                                                '& .topic-carousel-img': { transform: 'scale(1.05)' },
                                            },
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            className="topic-carousel-img"
                                            src={src}
                                            alt=""
                                            sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                                transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                                            }}
                                        />
                                        <Box
                                            aria-hidden
                                            sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0) 38%, rgba(15,23,42,0.55) 85%, rgba(15,23,42,0.88) 100%)',
                                                pointerEvents: 'none',
                                            }}
                                        />
                                        <Stack
                                            direction="row"
                                            alignItems="flex-end"
                                            gap={1.25}
                                            sx={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                p: 2.5,
                                                minWidth: 0,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 1,
                                                    bgcolor: 'rgba(255,255,255,0.18)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    backdropFilter: 'blur(4px)',
                                                }}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#f1f5f9' }}>
                                                    {topic.icon}
                                                </span>
                                            </Box>
                                            <Box sx={{ minWidth: 0, flex: 1, pb: 0.125 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    component="div"
                                                    sx={{
                                                        fontWeight: 800,
                                                        color: '#fff',
                                                        lineHeight: 1.25,
                                                        fontSize: '1.1rem',
                                                        fontFamily: '"League Spartan", sans-serif',
                                                        textShadow: '0 1px 12px rgba(0,0,0,0.35)',
                                                    }}
                                                >
                                                    {topic.label}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    component="div"
                                                    sx={{
                                                        display: 'block',
                                                        mt: 0.35,
                                                        color: 'rgba(226,232,240,0.95)',
                                                        fontWeight: 600,
                                                        fontSize: '0.8rem',
                                                        letterSpacing: '0.03em',
                                                    }}
                                                >
                                                    {topic.count} · {t('common.stats')}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Card>
                                )
                            })}
                        </Box>

                        <IconButton
                            type="button"
                            aria-label="Scroll topics right"
                            onClick={() => scrollTopicsCarousel(1)}
                            disabled={!topicsCarouselScroll.canRight}
                            sx={{
                                display: { xs: 'none', md: 'inline-flex' },
                                flexShrink: 0,
                                alignSelf: 'center',
                                bgcolor: 'background.paper',
                                boxShadow: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                mr: 2,
                                zIndex: 2,
                                '&:hover': { bgcolor: 'grey.50' },
                            }}
                        >
                            <ChevronRightIcon />
                        </IconButton>
                    </Stack>

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
                            {t('home.viewAllTopics')}
                        </Button>
                    </Box>
                </Box>

                {/* ═══ PRODUCT FEATURE SPLIT ═══════════════════════════════════ */}
                <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 11 } }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={{ xs: 5, md: 10 }} alignItems="center">
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>{t('home.platformOverline')}</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' }, lineHeight: 1.2 }}>
                                    {t('home.platformTitle')}
                                </Typography>
                                <Typography color="text.secondary" sx={{ lineHeight: 1.85, mb: 4, fontSize: '1.02rem' }}>
                                    {t('home.platformBody')}
                                </Typography>
                                <Stack spacing={2} sx={{ mb: 5 }}>
                                    {platformFeatures.map((f, i) => (
                                        <Stack key={i} direction="row" alignItems="center" gap={1.5}>
                                            <CheckCircleIcon sx={{ color: 'secondary.main', fontSize: 20, flexShrink: 0 }} />
                                            <Typography variant="body2" fontWeight={500}>{f}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                                <Button component={Link} to="/pricing" variant="contained" color="secondary" size="large" sx={{ px: 5, fontWeight: 700 }} disableElevation>
                                    {t('home.startFree')}
                                </Button>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box
                                    sx={{
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'background.paper',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={homeImagery.platform}
                                        alt=""
                                        sx={{ width: '100%', height: { xs: 280, md: 380 }, objectFit: 'cover', display: 'block' }}
                                    />
                                    <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.06em' }}>
                                            {t('home.mockChartTitle')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* ═══ INFOGRAPHIC HIGHLIGHT ═══════════════════════════════════ */}
                <Box sx={{ bgcolor: '#EBECF1', py: { xs: 8, md: 11 } }}>
                    <Container maxWidth="lg">
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 6 }} gap={2}>
                            <Box>
                                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>{t('home.insights')}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{t('home.popularReports')}</Typography>
                            </Box>
                            <Button component={Link} to="/reports" endIcon={<ArrowRightAltIcon />} sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>{t('home.viewAllReports')}</Button>
                        </Stack>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Card sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                                    <Box
                                        sx={{
                                            width: { xs: '100%', md: '42%' },
                                            minHeight: { xs: 220, md: 'auto' },
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={homeImagery.infographic}
                                            alt=""
                                            sx={{ width: '100%', height: '100%', minHeight: { xs: 220, md: 360 }, objectFit: 'cover', display: 'block' }}
                                        />
                                    </Box>
                                    <Box sx={{ p: { xs: 3, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Chip label={t('home.corporateData')} size="small" sx={{ bgcolor: 'secondary.light', color: 'secondary.dark', mb: 2, fontWeight: 700, width: 'fit-content' }} />
                                        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 1.5 }}>
                                            {t('home.infographicTitle')}
                                        </Typography>
                                        <Typography color="text.secondary" sx={{ fontSize: '0.9375rem', mb: 3, lineHeight: 1.65 }}>
                                            {t('home.infographicSub')}
                                        </Typography>
                                        <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2.5, border: '1px solid', borderColor: 'divider', flexGrow: 1 }}>
                                            <MiniHBarChart rows={infographicBars} />
                                        </Box>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={2} sx={{ mt: 3 }}>
                                            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                                <Chip label={t('home.freePreview')} size="small" sx={{ bgcolor: 'rgba(13,148,136,0.1)', color: 'success.dark', fontWeight: 700 }} />
                                                <Typography variant="caption" color="text.secondary">{t('common.source')}: ITU, 2024</Typography>
                                            </Stack>
                                            <Button component={Link} to="/reports/1" variant="contained" color="secondary" size="small" sx={{ fontWeight: 700 }} disableElevation>
                                                {t('home.viewFullReport')}
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Stack spacing={3} sx={{ height: '100%' }}>
                                    {sideReports.map((s, i) => (
                                        <Card key={i} component={Link} to="/reports/1" sx={{ textDecoration: 'none', p: 3, flex: 1, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(26,35,50,0.07)' } }}>
                                            <Chip label={s.tag} size="small" sx={{ bgcolor: 'rgba(75,91,114,0.08)', color: 'primary.main', fontWeight: 700, mb: 1.5, fontSize: '0.7rem' }} />
                                            <Typography variant="body2" fontWeight={600} sx={{ mb: 2, lineHeight: 1.5 }}>{s.title}</Typography>
                                            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5 }}>{s.value}</Typography>
                                                <MiniBarChart bars={s.bars} />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>{t('common.updated')} {s.date}</Typography>
                                        </Card>
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* ═══ PRICING PLANS ═══════════════════════════════════════════ */}
                <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 11 } }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>{t('home.pricingOverline')}</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, mb: 1.5 }}>{t('home.choosePlan')}</Typography>
                            <Typography color="text.secondary">{t('home.pricingSub')}</Typography>
                        </Box>
                        <Grid container spacing={4} alignItems="stretch">
                            {pricingPlans.map((plan, i) => (
                                <Grid key={i} size={{ xs: 12, md: 4 }}>
                                    <Card sx={{
                                        p: 4, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
                                        overflow: 'visible',
                                        ...(plan.highlight === true && {
                                            border: '2px solid',
                                            borderColor: 'secondary.main',
                                            boxShadow: 'none',
                                            mt: 2,
                                        }),
                                    }}>
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
                                        <Button component={Link} to="/pricing" variant={plan.variant} color={plan.highlight ? 'secondary' : 'primary'} fullWidth size="large" sx={{ fontWeight: 700, py: 1.5 }} disableElevation>
                                            {plan.cta}
                                        </Button>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
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
                        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, mb: 2.5, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                            {t('home.trustTitle')}
                        </Typography>
                        <Typography sx={{ color: '#cbd5e1', fontSize: '1.0625rem', mb: 5, lineHeight: 1.75, maxWidth: 520, mx: 'auto' }}>
                            {t('home.trustSub')}
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" gap={2}>
                            <Button component={Link} to="/pricing" variant="contained" color="secondary" size="large" sx={{ px: 6, py: 1.75, fontWeight: 700, fontSize: '1rem' }} disableElevation>
                                {t('home.startTrial')}
                            </Button>
                            <Button component={Link} to="/reports" variant="outlined" size="large"
                                sx={{ px: 6, py: 1.75, fontWeight: 700, fontSize: '1rem', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.4)' } }}>
                                {t('home.browseData')}
                            </Button>
                        </Stack>
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
                            </Grid>
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 3, md: 4 },
                                        borderRadius: 3,
                                        bgcolor: '#fff',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
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
                                                        <Typography variant="subtitle2" fontWeight={700}>{t('methodology.margin')} (%)</Typography>
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
                                                    <Typography variant="subtitle2" fontWeight={700} mb={1.5}>{t('methodology.confidence')}</Typography>
                                                    <ToggleButtonGroup
                                                        value={confidence}
                                                        exclusive
                                                        onChange={(e, val) => { if(val !== null) setConfidence(val) }}
                                                        fullWidth
                                                        size="small"
                                                        color="secondary"
                                                    >
                                                        {confidenceLevels.map(opt => (
                                                            <ToggleButton key={opt.value} value={opt.value} sx={{ fontWeight: 600 }}>
                                                                {opt.label}
                                                            </ToggleButton>
                                                        ))}
                                                    </ToggleButtonGroup>
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
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box
                                        component="img"
                                        src="/contact.png"
                                        alt="Contact Us"
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            minHeight: { xs: 300, md: 400 },
                                            objectFit: 'cover',
                                            borderRadius: 3,
                                            display: 'block',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
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
                                            <Stack spacing={2.5} component="form" onSubmit={e => e.preventDefault()}>
                                                <TextField label={t('corporate.name')} name="name" autoComplete="name" fullWidth />
                                                <TextField label={t('corporate.email')} name="email" type="email" autoComplete="email" fullWidth />
                                                <TextField label={t('corporate.subject')} name="subject" fullWidth />
                                                <TextField label={t('corporate.body')} name="body" multiline rows={4} fullWidth />
                                                <Button type="submit" variant="contained" color="secondary" disableElevation fullWidth size="large" sx={{ fontWeight: 700, py: 1.5, mt: 1 }}>
                                                    {t('corporate.send')}
                                                </Button>
                                            </Stack>
                                        </Paper>
                                    </Box>
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

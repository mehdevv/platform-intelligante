import React from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import SearchIcon from '@mui/icons-material/Search'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import DownloadIcon from '@mui/icons-material/Download'
import ScheduleIcon from '@mui/icons-material/Schedule'
import StorageIcon from '@mui/icons-material/Storage'
import Header from '../components/Header'
import Footer from '../components/Footer'

// ─── Mini bar chart used inside stat cards ───────────────────────────────────
function MiniBarChart({ bars = [40, 65, 90, 50, 35, 70, 55], color = '#003399' }) {
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
                    <LinearProgress variant="determinate" value={r.pct} sx={{ flex: 1, height: 8, borderRadius: 1, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: r.color || '#003399', borderRadius: 1 } }} />
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, width: 32, textAlign: 'right' }}>{r.pct}%</Typography>
                </Stack>
            ))}
        </Stack>
    )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const popularTags = ['GDP Growth', 'Inflation 2024', 'E-commerce', 'AI & Machine Learning', 'Climate Change', 'Electric Vehicles', 'Renewable Energy']

const featuredStats = [
    {
        tag: 'Economy', freeLabel: 'Free',
        title: 'Global GDP growth projections for 2024 by region',
        value: '+3.2%', unit: 'World Avg.', source: 'IMF', date: 'May 2024',
        bars: [35, 50, 80, 60, 45, 72, 55],
    },
    {
        tag: 'Technology', freeLabel: 'Premium',
        title: 'Generative AI market size worldwide 2022–2030',
        value: '$1.3T', unit: 'By 2032', source: 'Bloomberg Intelligence', date: 'Jun 2024',
        bars: [10, 20, 35, 55, 75, 88, 97],
    },
    {
        tag: 'Energy', freeLabel: 'Free',
        title: 'Share of renewables in global electricity generation',
        value: '30%', unit: '2023 Share', source: 'IRENA', date: 'Apr 2024',
        bars: [20, 28, 36, 44, 53, 64, 72],
    },
]

const topics = [
    { label: 'Economy', icon: 'payments', count: '124k' },
    { label: 'Technology', icon: 'memory', count: '98k' },
    { label: 'Health', icon: 'health_and_safety', count: '76k' },
    { label: 'Society', icon: 'groups', count: '62k' },
    { label: 'Environment', icon: 'eco', count: '48k' },
    { label: 'Commerce', icon: 'shopping_cart', count: '91k' },
    { label: 'Finance', icon: 'account_balance', count: '83k' },
    { label: 'Politics', icon: 'how_to_vote', count: '39k' },
    { label: 'Education', icon: 'school', count: '33k' },
    { label: 'Media', icon: 'campaign', count: '27k' },
    { label: 'Transport', icon: 'directions_car', count: '44k' },
    { label: 'Food', icon: 'restaurant', count: '19k' },
]

const mostPopular = [
    { tag: 'Society', title: 'Number of broadband internet users worldwide 2019–2028', value: '5.4B', bars: [55, 62, 68, 74, 79, 85, 92] },
    { tag: 'Economy', title: 'Average annual wages in OECD countries', value: '$51,607', bars: [40, 42, 45, 47, 50, 52, 54] },
    { tag: 'Technology', title: 'Global smartphone penetration rate 2013–2028', value: '68%', bars: [30, 40, 52, 60, 65, 67, 70] },
    { tag: 'Commerce', title: 'Retail e-commerce revenue worldwide 2014–2027', value: '$7.4T', bars: [15, 22, 32, 42, 55, 68, 80] },
]

const infographicBars = [
    { label: 'United States', pct: 87, color: '#003399' },
    { label: 'Germany', pct: 72, color: '#1e3a8a' },
    { label: 'United Kingdom', pct: 68, color: '#2355c7' },
    { label: 'France', pct: 61, color: '#4b70d1' },
    { label: 'Japan', pct: 55, color: '#7b95df' },
]

const pricingPlans = [
    {
        name: 'Basic', price: 'Free', per: '',
        features: ['Access to 10% of content', '5 downloads per month', 'Basic chart export', 'Email support'],
        cta: 'Get started', variant: 'outlined',
    },
    {
        name: 'Professional', price: '$49', per: '/month',
        features: ['Full database access', 'Unlimited downloads', 'Excel & PPT export', 'API access (50k calls)', 'Priority support'],
        cta: 'Start free trial', variant: 'contained', highlight: true,
    },
    {
        name: 'Enterprise', price: 'Custom', per: '',
        features: ['Multi-user accounts', 'Unlimited API calls', 'White-label reports', 'SSO integration', 'Dedicated account manager'],
        cta: 'Contact sales', variant: 'outlined',
    },
]

const categoryLinks = [
    { title: 'Economy & Finance', links: ['GDP & Growth', 'Inflation', 'Trade', 'Employment', 'Banking', 'Crypto'] },
    { title: 'Technology', links: ['AI & ML', 'Cloud Computing', 'Cybersecurity', 'Semiconductors', 'Mobile', 'E-commerce'] },
    { title: 'Society', links: ['Demographics', 'Education', 'Health', 'Crime', 'Religion', 'Sports'] },
    { title: 'Environment', links: ['Climate Change', 'Energy', 'CO₂ Emissions', 'Water', 'Biodiversity', 'Agriculture'] },
    { title: 'Industries', links: ['Automotive', 'Pharma', 'Retail', 'Real Estate', 'Media', 'Tourism'] },
    { title: 'Countries', links: ['United States', 'China', 'Germany', 'India', 'Brazil', 'More →'] },
]

// ─── Component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
    return (
        <Box sx={{ bgcolor: 'background.paper' }}>
            <Header />
            <Box component="main" sx={{ pt: '64px' }}>

                {/* ═══ HERO ════════════════════════════════════════════════════ */}
                <Box sx={{ bgcolor: '#0a1628', pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 9 }, position: 'relative', overflow: 'hidden' }}>
                    {/* Glows */}
                    <Box sx={{ position: 'absolute', top: -120, right: -80, width: 480, height: 480, borderRadius: '50%', bgcolor: '#003399', filter: 'blur(120px)', opacity: 0.35 }} />
                    <Box sx={{ position: 'absolute', bottom: -80, left: -60, width: 360, height: 360, borderRadius: '50%', bgcolor: '#1e40af', filter: 'blur(100px)', opacity: 0.25 }} />

                    <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                        {/* Badge */}
                        <Chip
                            label="✦  1.2M+ Statistics · 80,000 Verified Sources"
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.07)', color: 'rgba(191,219,254,0.9)', border: '1px solid rgba(255,255,255,0.12)', mb: 4, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.03em', height: 28 }}
                        />
                        <Typography variant="h1" sx={{ color: '#fff', fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' }, fontWeight: 800, lineHeight: 1.1, mb: 2, fontFamily: '"Public Sans", sans-serif' }}>
                            Empowering people
                        </Typography>
                        <Typography variant="h1" sx={{ color: '#60a5fa', fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' }, fontWeight: 800, lineHeight: 1.1, mb: 4, fontFamily: '"Public Sans", sans-serif' }}>
                            with data
                        </Typography>
                        <Typography sx={{ color: 'rgba(148,163,184,1)', fontSize: { xs: '1rem', md: '1.125rem' }, mb: 6, maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}>
                            Access millions of verified statistics and market reports. Find the exact data you need — instantly.
                        </Typography>

                        {/* Search Box */}
                        <Box sx={{ display: 'flex', maxWidth: 640, mx: 'auto', bgcolor: '#fff', borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden', mb: 4 }}>
                            <TextField
                                fullWidth
                                placeholder="Search statistics, reports, industries..."
                                variant="standard"
                                slotProps={{ input: { disableUnderline: true, startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#64748b', ml: 1 }} /></InputAdornment> } }}
                                sx={{ px: 1.5, py: 0.5, '& input': { fontSize: '0.9375rem', py: '12px' } }}
                            />
                            <Button variant="contained" color="secondary" disableElevation
                                sx={{ m: 0.75, px: 3.5, borderRadius: 2, fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                                Search
                            </Button>
                        </Box>

                        {/* Popular tags */}
                        <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1}>
                            <Typography sx={{ color: '#64748b', fontSize: '0.8125rem', pt: 0.5, fontWeight: 500 }}>Popular:</Typography>
                            {popularTags.map(tag => (
                                <Chip key={tag} label={tag} size="small" component={Link} to="/reports"
                                    sx={{ color: 'rgba(147,197,253,0.9)', borderColor: 'rgba(255,255,255,0.12)', bgcolor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                                    variant="outlined" />
                            ))}
                        </Stack>
                    </Container>
                </Box>

                {/* ═══ STATS TICKER ══════════════════════════════════════════ */}
                <Box sx={{ bgcolor: '#050d1a', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', py: 1.5, overflow: 'hidden' }}>
                    <Box className="ticker-scroll">
                        {[0, 1].map(set => (
                            <Box key={set} sx={{ display: 'flex', alignItems: 'center', gap: 6, px: 4, flexShrink: 0 }}>
                                {[
                                    { label: 'Statistics', value: '1.2M+' },
                                    { label: 'Verified Sources', value: '80K+' },
                                    { label: 'Industries', value: '170+' },
                                    { label: 'Forecasts', value: '450K+' },
                                    { label: 'Data Points', value: '3.8M+' },
                                    { label: 'Countries', value: '195' },
                                    { label: 'Daily Users', value: '2.5M+' },
                                ].map((stat, i) => (
                                    <Stack key={i} direction="row" alignItems="center" gap={1.5} sx={{ flexShrink: 0 }}>
                                        <Typography sx={{ color: '#60a5fa', fontWeight: 900, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>{stat.value}</Typography>
                                        <Typography sx={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, whiteSpace: 'nowrap' }}>{stat.label}</Typography>
                                    </Stack>
                                ))}
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* ═══ FEATURED STATS ══════════════════════════════════════════ */}
                <Box sx={{ bgcolor: '#f8fafc', py: { xs: 7, md: 10 } }}>
                    <Container maxWidth="lg">
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 5 }} gap={2}>
                            <Box>
                                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>Trending Now</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>Featured Statistics</Typography>
                                <Typography color="text.secondary" sx={{ mt: 0.5 }}>Highly cited data points updated this week</Typography>
                            </Box>
                            <Button component={Link} to="/reports" endIcon={<ArrowRightAltIcon />} sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>View all statistics</Button>
                        </Stack>

                        <Grid container spacing={3}>
                            {featuredStats.map((stat, i) => (
                                <Grid key={i} size={{ xs: 12, md: 4 }}>
                                    <Card component={Link} to="/reports/1" sx={{ textDecoration: 'none', height: '100%', p: 3, display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 12px 40px rgba(0,51,153,0.12)' } }}>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                                            <Chip label={stat.tag} size="small" sx={{ bgcolor: 'rgba(0,51,153,0.08)', color: 'primary.main', fontWeight: 700 }} />
                                            <Chip label={stat.freeLabel} size="small"
                                                sx={{ bgcolor: stat.freeLabel === 'Premium' ? 'rgba(212,175,55,0.1)' : 'rgba(16,185,129,0.1)', color: stat.freeLabel === 'Premium' ? '#b8860b' : '#059669', fontWeight: 700 }} />
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
                                            <Stack direction="row" alignItems="center" gap={0.5}><StorageIcon sx={{ fontSize: 13, color: 'text.secondary' }} /><Typography variant="caption" color="text.secondary">{stat.source}</Typography></Stack>
                                        </Stack>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                {/* ═══ MOST POPULAR ════════════════════════════════════════════ */}
                <Box sx={{ bgcolor: '#fff', py: { xs: 7, md: 10 } }}>
                    <Container maxWidth="lg">
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 5 }} gap={2}>
                            <Box>
                                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>Data Library</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>Most Popular Statistics</Typography>
                            </Box>
                            <Button component={Link} to="/reports" endIcon={<ArrowRightAltIcon />} sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>Browse all data</Button>
                        </Stack>
                        <Grid container spacing={3}>
                            {mostPopular.map((s, i) => (
                                <Grid key={i} size={{ xs: 12, sm: 6 }}>
                                    <Card component={Link} to="/reports/1" sx={{ textDecoration: 'none', p: 3, display: 'flex', gap: 2.5, alignItems: 'flex-start', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 30px rgba(0,51,153,0.1)' } }}>
                                        {/* Number rank */}
                                        <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: 'rgba(0,51,153,0.1)', lineHeight: 1, flexShrink: 0, width: 32 }}>{i + 1}</Typography>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Chip label={s.tag} size="small" sx={{ bgcolor: 'rgba(0,51,153,0.06)', color: 'primary.main', fontWeight: 700, mb: 1, fontSize: '0.7rem' }} />
                                            <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.5, mb: 2, color: 'text.primary' }}>{s.title}</Typography>
                                            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 1.5 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5 }}>{s.value}</Typography>
                                                <MiniBarChart bars={s.bars} color="#003399" />
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                {/* ═══ EXPLORE TOPICS ══════════════════════════════════════════ */}
                <Box sx={{ bgcolor: '#f1f5f9', py: { xs: 7, md: 10 } }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>Categories</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>Explore Topics &amp; Industries</Typography>
                            <Typography color="text.secondary" sx={{ mt: 1 }}>Browse data from hundreds of verified industry verticals</Typography>
                        </Box>
                        <Grid container spacing={2.5}>
                            {topics.map(topic => (
                                <Grid key={topic.label} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                                    <Card component={Link} to="/sectors"
                                        sx={{
                                            textDecoration: 'none', p: 0, textAlign: 'center', cursor: 'pointer',
                                            overflow: 'hidden', position: 'relative',
                                            transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
                                            borderBottom: '3px solid transparent',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 32px rgba(0,51,153,0.15)',
                                                borderBottomColor: 'secondary.main',
                                                '& .topic-icon-wrap': {
                                                    background: 'linear-gradient(135deg, #003399 0%, #1e40af 100%)',
                                                },
                                                '& .topic-icon-wrap .material-symbols-outlined': { color: '#fff' },
                                                '& .topic-arrow': { opacity: 1, transform: 'translateX(0)' },
                                            },
                                        }}>
                                        {/* Icon */}
                                        <Box className="topic-icon-wrap" sx={{
                                            width: '100%', py: 3,
                                            background: 'linear-gradient(135deg, rgba(0,51,153,0.06) 0%, rgba(0,51,153,0.02) 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'background 0.25s ease',
                                        }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 34, color: '#003399', transition: 'color 0.25s ease' }}>{topic.icon}</span>
                                        </Box>
                                        {/* Label + count */}
                                        <Box sx={{ p: 2, pt: 1.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25 }}>{topic.label}</Typography>
                                            <Stack direction="row" alignItems="center" justifyContent="center" gap={0.5}>
                                                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, fontSize: '0.7rem' }}>{topic.count}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>stats</Typography>
                                                <ArrowForwardIcon className="topic-arrow" sx={{ fontSize: 12, color: 'secondary.main', ml: 0.5, opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.2s ease' }} />
                                            </Stack>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ textAlign: 'center', mt: 5 }}>
                            <Button component={Link} to="/sectors" variant="outlined" color="primary" endIcon={<ArrowForwardIcon />} sx={{ px: 4, fontWeight: 700 }}>View all topics</Button>
                        </Box>
                    </Container>
                </Box>

                {/* ═══ PRODUCT FEATURE SPLIT ═══════════════════════════════════ */}
                <Box sx={{ bgcolor: '#fff', py: { xs: 7, md: 10 } }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>Platform</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' }, lineHeight: 1.2 }}>
                                    Access the world's most comprehensive data platform
                                </Typography>
                                <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>
                                    DataVault gives you instant access to over 1.2 million verified statistics. Download charts in multiple formats, filter by region, industry, or date range — all in one place.
                                </Typography>
                                <Stack spacing={2} sx={{ mb: 5 }}>
                                    {[
                                        'Download as PNG, PDF, CSV, or PowerPoint',
                                        'Cite statistics with proper academic references',
                                        'Compare data across 195 countries',
                                        'Real-time market tracking & alerts',
                                    ].map((f, i) => (
                                        <Stack key={i} direction="row" alignItems="center" gap={1.5}>
                                            <CheckCircleIcon sx={{ color: 'secondary.main', fontSize: 20, flexShrink: 0 }} />
                                            <Typography variant="body2" fontWeight={500}>{f}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                                <Button component={Link} to="/pricing" variant="contained" size="large" sx={{ px: 5, fontWeight: 700 }}>Start for free</Button>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                {/* Dashboard mockup */}
                                <Box sx={{ bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,51,153,0.1)' }}>
                                    {/* Fake browser chrome */}
                                    <Box sx={{ bgcolor: '#e2e8f0', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        {['#f87171', '#fbbf24', '#34d399'].map(c => <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />)}
                                        <Box sx={{ flex: 1, bgcolor: '#fff', borderRadius: 1, height: 20, mx: 1 }} />
                                    </Box>
                                    {/* Mock header */}
                                    <Box sx={{ bgcolor: '#0a1628', px: 2, py: 1.5 }}>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <StorageIcon sx={{ color: '#60a5fa', fontSize: 18 }} />
                                            <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>DataVault</Typography>
                                        </Stack>
                                    </Box>
                                    {/* Mock content */}
                                    <Box sx={{ p: 3 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Global AI Market Size — 2022–2030</Typography>
                                        <Stack direction="row" alignItems="flex-end" gap={0.75} sx={{ height: 120, mt: 2, mb: 1.5 }}>
                                            {[18, 27, 38, 52, 66, 79, 88, 95].map((h, i) => (
                                                <Box key={i} sx={{ flex: 1, bgcolor: i === 7 ? 'secondary.main' : 'primary.main', opacity: 0.6 + i * 0.05, borderRadius: '3px 3px 0 0', height: `${h}%` }} />
                                            ))}
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between">
                                            {['2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029'].map(y => (
                                                <Typography key={y} variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>{y}</Typography>
                                            ))}
                                        </Stack>
                                        <Divider sx={{ my: 2 }} />
                                        <Stack direction="row" gap={2}>
                                            {[
                                                { label: 'Value 2024', val: '$142B', color: 'primary.main' },
                                                { label: 'Growth Rate', val: '+35%', color: 'success.main' },
                                                { label: 'Forecast 2030', val: '$1.3T', color: 'secondary.main' },
                                            ].map((m, i) => (
                                                <Box key={i} sx={{ flex: 1, p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2, textAlign: 'center' }}>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.6rem' }}>{m.label}</Typography>
                                                    <Typography sx={{ fontWeight: 900, fontSize: '0.875rem', color: m.color }}>{m.val}</Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                        <Stack direction="row" gap={1} sx={{ mt: 2 }}>
                                            <Button size="small" variant="contained" startIcon={<DownloadIcon fontSize="small" />} sx={{ fontSize: '0.7rem', flex: 1 }}>Download PNG</Button>
                                            <Button size="small" variant="outlined" sx={{ fontSize: '0.7rem', flex: 1 }}>Cite Source</Button>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* ═══ INFOGRAPHIC HIGHLIGHT ═══════════════════════════════════ */}
                <Box sx={{ bgcolor: '#f8fafc', py: { xs: 7, md: 10 } }}>
                    <Container maxWidth="lg">
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 5 }} gap={2}>
                            <Box>
                                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>Insights</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>Popular Data Reports</Typography>
                            </Box>
                            <Button component={Link} to="/reports" endIcon={<ArrowRightAltIcon />} sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>View all reports</Button>
                        </Stack>
                        <Grid container spacing={3}>
                            {/* Big infographic card */}
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Card sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ bgcolor: '#1e293b', p: 4, flexGrow: 1 }}>
                                        <Chip label="Corporate Data" size="small" sx={{ bgcolor: 'rgba(255,102,0,0.15)', color: '#ff6600', mb: 3, fontWeight: 700 }} />
                                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.3, mb: 1.5 }}>
                                            The Digital Divide: Internet Access Rates by Country
                                        </Typography>
                                        <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 4, lineHeight: 1.6 }}>
                                            The gap between high and low-income nations remains stark: top-tier countries boast 87%+ penetration, while the lowest remain under 20%.
                                        </Typography>
                                        {/* Horizontal bar chart */}
                                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2, p: 2.5 }}>
                                            <MiniHBarChart rows={infographicBars} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ p: 2.5, borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Chip label="Free preview" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#059669' }} />
                                            <Typography variant="caption" color="text.secondary">Source: ITU, 2024</Typography>
                                        </Stack>
                                        <Button component={Link} to="/reports/1" variant="contained" size="small" sx={{ fontWeight: 700 }}>View full report</Button>
                                    </Box>
                                </Card>
                            </Grid>
                            {/* Side stat cards */}
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Stack spacing={3} sx={{ height: '100%' }}>
                                    {[
                                        { tag: 'Commerce', title: 'Global B2B e-commerce volume 2019-2027', value: '$18.7T', date: 'Mar 2024', bars: [30, 42, 55, 62, 72, 81, 91] },
                                        { tag: 'Health', title: 'Digital health market size worldwide 2021-2030', value: '$680B', date: 'Jan 2024', bars: [22, 34, 47, 58, 68, 76, 85] },
                                    ].map((s, i) => (
                                        <Card key={i} component={Link} to="/reports/1" sx={{ textDecoration: 'none', p: 3, flex: 1, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(0,51,153,0.1)' } }}>
                                            <Chip label={s.tag} size="small" sx={{ bgcolor: 'rgba(0,51,153,0.08)', color: 'primary.main', fontWeight: 700, mb: 1.5, fontSize: '0.7rem' }} />
                                            <Typography variant="body2" fontWeight={600} sx={{ mb: 2, lineHeight: 1.5 }}>{s.title}</Typography>
                                            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 1.5 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5 }}>{s.value}</Typography>
                                                <MiniBarChart bars={s.bars} />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>Updated {s.date}</Typography>
                                        </Card>
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* ═══ PRICING PLANS ═══════════════════════════════════════════ */}
                <Box sx={{ bgcolor: '#fff', py: { xs: 7, md: 10 } }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 7 }}>
                            <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>Pricing</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, mb: 1.5 }}>Choose your plan</Typography>
                            <Typography color="text.secondary">Start free, upgrade when you need more.</Typography>
                        </Box>
                        <Grid container spacing={3} alignItems="stretch">
                            {pricingPlans.map((plan, i) => (
                                <Grid key={i} size={{ xs: 12, md: 4 }}>
                                    <Card sx={{
                                        p: 4, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
                                        overflow: 'visible',
                                        ...(plan.highlight && {
                                            border: '2px solid',
                                            borderColor: 'primary.main',
                                            boxShadow: '0 20px 60px rgba(0,51,153,0.15)',
                                            mt: 2,
                                        }),
                                    }}>
                                        {plan.highlight && (
                                            <Chip label="Most Popular" size="small" color="primary"
                                                sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 700, px: 1 }} />
                                        )}
                                        <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.12em', color: plan.highlight ? 'primary.main' : 'text.secondary' }}>{plan.name}</Typography>
                                        <Stack direction="row" alignItems="baseline" gap={0.5} sx={{ mb: 0.5, mt: 1 }}>
                                            <Typography sx={{ fontWeight: 900, fontSize: '2.25rem', color: 'text.primary', lineHeight: 1 }}>{plan.price}</Typography>
                                            <Typography variant="body2" color="text.secondary">{plan.per}</Typography>
                                        </Stack>
                                        <Divider sx={{ my: 3 }} />
                                        <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 4 }}>
                                            {plan.features.map((f, j) => (
                                                <Stack key={j} direction="row" alignItems="center" gap={1.5}>
                                                    <CheckCircleIcon sx={{ fontSize: 18, color: plan.highlight ? 'primary.main' : 'success.main', flexShrink: 0 }} />
                                                    <Typography variant="body2" color="text.secondary">{f}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                        <Button component={Link} to="/pricing" variant={plan.variant} color="primary" fullWidth size="large" sx={{ fontWeight: 700, py: 1.5 }}>
                                            {plan.cta}
                                        </Button>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                {/* ═══ TRUST + CTA BANNER ══════════════════════════════════════ */}
                <Box sx={{ bgcolor: '#0a1628', py: { xs: 7, md: 10 } }}>
                    <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, mb: 2.5, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                            Trusted by 2.5 million professionals
                        </Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '1.0625rem', mb: 6, lineHeight: 1.7, maxWidth: 520, mx: 'auto' }}>
                            Analysts, journalists, consultants, and researchers across 195 countries rely on DataVault every day.
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 7 }}>
                            {[
                                { value: '2.5M+', label: 'Monthly users' },
                                { value: '195', label: 'Countries covered' },
                                { value: '80K+', label: 'Verified sources' },
                                { value: '99.9%', label: 'Uptime SLA' },
                            ].map((m, i) => (
                                <Grid key={i} size={{ xs: 6, md: 3 }}>
                                    <Box sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.03)' }}>
                                        <Typography sx={{ color: '#60a5fa', fontWeight: 900, fontSize: '2rem', mb: 0.5 }}>{m.value}</Typography>
                                        <Typography sx={{ color: '#64748b', fontSize: '0.8125rem', fontWeight: 600 }}>{m.label}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" gap={2}>
                            <Button component={Link} to="/pricing" variant="contained" color="secondary" size="large" sx={{ px: 6, py: 1.75, fontWeight: 700, fontSize: '1rem' }}>
                                Start free trial
                            </Button>
                            <Button component={Link} to="/reports" variant="outlined" size="large"
                                sx={{ px: 6, py: 1.75, fontWeight: 700, fontSize: '1rem', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.4)' } }}>
                                Browse data
                            </Button>
                        </Stack>
                    </Container>
                </Box>

                {/* ═══ CATEGORY LINKS ══════════════════════════════════════════ */}
                <Box sx={{ bgcolor: '#f8fafc', py: { xs: 5, md: 7 }, borderTop: '1px solid #e2e8f0' }}>
                    <Container maxWidth="lg">
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 4, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
                            Explore by Category
                        </Typography>
                        <Grid container spacing={3}>
                            {categoryLinks.map(cat => (
                                <Grid key={cat.title} size={{ xs: 6, sm: 4, md: 2 }}>
                                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: 'text.primary' }}>{cat.title}</Typography>
                                    <Stack spacing={0.5}>
                                        {cat.links.map(l => (
                                            <Box key={l} component={Link} to="/reports"
                                                sx={{ fontSize: '0.8125rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' }, transition: 'color 0.15s' }}>
                                                {l}
                                            </Box>
                                        ))}
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

            </Box>
            <Footer />
        </Box>
    )
}

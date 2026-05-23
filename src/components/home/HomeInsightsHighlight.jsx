import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { useTranslation } from 'react-i18next'
import { MotionInView, MotionStagger, MotionStaggerItem } from '../motion/Motion'
import { homeImagery } from '../../constants/homeImagery'

const INFOGRAPHIC_BARS = [
    { label: 'United States', pct: 87, color: '#197F94' },
    { label: 'Germany', pct: 72, color: '#2d8fa3' },
    { label: 'United Kingdom', pct: 68, color: '#3d9eb0' },
    { label: 'France', pct: 61, color: '#4B5B72' },
    { label: 'Japan', pct: 55, color: '#6b8a9a' },
]

const TAG_ACCENT = {
    Commerce: '#197F94',
    Santé: '#0d9488',
    Health: '#0d9488',
}

function tagAccent(tag) {
    return TAG_ACCENT[tag] || '#4B5B72'
}

function MiniBarChart({ bars, accent = '#197F94' }) {
    const max = Math.max(...bars, 1)
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 56 }}>
            {bars.map((h, i) => (
                <Box
                    key={i}
                    sx={{
                        flex: 1,
                        height: `${(h / max) * 100}%`,
                        minHeight: 4,
                        borderRadius: '4px 4px 0 0',
                        background: `linear-gradient(180deg, ${accent} 0%, ${accent}99 100%)`,
                        opacity: 0.35 + (h / max) * 0.65,
                        transition: 'height 0.35s ease, opacity 0.35s ease',
                    }}
                />
            ))}
        </Box>
    )
}

function MiniHBarChart({ rows }) {
    return (
        <Stack spacing={1.25}>
            {rows.map((r, i) => (
                <Stack key={i} direction="row" alignItems="center" gap={1.5}>
                    <Typography
                        variant="caption"
                        sx={{
                            width: { xs: 72, sm: 88 },
                            fontSize: '0.7rem',
                            color: 'text.secondary',
                            flexShrink: 0,
                            fontWeight: 600,
                        }}
                    >
                        {r.label}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={r.pct}
                        sx={{
                            flex: 1,
                            height: 10,
                            borderRadius: 2,
                            bgcolor: 'rgba(75, 91, 114, 0.08)',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 2,
                                background: `linear-gradient(90deg, ${r.color} 0%, ${r.color}cc 100%)`,
                            },
                        }}
                    />
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 800, width: 36, textAlign: 'right', color: 'primary.main' }}>
                        {r.pct}%
                    </Typography>
                </Stack>
            ))}
        </Stack>
    )
}

function SideInsightCard({ item, updatedLabel }) {
    const accent = tagAccent(item.tag)
    return (
        <Card
            component={motion.create(Link)}
            to="/reports"
            elevation={0}
            whileHover={{ y: -5, transition: { type: 'spring', stiffness: 280, damping: 22 } }}
            sx={{
                textDecoration: 'none',
                color: 'inherit',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                p: 0,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: '#fff',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
                '&:hover': {
                    boxShadow: '0 16px 40px rgba(25, 127, 148, 0.12)',
                    borderColor: 'secondary.light',
                    '& .insight-arrow': { opacity: 1, transform: 'translateX(0)' },
                },
            }}
        >
            <Box sx={{ p: 2.5, pb: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Chip
                        label={item.tag}
                        size="small"
                        sx={{
                            height: 24,
                            fontWeight: 800,
                            fontSize: '0.65rem',
                            letterSpacing: '0.06em',
                            bgcolor: `${accent}14`,
                            color: accent,
                            border: '1px solid',
                            borderColor: `${accent}33`,
                        }}
                    />
                    <ArrowForwardIcon
                        className="insight-arrow"
                        sx={{ fontSize: 18, color: 'secondary.main', opacity: 0, transform: 'translateX(-6px)', transition: 'all 0.25s ease' }}
                    />
                </Stack>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 2, lineHeight: 1.45, color: 'text.primary', flexGrow: 1 }}>
                    {item.title}
                </Typography>
                <Box
                    sx={{
                        borderRadius: 2,
                        p: 2,
                        background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                        border: '1px solid',
                        borderColor: 'rgba(75, 91, 114, 0.1)',
                    }}
                >
                    <Stack direction="row" alignItems="baseline" gap={0.75} sx={{ mb: 1.25 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, color: 'primary.main', fontFamily: '"League Spartan", sans-serif' }}>
                            {item.value}
                        </Typography>
                        <TrendingUpIcon sx={{ fontSize: 18, color: accent, opacity: 0.85 }} />
                    </Stack>
                    <MiniBarChart bars={item.bars} accent={accent} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontWeight: 600 }}>
                    {updatedLabel} {item.date}
                </Typography>
            </Box>
        </Card>
    )
}

/**
 * @param {{ sideReports: { tag: string, title: string, value: string, date: string, bars: number[] }[], featuredHref?: string }} props
 */
export default function HomeInsightsHighlight({ sideReports = [], featuredHref = '/reports' }) {
    const { t } = useTranslation()

    return (
        <Box
            sx={{
                py: { xs: 8, md: 11 },
                background: 'linear-gradient(180deg, #eef0f4 0%, #e8eaef 50%, #eef0f4 100%)',
            }}
        >
            <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
                <MotionInView>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} sx={{ mb: { xs: 4, md: 5 } }} gap={2}>
                    <Box>
                        <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.14em' }}>
                            {t('home.insights')}
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{ fontWeight: 800, mt: 0.75, fontFamily: '"League Spartan", sans-serif', lineHeight: 1.15 }}
                        >
                            {t('home.popularReports')}
                        </Typography>
                    </Box>
                    <Button
                        component={Link}
                        to="/reports"
                        endIcon={<ArrowRightAltIcon />}
                        sx={{ fontWeight: 700, color: 'secondary.dark', flexShrink: 0 }}
                    >
                        {t('home.viewAllReports')}
                    </Button>
                </Stack>
                </MotionInView>

                <MotionStagger style={{ width: '100%' }}>
                <Grid container spacing={{ xs: 2.5, md: 3 }} alignItems="stretch">
                    <Grid size={{ xs: 12, md: 7 }}>
                        <MotionStaggerItem style={{ height: '100%' }}>
                        <Card
                            component={motion.create(Link)}
                            to={featuredHref}
                            elevation={0}
                            whileHover={{ y: -5, transition: { type: 'spring', stiffness: 260, damping: 22 } }}
                            sx={{
                                height: '100%',
                                textDecoration: 'none',
                                color: 'inherit',
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: '#fff',
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(15, 23, 42, 0.06)',
                                '&:hover': {
                                    boxShadow: '0 20px 48px rgba(26, 35, 50, 0.12)',
                                    '& .featured-img': { transform: 'scale(1.03)' },
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: { xs: '100%', md: '44%' },
                                    minHeight: { xs: 200, md: 'auto' },
                                    flexShrink: 0,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    component="img"
                                    className="featured-img"
                                    src={homeImagery.infographic}
                                    alt=""
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        minHeight: { xs: 200, md: 380 },
                                        objectFit: 'cover',
                                        display: 'block',
                                        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                                    }}
                                />
                                <Box
                                    aria-hidden
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.15) 100%)',
                                        display: { xs: 'none', md: 'block' },
                                    }}
                                />
                            </Box>
                            <Box
                                sx={{
                                    flex: 1,
                                    p: { xs: 2.5, md: 3.5 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderLeft: { md: '4px solid' },
                                    borderColor: { md: 'secondary.main' },
                                }}
                            >
                                <Chip
                                    label={t('home.corporateData')}
                                    size="small"
                                    sx={{
                                        mb: 2,
                                        fontWeight: 800,
                                        fontSize: '0.65rem',
                                        letterSpacing: '0.08em',
                                        bgcolor: 'secondary.main',
                                        color: '#fff',
                                        width: 'fit-content',
                                    }}
                                />
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 800,
                                        lineHeight: 1.25,
                                        mb: 1.25,
                                        fontFamily: '"League Spartan", sans-serif',
                                        fontSize: { xs: '1.25rem', md: '1.4rem' },
                                    }}
                                >
                                    {t('home.infographicTitle')}
                                </Typography>
                                <Typography color="text.secondary" sx={{ fontSize: '0.9375rem', mb: 2.5, lineHeight: 1.7 }}>
                                    {t('home.infographicSub')}
                                </Typography>
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        borderRadius: 2.5,
                                        p: 2.5,
                                        background: 'linear-gradient(145deg, #f8fafc 0%, #fff 100%)',
                                        border: '1px solid',
                                        borderColor: 'rgba(25, 127, 148, 0.12)',
                                    }}
                                >
                                    <MiniHBarChart rows={INFOGRAPHIC_BARS} />
                                </Box>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    alignItems={{ sm: 'center' }}
                                    justifyContent="space-between"
                                    gap={2}
                                    sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid', borderColor: 'divider' }}
                                >
                                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                        <Chip
                                            label={t('home.freePreview')}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 700, borderColor: 'success.light', color: 'success.dark' }}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                            {t('common.source')}: ITU, 2024
                                        </Typography>
                                    </Stack>
                                    <Button
                                        component="span"
                                        variant="contained"
                                        color="secondary"
                                        size="medium"
                                        endIcon={<ArrowForwardIcon />}
                                        disableElevation
                                        sx={{ fontWeight: 700, px: 2.5, borderRadius: 2, pointerEvents: 'none' }}
                                    >
                                        {t('home.viewFullReport')}
                                    </Button>
                                </Stack>
                            </Box>
                        </Card>
                        </MotionStaggerItem>
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Stack spacing={2.5} sx={{ height: '100%' }}>
                            {sideReports.map((s, i) => (
                                <MotionStaggerItem key={i} style={{ flex: 1, display: 'flex' }}>
                                    <SideInsightCard item={s} updatedLabel={t('common.updated')} />
                                </MotionStaggerItem>
                            ))}
                        </Stack>
                    </Grid>
                </Grid>
                </MotionStagger>
            </Container>
        </Box>
    )
}

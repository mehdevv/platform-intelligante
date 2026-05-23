import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import { motion } from 'framer-motion'
import DotPattern from '../DotPattern'
import LiveCatalogSearch from '../search/LiveCatalogSearch'
import { MotionHeroImage, MotionHeroItem, MotionHeroStagger } from '../motion/Motion'
import { heroItem } from '../motion/motionPresets'
import { homeImagery } from '../../constants/homeImagery'
import { popularReportChipLabel, POPULAR_CHIP_LINE_PX, POPULAR_MAX_LINES } from '../../lib/popularReports'
import { reportPublicPath } from '../../lib/reportPath'

const chipStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.35 } },
}

/**
 * @param {{
 *   t: (key: string) => string,
 *   searchPlaceholder: string,
 *   popularReports: { id: string, slug?: string, title: string, href?: string }[],
 * }} props
 */
export default function HomeHero({ t, searchPlaceholder, popularReports }) {
    return (
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
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                    <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                            <MotionHeroStagger>
                                <MotionHeroItem>
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
                                    >
                                        {t('home.heroLine1')}
                                    </Typography>
                                </MotionHeroItem>
                                <MotionHeroItem>
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
                                    >
                                        {t('home.heroLine2')}
                                    </Typography>
                                </MotionHeroItem>
                                <MotionHeroItem>
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
                                </MotionHeroItem>
                                <MotionHeroItem>
                                    <LiveCatalogSearch variant="hero" placeholder={searchPlaceholder} sx={{ mb: 3 }} />
                                </MotionHeroItem>
                                <MotionHeroItem>
                                    <Box sx={{ maxWidth: { md: 520 }, mx: { xs: 'auto', md: 0 } }}>
                                        <Typography
                                            sx={{
                                                color: '#94a3b8',
                                                fontSize: '0.8125rem',
                                                fontWeight: 600,
                                                flexShrink: 0,
                                                mb: 1,
                                            }}
                                        >
                                            {t('common.popular')}
                                        </Typography>
                                        <motion.div
                                            variants={chipStagger}
                                            initial="hidden"
                                            animate="visible"
                                            style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                justifyContent: 'inherit',
                                                gap: 8,
                                                maxHeight: POPULAR_MAX_LINES * POPULAR_CHIP_LINE_PX,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {popularReports.map(report => (
                                                <motion.div key={report.id} variants={heroItem}>
                                                    <Chip
                                                        label={popularReportChipLabel(report.title)}
                                                        size="small"
                                                        component={Link}
                                                        to={report.slug ? reportPublicPath(report) : report.href}
                                                        title={report.title}
                                                        sx={{
                                                            color: '#e0f2fe',
                                                            borderColor: 'rgba(34,211,238,0.35)',
                                                            bgcolor: 'rgba(255,255,255,0.04)',
                                                            fontSize: '0.75rem',
                                                            maxWidth: { xs: '100%', sm: 280 },
                                                            cursor: 'pointer',
                                                            '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                                                            '&:hover': {
                                                                bgcolor: 'rgba(34,211,238,0.12)',
                                                                borderColor: '#22d3ee',
                                                            },
                                                        }}
                                                        variant="outlined"
                                                    />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    </Box>
                                </MotionHeroItem>
                            </MotionHeroStagger>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <MotionHeroImage>
                                <Box
                                    component={motion.div}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                                    sx={{
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        border: '2px solid',
                                        borderColor: '#22d3ee',
                                        bgcolor: '#0f172a',
                                        boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
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
                            </MotionHeroImage>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    )
}

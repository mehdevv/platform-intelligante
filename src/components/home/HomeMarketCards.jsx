import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { formatPriceFromCents } from '../../lib/moneyFormat'
import { reportPublicPath } from '../../lib/reportPath'

export function SectorCarouselCard({ sector, reportCount = 0 }) {
    const { t } = useTranslation()
    const href = `/sectors/${sector.slug}`
    return (
        <Card
            component={Link}
            to={href}
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
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                '&:hover': {
                    borderColor: 'secondary.main',
                    boxShadow: '0 12px 32px rgba(25, 127, 148, 0.14)',
                    transform: 'translateY(-3px)',
                    '& .sector-carousel-bg': { transform: 'scale(1.05)' },
                },
            }}
        >
            {sector.icon_image_url ? (
                <Box
                    component="img"
                    className="sector-carousel-bg"
                    src={sector.icon_image_url}
                    alt=""
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                />
            ) : (
                <Box
                    className="sector-carousel-bg"
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, #4B5B72 0%, #197F94 100%)',
                        transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                />
            )}
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
                sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, p: 2.5, minWidth: 0 }}
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
                        category
                    </span>
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 800,
                            color: '#fff',
                            lineHeight: 1.25,
                            fontFamily: '"League Spartan", sans-serif',
                            textShadow: '0 1px 12px rgba(0,0,0,0.35)',
                        }}
                    >
                        {sector.name}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.35, color: 'rgba(226,232,240,0.95)', fontWeight: 600 }}>
                        {reportCount} {t('home.sectorReportCount')}
                    </Typography>
                </Box>
            </Stack>
        </Card>
    )
}

export function FeaturedReportCard({ report }) {
    const { t } = useTranslation()
    const priceLabel =
        (report.price_cents ?? 0) > 0 ? formatPriceFromCents(report.price_cents, report.currency || 'DZD') : t('common.free')
    const sectorName = report.sectors?.name
    const date = report.published_at
        ? new Date(report.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
        : ''

    return (
        <Card
            component={motion.create(Link)}
            to={reportPublicPath(report)}
            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
            sx={{
                textDecoration: 'none',
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)',
                '&:hover': { boxShadow: '0 16px 40px rgba(25, 127, 148, 0.12)', borderColor: 'secondary.light' },
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    aspectRatio: '16/10',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #4B5B72, #197F94)',
                }}
            >
                {report.thumbnail_image_url ? (
                    <Box component="img" src={report.thumbnail_image_url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'rgba(255,255,255,0.25)' }}>
                            analytics
                        </span>
                    </Box>
                )}
            </Box>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }} flexWrap="wrap" gap={1}>
                    {sectorName && <Chip label={sectorName} size="small" sx={{ bgcolor: 'rgba(75,91,114,0.08)', color: 'primary.main', fontWeight: 700 }} />}
                    <Chip label={priceLabel} size="small" color={(report.price_cents ?? 0) > 0 ? 'warning' : 'success'} variant="outlined" sx={{ fontWeight: 700 }} />
                </Stack>
                <Typography variant="body1" fontWeight={700} sx={{ lineHeight: 1.45, mb: 1, flexGrow: 1, color: 'text.primary' }}>
                    {report.title}
                </Typography>
                {report.summary && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {report.summary}
                    </Typography>
                )}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    {date && (
                        <Typography variant="caption" color="text.secondary">
                            {date}
                        </Typography>
                    )}
                    <Button component="span" variant="outlined" color="secondary" size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />} sx={{ pointerEvents: 'none' }}>
                        {t('home.viewReport')}
                    </Button>
                </Stack>
            </Box>
        </Card>
    )
}

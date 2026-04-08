import React from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import ShareIcon from '@mui/icons-material/Share'
import EmailIcon from '@mui/icons-material/Email'
import PublicIcon from '@mui/icons-material/Public'
import { useTranslation } from 'react-i18next'
import BrandLogo from './BrandLogo'

export default function Footer() {
    const { t } = useTranslation()

    const cols = [
        {
            title: t('footer.platform'),
            links: [
                { label: t('footer.statisticsSearch'), to: '/' },
                { label: t('footer.globalReports'), to: '/reports' },
                { label: t('footer.sectors'), to: '/sectors' },
                { label: t('footer.pricing'), to: '/pricing' },
                { label: t('footer.blog'), to: '/blog' },
                { label: t('footer.methodology'), to: '/#methodology' },
                { label: t('footer.corporate'), to: '/#corporate' },
                { label: t('nav.myReports'), to: '/my-reports' },
            ],
        },
        {
            title: t('footer.company'),
            links: [
                { label: t('footer.about'), to: '/#corporate' },
                { label: t('footer.methodology'), to: '/#methodology' },
                { label: t('footer.careers'), to: '/#corporate' },
                { label: t('footer.contact'), to: '/#corporate' },
            ],
        },
        {
            title: t('footer.legal'),
            links: [
                { label: t('footer.terms'), to: '/terms' },
                { label: t('footer.privacy'), to: '/privacy' },
                { label: t('footer.license'), to: '/terms' },
            ],
        },
    ]

    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: '1px solid #dde1e9', py: 6 }}>
            <Box sx={{ maxWidth: 1440, mx: 'auto', px: 3 }}>
                <Grid container spacing={6} sx={{ mb: 6 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ mb: 2 }}>
                            <BrandLogo />
                        </Box>
                        <Typography component="p" className="typography-premium-small" color="text.secondary" sx={{ mb: 1.5 }}>
                            {t('footer.blurb')}
                        </Typography>
                        <Typography component="p" variant="caption" color="text.secondary" className="typography-premium-micro" sx={{ mb: 3, display: 'block' }}>
                            {t('footer.aemLine')}
                        </Typography>
                        <Stack direction="row" gap={1}>
                            <IconButton size="small" color="default" aria-label="Share"><ShareIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="default" aria-label="Email"><EmailIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="default" aria-label="Web"><PublicIcon fontSize="small" /></IconButton>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Grid container spacing={4}>
                            {cols.map(col => (
                                <Grid key={col.title} size={{ xs: 6, sm: 4 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>{col.title}</Typography>
                                    <Stack spacing={1}>
                                        {col.links.map(link => (
                                            <Box
                                                key={link.label}
                                                component={Link}
                                                to={link.to}
                                                sx={{ fontSize: '0.875rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'secondary.main' } }}
                                            >
                                                {link.label}
                                            </Box>
                                        ))}
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
                <Divider sx={{ mb: 4 }} />
                <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                    {t('footer.copyright')}
                </Typography>
            </Box>
        </Box>
    )
}

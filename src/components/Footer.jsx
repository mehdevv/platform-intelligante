import React from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import StorageIcon from '@mui/icons-material/Storage'
import ShareIcon from '@mui/icons-material/Share'
import EmailIcon from '@mui/icons-material/Email'
import PublicIcon from '@mui/icons-material/Public'

export default function Footer() {
    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: '1px solid #e2e8f0', py: 6 }}>
            <Box sx={{ maxWidth: 1440, mx: 'auto', px: 3 }}>
                <Grid container spacing={6} sx={{ mb: 6 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                            <StorageIcon color="primary" />
                            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.25rem', color: 'primary.main', fontWeight: 700 }}>DataVault</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                            The world's most comprehensive platform for verified market intelligence and industrial statistics.
                        </Typography>
                        <Stack direction="row" gap={1}>
                            <IconButton size="small" color="default"><ShareIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="default"><EmailIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="default"><PublicIcon fontSize="small" /></IconButton>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Grid container spacing={4}>
                            {[
                                { title: 'Platform', links: [{ label: 'Statistics Search', to: '/' }, { label: 'Global Reports', to: '/reports' }, { label: 'Sectors', to: '/sectors' }, { label: 'Pricing', to: '/pricing' }] },
                                { title: 'Company', links: [{ label: 'About Us' }, { label: 'Methodology' }, { label: 'Careers' }, { label: 'Contact' }] },
                                { title: 'Legal', links: [{ label: 'Terms of Service' }, { label: 'Privacy Policy' }, { label: 'License Info' }] },
                            ].map(col => (
                                <Grid key={col.title} size={{ xs: 6, sm: 4 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>{col.title}</Typography>
                                    <Stack spacing={1}>
                                        {col.links.map(link => (
                                            <Box
                                                key={link.label}
                                                component={link.to ? Link : 'a'}
                                                to={link.to}
                                                href={link.to ? undefined : '#'}
                                                sx={{ fontSize: '0.875rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
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
                    © 2024 DataVault Intelligence Inc. All rights reserved.
                </Typography>
            </Box>
        </Box>
    )
}

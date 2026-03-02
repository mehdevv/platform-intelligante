import React from 'react'
import { Link, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import LinearProgress from '@mui/material/LinearProgress'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PublicIcon from '@mui/icons-material/Public'
import DownloadIcon from '@mui/icons-material/Download'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function SectorDetailPage() {
    const { id } = useParams()
    const name = id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Technology'

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 4, pt: 12 }}>
                <Breadcrumbs sx={{ mb: 3, fontSize: '0.875rem' }}>
                    <Box component={Link} to="/" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Home</Box>
                    <Box component={Link} to="/sectors" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Sectors</Box>
                    <Typography variant="body2" color="text.primary" fontWeight={600}>{name}</Typography>
                </Breadcrumbs>

                {/* Hero */}
                <Card sx={{ p: 4, mb: 4 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={3}>
                        <Stack direction="row" gap={3} alignItems="flex-start">
                            <Box sx={{ width: 80, height: 80, bgcolor: 'rgba(0,51,153,0.08)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 40 }}>chip_extraction</span>
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ mb: 1 }}>{name} Sector</Typography>
                                <Typography color="text.secondary" sx={{ maxWidth: 640, lineHeight: 1.7 }}>Analyzing the global shift towards AI, Cloud Computing, Edge infrastructure, and next-gen SaaS solutions.</Typography>
                                <Stack direction="row" gap={3} sx={{ mt: 2 }}>
                                    <Stack direction="row" alignItems="center" gap={0.5}><CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} /><Typography variant="caption" color="text.secondary">Last updated: Oct 2023</Typography></Stack>
                                    <Stack direction="row" alignItems="center" gap={0.5}><PublicIcon sx={{ fontSize: 14, color: 'text.secondary' }} /><Typography variant="caption" color="text.secondary">Global Market</Typography></Stack>
                                </Stack>
                            </Box>
                        </Stack>
                        <Button variant="outlined" startIcon={<BookmarkBorderIcon />} sx={{ whiteSpace: 'nowrap' }}>Follow Sector</Button>
                    </Stack>
                </Card>

                {/* KPIs */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {[
                        { label: 'Market Size ($B)', value: '$5,200B', change: '+8.2%', pct: 85 },
                        { label: 'Annual Growth (%)', value: '12.4%', change: '+1.5%', pct: 65 },
                        { label: 'Key Segments', value: 'AI, SaaS, Fintech', change: null, pct: null },
                        { label: '2025 Forecast', value: '+15.2%', change: '+2.1%', pct: 92 },
                    ].map((kpi, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                            <Card sx={{ p: 3 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{kpi.label}</Typography>
                                <Stack direction="row" alignItems="baseline" gap={1}>
                                    <Typography variant={i === 2 ? 'h6' : 'h4'}>{kpi.value}</Typography>
                                    {kpi.change && <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>{kpi.change}</Typography>}
                                </Stack>
                                {kpi.pct !== null && <LinearProgress variant="determinate" value={kpi.pct} sx={{ mt: 2, height: 4, borderRadius: 2 }} />}
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Charts */}
                <Grid container spacing={4} sx={{ mb: 6 }}>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card sx={{ p: 4, height: '100%' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                                <Typography variant="subtitle1">Market Evolution (5Y)</Typography>
                                <Stack direction="row" gap={2}>
                                    <Stack direction="row" alignItems="center" gap={0.5}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} /><Typography variant="caption">Revenue</Typography></Stack>
                                    <Stack direction="row" alignItems="center" gap={0.5}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#cbd5e1' }} /><Typography variant="caption">Proj.</Typography></Stack>
                                </Stack>
                            </Stack>
                            <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 0.5, pb: 4, borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                                {[{ y: '2020', h: 40 }, { y: '2021', h: 52 }, { y: '2022', h: 65 }, { y: '2023', h: 80 }, { y: '2024*', h: 95 }].map((bar, i) => (
                                    <Box key={i} sx={{ flex: 1, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        <Box sx={{ width: 16, bgcolor: 'rgba(0,51,153,0.2)', borderRadius: '4px 4px 0 0', height: `${bar.h}%`, '&:hover': { bgcolor: 'rgba(0,51,153,0.4)' }, transition: 'all 0.2s' }} />
                                        <Typography variant="caption" sx={{ position: 'absolute', bottom: -24, fontSize: '0.625rem', color: i === 4 ? 'primary.main' : 'text.secondary', fontWeight: i === 4 ? 700 : 400 }}>{bar.y}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card sx={{ p: 4, height: '100%' }}>
                            <Typography variant="subtitle1" sx={{ mb: 4 }}>Segment Split</Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-around" gap={4}>
                                <Box sx={{ position: 'relative', width: 192, height: 192 }}>
                                    <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '18px solid #f1f5f9' }} />
                                    <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '18px solid', borderColor: 'primary.main', borderLeftColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: 'transparent', transform: 'rotate(45deg)' }} />
                                    <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '18px solid #60a5fa', borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: 'transparent', transform: 'rotate(-12deg)' }} />
                                    <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0 }}>
                                        <Typography variant="h5">100%</Typography>
                                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary' }}>Total Share</Typography>
                                    </Stack>
                                </Box>
                                <Stack spacing={1.5}>
                                    {[
                                        { color: '#003399', label: 'Cloud & Infrastructure (42%)' },
                                        { color: '#60a5fa', label: 'Software & SaaS (28%)' },
                                        { color: '#94a3b8', label: 'Hardware & Edge (18%)' },
                                        { color: '#e2e8f0', label: 'Other Services (12%)' },
                                    ].map((seg, i) => (
                                        <Stack key={i} direction="row" alignItems="center" gap={1.5}>
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: seg.color }} />
                                            <Typography variant="body2" color="text.secondary">{seg.label}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>

                {/* Related Reports */}
                <Box sx={{ mb: 8 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                        <Box>
                            <Typography variant="h5" sx={{ mb: 0.5 }}>Top {name} Reports</Typography>
                            <Typography variant="body2" color="text.secondary">Our latest proprietary research and market intelligence.</Typography>
                        </Box>
                        <Button component={Link} to="/reports" endIcon={<ArrowForwardIcon />} size="small">View All Reports</Button>
                    </Stack>
                    <Grid container spacing={4}>
                        {[
                            { title: '2024 AI Adoption Trends: Enterprise Strategy', tag: 'Research', date: 'October 12, 2023', size: '2.4MB PDF' },
                            { title: 'The Future of Quantum Computing & Cryptography', tag: 'Analysis', date: 'September 28, 2023', size: '1.8MB PDF' },
                            { title: 'SaaS 2.0: Verticalization of Software Markets', tag: 'Forecast', date: 'October 05, 2023', size: '4.1MB PDF' },
                        ].map((r, i) => (
                            <Grid key={i} size={{ xs: 12, md: 4 }}>
                                <Card component={Link} to="/reports/1" sx={{ textDecoration: 'none', '&:hover .report-title': { color: 'primary.main' } }}>
                                    <Box sx={{ height: 192, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #003399, #1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 60, color: 'rgba(255,255,255,0.1)' }}>analytics</span>
                                        <Chip label={r.tag} size="small" sx={{ position: 'absolute', top: 12, left: 12, bgcolor: r.tag === 'Research' ? 'primary.main' : r.tag === 'Analysis' ? '#059669' : '#d97706', color: '#fff' }} />
                                    </Box>
                                    <CardContent>
                                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', fontWeight: 700 }}>{r.date}</Typography>
                                        <Typography className="report-title" variant="subtitle1" sx={{ my: 1, transition: 'color 0.2s', color: 'text.primary' }}>{r.title}</Typography>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" alignItems="center" gap={0.5}><DownloadIcon sx={{ fontSize: 16, color: 'text.secondary' }} /><Typography variant="caption" color="text.secondary">{r.size}</Typography></Stack>
                                            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'primary.main' }}><Typography variant="body2" fontWeight={700}>Read Now</Typography><OpenInNewIcon sx={{ fontSize: 14 }} /></Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Premium CTA */}
                <Box sx={{ bgcolor: 'primary.main', borderRadius: 4, p: { xs: 4, md: 8 }, mb: 6, position: 'relative', overflow: 'hidden' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" gap={5}>
                        <Box sx={{ maxWidth: 560, position: 'relative', zIndex: 1 }}>
                            <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}>Unlock Deeper Insights</Typography>
                            <Typography sx={{ color: 'rgba(191,219,254,1)', fontSize: '1.125rem', mb: 4, lineHeight: 1.7 }}>
                                Get the full {name} Insights Dashboard for real-time tracking, custom data filtering, and proprietary benchmarking.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                                <Button component={Link} to="/pricing" variant="contained" sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#f0f4ff' }, px: 4, py: 1.5 }}>Upgrade to Pro</Button>
                                <Button variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, px: 4, py: 1.5 }}>Request a Demo</Button>
                            </Stack>
                        </Box>
                    </Stack>
                </Box>
            </Container>
            <Footer />
        </Box>
    )
}

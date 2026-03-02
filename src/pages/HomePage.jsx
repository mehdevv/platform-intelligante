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
import SearchIcon from '@mui/icons-material/Search'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ScheduleIcon from '@mui/icons-material/Schedule'
import StorageIcon from '@mui/icons-material/Storage'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import Header from '../components/Header'
import Footer from '../components/Footer'

const topics = [
    { label: 'Economy', icon: 'payments' },
    { label: 'Technology', icon: 'memory' },
    { label: 'Health', icon: 'health_and_safety' },
    { label: 'Society', icon: 'groups' },
    { label: 'Environment', icon: 'eco' },
    { label: 'Commerce', icon: 'shopping_cart' },
]

const reports = [
    { title: 'Global Retail Forecast 2025', desc: 'Digital Commerce Trends: A Global Outlook 2024-2025', icon: 'analytics', pages: 142 },
    { title: 'State of the Cloud Industry', desc: 'Enterprise Cloud Infrastructure & SaaS Spending Report', icon: 'cloud', pages: 89 },
    { title: 'Automation Index 2024', desc: 'Industrial Automation: Robotics & AI Integration Roadmap', icon: 'precision_manufacturing', pages: 215 },
    { title: 'EV Adoption Statistics', desc: 'Global Electric Vehicle Market Infrastructure & Policy 2024', icon: 'electric_car', pages: 56 },
]

export default function HomePage() {
    return (
        <Box sx={{ bgcolor: 'background.paper', fontFamily: '"Public Sans", sans-serif' }}>
            <Header />
            <Box component="main" sx={{ pt: '64px' }}>
                {/* Hero */}
                <Box sx={{ position: 'relative', py: { xs: 10, md: 14 }, overflow: 'hidden', bgcolor: 'primary.main' }}>
                    <Box sx={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
                        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 600, height: 600, bgcolor: '#60a5fa', borderRadius: '50%', filter: 'blur(120px)', mr: -6, mt: -6 }} />
                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 400, height: 400, bgcolor: '#93c5fd', borderRadius: '50%', filter: 'blur(100px)', ml: -3, mb: -3 }} />
                    </Box>
                    <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: '2.25rem', md: '3.75rem' }, mb: 3, lineHeight: 1.1 }}>
                            Find the statistics you need
                        </Typography>
                        <Typography sx={{ color: 'rgba(191,219,254,1)', fontSize: '1.125rem', mb: 5, maxWidth: 640, mx: 'auto' }}>
                            Access over 1.2 million statistics across 80,000 verified sources and 170 industry verticals.
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1, maxWidth: 640, mx: 'auto', bgcolor: '#fff', p: 1, borderRadius: 3, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <TextField
                                fullWidth
                                placeholder="What data are you looking for today?"
                                variant="standard"
                                slotProps={{ input: { disableUnderline: true, startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                                sx={{ px: 2, py: 0.5 }}
                            />
                            <Button variant="contained" color="secondary" sx={{ px: 4, whiteSpace: 'nowrap', borderRadius: 2 }}>Search</Button>
                        </Box>
                        <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} sx={{ mt: 4 }}>
                            <Typography sx={{ color: 'rgba(191,219,254,1)', fontSize: '0.875rem', pt: 0.5 }}>Popular:</Typography>
                            {['GDP Growth', 'Inflation 2024', 'E-commerce', 'AI Trends', 'Sustainability'].map(tag => (
                                <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }} />
                            ))}
                        </Stack>
                    </Container>
                </Box>

                {/* Stats Ticker */}
                <Box sx={{ bgcolor: '#0f172a', color: '#fff', py: 1.5, overflow: 'hidden', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
                    <Box className="ticker-scroll">
                        {[0, 1].map(set => (
                            <Box key={set} sx={{ display: 'flex', alignItems: 'center', gap: 6, px: 4, flexShrink: 0 }}>
                                {[
                                    { label: 'Statistics', value: '1.2M+' },
                                    { label: 'Verified Sources', value: '80k+' },
                                    { label: 'Industries', value: '170+' },
                                    { label: 'Forecasts', value: '450k+' },
                                    { label: 'Data Points', value: '3.8M+' },
                                    { label: 'Countries', value: '195' },
                                ].map((stat, i) => (
                                    <Stack key={i} direction="row" alignItems="center" gap={1.5} sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                                        <Typography sx={{ color: 'primary.main', fontWeight: 900, fontSize: '1.25rem' }}>{stat.value}</Typography>
                                        <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{stat.label}</Typography>
                                    </Stack>
                                ))}
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Featured Statistics */}
                <Container maxWidth="xl" sx={{ py: 10 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} sx={{ mb: 5 }}>
                        <Box>
                            <Typography variant="h4" sx={{ mb: 1 }}>Featured Statistics</Typography>
                            <Typography color="text.secondary">Most relevant data points trending this week</Typography>
                        </Box>
                        <Button component={Link} to="/reports" endIcon={<ArrowForwardIcon />} sx={{ color: 'primary.main', fontWeight: 700 }}>View all data</Button>
                    </Stack>
                    <Grid container spacing={4}>
                        {[
                            { tag: 'Economy', title: 'Global GDP growth projections for 2024 by region', premium: true, source: 'IMF & World Bank', date: 'May 2024' },
                            { tag: 'Technology', title: 'Generative AI market size worldwide 2023-2030', premium: true, source: 'Gartner Analysis', date: 'June 2024' },
                            { tag: 'Sustainability', title: 'Global share of renewable energy in total capacity', premium: false, source: 'IRENA Stats', date: 'April 2024' },
                        ].map((stat, i) => (
                            <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
                                <Card sx={{ p: 3, height: '100%' }}>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                                        <Chip label={stat.tag} size="small" sx={{ bgcolor: 'rgba(0,51,153,0.1)', color: 'primary.main' }} />
                                        {stat.premium ? (
                                            <Chip icon={<WorkspacePremiumIcon sx={{ fontSize: 14 }} />} label="Premium" size="small" sx={{ bgcolor: 'rgba(212,175,55,0.1)', color: '#d4af37' }} />
                                        ) : (
                                            <Chip label="Free" size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b' }} />
                                        )}
                                    </Stack>
                                    <Typography variant="subtitle1" sx={{ mb: 3, minHeight: 56, lineHeight: 1.4 }}>{stat.title}</Typography>
                                    <Box sx={{ height: 96, display: 'flex', alignItems: 'end', gap: 0.5, mb: 3 }}>
                                        {[40, 65, 90, 50, 35].map((h, j) => (
                                            <Box key={j} sx={{ flex: 1, bgcolor: j === 2 ? 'primary.main' : `rgba(0,51,153,${0.15 + j * 0.1})`, borderRadius: '4px 4px 0 0', height: `${h}%` }} />
                                        ))}
                                    </Box>
                                    <Stack direction="row" justifyContent="space-between" sx={{ borderTop: '1px solid #f1f5f9', pt: 2 }}>
                                        <Stack direction="row" alignItems="center" gap={0.5}>
                                            <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">{stat.date}</Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" gap={0.5}>
                                            <StorageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">{stat.source}</Typography>
                                        </Stack>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>

                {/* Popular Topics */}
                <Box sx={{ bgcolor: '#f1f5f9', py: 10 }}>
                    <Container maxWidth="xl">
                        <Typography variant="h4" textAlign="center" sx={{ mb: 6 }}>Explore Popular Topics</Typography>
                        <Grid container spacing={3}>
                            {topics.map(topic => (
                                <Grid key={topic.label} size={{ xs: 6, md: 4, lg: 2 }}>
                                    <Card component={Link} to="/sectors" sx={{ textDecoration: 'none', p: 3, textAlign: 'center', '&:hover .topic-icon': { bgcolor: 'primary.main', color: '#fff' } }}>
                                        <Box className="topic-icon" sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(0,51,153,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, transition: 'all 0.2s', color: 'primary.main' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 30 }}>{topic.icon}</span>
                                        </Box>
                                        <Typography variant="subtitle2" color="text.primary">{topic.label}</Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                {/* Latest Reports */}
                <Container maxWidth="xl" sx={{ py: 10 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} sx={{ mb: 5 }}>
                        <Box>
                            <Typography variant="h4" sx={{ mb: 1 }}>Latest Industry Reports</Typography>
                            <Typography color="text.secondary">Comprehensive analysis from leading research firms</Typography>
                        </Box>
                        <Button component={Link} to="/reports" endIcon={<ArrowForwardIcon />} sx={{ color: 'primary.main', fontWeight: 700 }}>Browse all reports</Button>
                    </Stack>
                    <Grid container spacing={3}>
                        {reports.map((report, i) => (
                            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                                <Card component={Link} to="/reports/1" sx={{ textDecoration: 'none', '&:hover .report-preview': { opacity: 1, transform: 'scale(1)' } }}>
                                    <Box sx={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #003399, #1e3a8a)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'rgba(255,255,255,0.15)', marginBottom: 16 }}>{report.icon}</span>
                                        <Box sx={{ height: 4, width: 48, bgcolor: 'secondary.main', mb: 2, borderRadius: 1 }} />
                                        <Typography sx={{ color: '#fff', fontWeight: 900, lineHeight: 1.3, fontSize: '0.95rem' }}>{report.title}</Typography>
                                        <Box className="report-preview" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 2, opacity: 0, transform: 'scale(0.95)', transition: 'all 0.3s' }}>
                                            <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700, mb: 1 }}>PDF • {report.pages} Pages</Typography>
                                            <Button variant="contained" size="small" fullWidth>Quick Preview</Button>
                                        </Box>
                                    </Box>
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.primary" sx={{ lineHeight: 1.5 }}>{report.desc}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>

                {/* Premium CTA */}
                <Container maxWidth="xl" sx={{ mb: 10 }}>
                    <Box sx={{ bgcolor: 'primary.main', borderRadius: 4, p: { xs: 4, md: 8 }, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 6, boxShadow: '0 25px 50px -12px rgba(0,51,153,0.25)' }}>
                        <Box sx={{ position: 'relative', zIndex: 10, maxWidth: 640 }}>
                            <Typography variant="h3" sx={{ color: '#fff', mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>Get unlimited access to all verified data</Typography>
                            <Typography sx={{ color: 'rgba(191,219,254,1)', fontSize: '1.125rem', mb: 4, lineHeight: 1.7 }}>
                                Join 2.5 million professionals using DataVault to make better business decisions.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                                <Button component={Link} to="/pricing" variant="contained" color="secondary" size="large" sx={{ px: 5, py: 1.5, fontSize: '1rem' }}>Start free trial</Button>
                                <Button component={Link} to="/pricing" variant="outlined" size="large" sx={{ px: 5, py: 1.5, fontSize: '1rem', color: '#fff', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.5)' } }}>View Pricing</Button>
                            </Stack>
                        </Box>
                        <Grid container spacing={2} sx={{ position: 'relative', zIndex: 10, maxWidth: 320 }}>
                            {[{ v: '1M+', l: 'Charts' }, { v: 'XLS', l: 'Downloads' }, { v: 'API', l: 'Access' }, { v: '24/7', l: 'Support' }].map((item, i) => (
                                <Grid key={i} size={6}>
                                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.2)' }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', mb: 0.5 }}>{item.v}</Typography>
                                        <Typography sx={{ color: 'rgba(191,219,254,1)', fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>{item.l}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Container>
            </Box>
            <Footer />
        </Box>
    )
}

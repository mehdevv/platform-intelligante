import React from 'react'
import { Link } from 'react-router-dom'
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
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import LockIcon from '@mui/icons-material/Lock'
import StarIcon from '@mui/icons-material/Star'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TableChartIcon from '@mui/icons-material/TableChart'
import UpdateIcon from '@mui/icons-material/Update'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import ListAltIcon from '@mui/icons-material/ListAlt'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function ReportDetailPage() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 4, pt: 12 }}>
                <Breadcrumbs sx={{ mb: 3, fontSize: '0.875rem' }}>
                    <Box component={Link} to="/" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Home</Box>
                    <Box component={Link} to="/reports" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Reports</Box>
                    <Typography variant="body2" color="text.primary" fontWeight={600}>Retail</Typography>
                </Breadcrumbs>

                <Grid container spacing={6}>
                    {/* Main */}
                    <Grid size={{ xs: 12, lg: 7 }}>
                        <Stack spacing={5}>
                            {/* Header */}
                            <Box>
                                <Stack direction="row" gap={1} sx={{ mb: 2 }}>
                                    <Chip label="Premium" size="small" color="primary" />
                                    <Chip label="Retail" size="small" variant="outlined" color="primary" />
                                    <Chip label="Global Tech" size="small" variant="outlined" color="primary" />
                                </Stack>
                                <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: '1.75rem', sm: '2.5rem' }, lineHeight: 1.2 }}>Digital Commerce 2024: Global Trends</Typography>
                                <Typography variant="h6" color="text.secondary" fontWeight={300} sx={{ lineHeight: 1.6 }}>
                                    A comprehensive analysis of the evolving retail landscape, digital acceleration, and consumer behavior shifts across 45 markets.
                                </Typography>
                            </Box>
                            <Divider />

                            {/* Executive Summary */}
                            <Box>
                                <Typography variant="h5" sx={{ mb: 2 }}>Executive Summary</Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                                    As we navigate through 2024, the digital commerce sector is witnessing its most significant transformation since the 2020 acceleration.
                                </Typography>
                                <Grid container spacing={2}>
                                    {[
                                        { title: 'Market Growth', desc: 'Global e-commerce projected to hit $6.8 trillion, a 12% YoY increase.' },
                                        { title: 'AI Adoption', desc: '84% of leading retailers have integrated predictive AI into supply chains.' },
                                        { title: 'Mobile Dominance', desc: 'Mobile-first transactions now account for 74.2% in emerging markets.' },
                                        { title: 'Sustainability', desc: 'Circular economy features grew 3x faster than traditional retail.' },
                                    ].map((item, i) => (
                                        <Grid key={i} size={{ xs: 12, md: 6 }}>
                                            <Card variant="outlined" sx={{ p: 2, borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
                                                <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>{item.title}</Typography>
                                                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            {/* TOC */}
                            <Paper variant="outlined" sx={{ p: 4 }}>
                                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
                                    <ListAltIcon color="primary" />
                                    <Typography variant="subtitle1">Table of Contents</Typography>
                                </Stack>
                                <Stack spacing={1.5}>
                                    {[
                                        { ch: '1. Global Economic Overview', page: 'Page 4' },
                                        { ch: '2. Regional Analysis: North America & EMEA', page: 'Page 18' },
                                        { ch: '3. The Rise of Social Commerce in APAC', page: 'Page 34' },
                                        { ch: '4. Data Insight: Revenue Metrics by Vertical', page: 'Page 52' },
                                        { ch: '5. Predictive Modeling for 2025-2027', page: 'Page 71' },
                                    ].map((item, i) => (
                                        <Stack key={i} direction="row" justifyContent="space-between" sx={{ borderBottom: '1px dashed #e2e8f0', pb: 1 }}>
                                            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{item.ch}</Typography>
                                            <Typography variant="caption" color="text.secondary" fontStyle="italic">{item.page}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>

                            {/* Data Charts */}
                            <Box>
                                <Typography variant="h5" sx={{ mb: 3 }}>Data Insights</Typography>
                                <Card sx={{ p: 3, mb: 4 }}>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
                                        <Box>
                                            <Typography variant="subtitle2">E-commerce Growth by Region (2023-2024)</Typography>
                                            <Typography variant="caption" color="text.secondary" fontStyle="italic">Values in percentage (%)</Typography>
                                        </Box>
                                    </Stack>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 192 }}>
                                        {[{ l: 'NA', h1: 40, h2: 55 }, { l: 'EMEA', h1: 35, h2: 45 }, { l: 'APAC', h1: 60, h2: 85 }, { l: 'LATAM', h1: 45, h2: 65 }, { l: 'MENA', h1: 30, h2: 42 }].map((bar, i) => (
                                            <Box key={i} sx={{ flex: 1, position: 'relative', height: '100%' }}>
                                                <Box sx={{ position: 'absolute', bottom: 0, width: '100%', bgcolor: 'primary.main', borderRadius: '4px 4px 0 0', height: `${bar.h2}%`, transition: 'all 0.3s' }} />
                                                <Box sx={{ position: 'absolute', bottom: 0, width: '100%', bgcolor: 'rgba(0,51,153,0.2)', borderRadius: '4px 4px 0 0', height: `${bar.h1}%` }} />
                                                <Typography variant="caption" sx={{ position: 'absolute', bottom: -20, width: '100%', textAlign: 'center', fontWeight: 600 }}>{bar.l}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Card>

                                {/* Paywall */}
                                <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                    <Box sx={{ p: 3, pb: 1 }}>
                                        <Typography variant="subtitle2">Detailed Revenue Metrics by Vertical</Typography>
                                        <Typography variant="caption" color="text.secondary">Comparative data for FY 2023 vs FY 2024</Typography>
                                    </Box>
                                    <Box sx={{ p: 3, filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.5 }}>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead><TableRow><TableCell>Vertical</TableCell><TableCell>Market Cap</TableCell><TableCell>YoY Growth</TableCell><TableCell>Conversion</TableCell></TableRow></TableHead>
                                                <TableBody>
                                                    <TableRow><TableCell sx={{ fontWeight: 700 }}>Fashion</TableCell><TableCell>$1.2T</TableCell><TableCell sx={{ color: 'success.main' }}>+8.4%</TableCell><TableCell>3.2%</TableCell></TableRow>
                                                    <TableRow><TableCell sx={{ fontWeight: 700 }}>Electronics</TableCell><TableCell>$890B</TableCell><TableCell sx={{ color: 'success.main' }}>+12.1%</TableCell><TableCell>1.8%</TableCell></TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                    <Box sx={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                                        <Paper elevation={8} sx={{ p: 4, textAlign: 'center', maxWidth: 360, borderRadius: 4 }}>
                                            <Box sx={{ width: 48, height: 48, bgcolor: 'rgba(0,51,153,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                                <LockIcon color="primary" />
                                            </Box>
                                            <Typography variant="h6" sx={{ mb: 1 }}>Unlock Detailed Data</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>Access the full dataset including granular vertical splits and raw CSV exports.</Typography>
                                            <Button component={Link} to="/pricing" fullWidth variant="contained" startIcon={<StarIcon />} sx={{ py: 1.5 }}>Upgrade to Premium</Button>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>Available on Professional and Enterprise plans</Typography>
                                        </Paper>
                                    </Box>
                                </Box>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Sidebar */}
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <Box sx={{ position: 'sticky', top: '5rem' }}>
                            <Stack spacing={3}>
                                <Card sx={{ overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: 'rgba(0,51,153,0.03)', p: 3, borderBottom: '1px solid #f1f5f9' }}>
                                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary' }}>Standard Price</Typography>
                                        <Stack direction="row" alignItems="baseline" gap={0.5}>
                                            <Typography variant="h3">$499</Typography>
                                            <Typography variant="body2" color="text.secondary">/ report</Typography>
                                        </Stack>
                                    </Box>
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack spacing={2}>
                                            <Button fullWidth variant="contained" size="large" sx={{ py: 1.5 }}>Subscribe to Download</Button>
                                            <Typography variant="caption" color="text.secondary" textAlign="center">Starts at $1,200/yr (includes all reports)</Typography>
                                            <Button fullWidth variant="outlined" size="large" sx={{ py: 1.5 }}>Buy Individual Report</Button>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="subtitle2">What's included:</Typography>
                                            <Stack spacing={2}>
                                                {[
                                                    { icon: <PictureAsPdfIcon color="primary" fontSize="small" />, text: 'Full 124-page PDF Report' },
                                                    { icon: <TableChartIcon color="primary" fontSize="small" />, text: 'Raw Data (Excel / CSV)' },
                                                    { icon: <UpdateIcon color="primary" fontSize="small" />, text: '12-month data updates' },
                                                    { icon: <SlideshowIcon color="primary" fontSize="small" />, text: 'Analyst Briefing Deck' },
                                                ].map((item, i) => (
                                                    <Stack key={i} direction="row" gap={1.5} alignItems="flex-start">
                                                        {item.icon}
                                                        <Typography variant="body2" color="text.secondary">{item.text}</Typography>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Need a custom cut?</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Our analysts can provide bespoke data extracts for your specific region or vertical.</Typography>
                                    <Button size="small" sx={{ fontWeight: 700 }}>Contact Analyst Services →</Button>
                                </Paper>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
            <Footer />
        </Box>
    )
}

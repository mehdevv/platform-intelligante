import React from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import SearchIcon from '@mui/icons-material/Search'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Header from '../components/Header'
import Footer from '../components/Footer'

const sectors = [
    { name: 'Technology', icon: 'devices', reports: 842, desc: 'In-depth data on hardware manufacturing, enterprise software, and global telecommunications trends.' },
    { name: 'Healthcare', icon: 'medical_services', reports: 615, desc: 'Comprehensive analysis of pharmaceuticals, medical device innovations, and clinical services.' },
    { name: 'Energy', icon: 'bolt', reports: 320, desc: 'Market trends in renewables, oil & gas extraction, and sustainable utility infrastructure.' },
    { name: 'Finance', icon: 'account_balance', reports: 504, desc: 'Detailed reports on global banking, insurance markets, and institutional investment strategies.' },
    { name: 'Retail', icon: 'shopping_bag', reports: 428, desc: 'Insights into consumer purchasing habits, e-commerce growth, and global logistics chains.' },
    { name: 'Manufacturing', icon: 'precision_manufacturing', reports: 215, desc: 'Data on industrial production volumes, automation trends, and robotics implementation.' },
    { name: 'Transportation', icon: 'directions_transit', reports: 189, desc: 'Market analysis for public transit, automotive sales, and freight transportation networks.' },
    { name: 'Real Estate', icon: 'apartment', reports: 345, desc: 'Commercial and residential property trends, urbanization statistics, and market valuations.' },
    { name: 'Education', icon: 'school', reports: 124, desc: 'Data on EdTech adoption, higher education enrollment, and professional training markets.' },
]

export default function SectorsListingPage() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 6, pt: 14 }}>
                <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto', mb: 6 }}>
                    <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>Explore Sectors</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '1.125rem' }}>Browse our comprehensive database by industry category to find specialized insights.</Typography>
                </Box>
                <Box sx={{ maxWidth: 640, mx: 'auto', mb: 8 }}>
                    <TextField
                        fullWidth
                        placeholder="Search for a sector (e.g., Technology, Healthcare...)"
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                            },
                        }}
                    />
                    <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} sx={{ mt: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', pt: 0.5 }}>Popular:</Typography>
                        {['AI & SaaS', 'FinTech', 'BioTech', 'Logistics'].map(t => (
                            <Chip key={t} label={t} size="small" variant="outlined" clickable sx={{ '&:hover': { bgcolor: 'rgba(0,51,153,0.05)', borderColor: 'primary.main', color: 'primary.main' } }} />
                        ))}
                    </Stack>
                </Box>
                <Grid container spacing={3}>
                    {sectors.map(s => (
                        <Grid key={s.name} size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card
                                component={Link}
                                to={`/sectors/${s.name.toLowerCase()}`}
                                sx={{
                                    textDecoration: 'none', p: 3, height: '100%', display: 'flex', flexDirection: 'column',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 60px -15px rgba(0,51,153,0.12)' },
                                    '&:hover .sector-icon': { transform: 'scale(1.1)' },
                                    transition: 'all 0.3s',
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                    <Box className="sector-icon" sx={{ p: 1.5, bgcolor: 'rgba(0,51,153,0.08)', borderRadius: 2, color: 'primary.main', transition: 'transform 0.2s' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 30 }}>{s.icon}</span>
                                    </Box>
                                    <Chip label={`${s.reports} Reports`} size="small" sx={{ bgcolor: 'rgba(0,51,153,0.05)', color: 'primary.main' }} />
                                </Stack>
                                <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>{s.name}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1, lineHeight: 1.7 }}>{s.desc}</Typography>
                                <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'primary.main' }}>
                                    <Typography variant="body2" fontWeight={700}>View Sector</Typography>
                                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                                </Stack>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
            <Footer />
        </Box>
    )
}

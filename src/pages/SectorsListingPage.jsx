import React, { useEffect, useState } from 'react'
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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import SearchIcon from '@mui/icons-material/Search'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

export default function SectorsListingPage() {
    const { supabase } = useAuth()
    const [sectors, setSectors] = useState([])
    const [filter, setFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase) {
                setLoading(false)
                return
            }
            const { data, error: e } = await supabase.from('sectors').select('*').eq('is_published', true).order('sort_order').order('name')
            if (cancelled) return
            if (e) setError(e.message)
            else setSectors(data || [])
            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase])

    const filtered = sectors.filter(s => !filter.trim() || s.name.toLowerCase().includes(filter.toLowerCase()) || s.slug.includes(filter.toLowerCase()))

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 6, pt: 14 }}>
                <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto', mb: 6 }}>
                    <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
                        Explore Sectors
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '1.125rem' }}>
                        Browse industries from your Researcha catalogue.
                    </Typography>
                </Box>
                <Box sx={{ maxWidth: 640, mx: 'auto', mb: 8 }}>
                    <TextField
                        fullWidth
                        placeholder="Filter sectors…"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress color="secondary" />
                    </Box>
                )}
                {error && <Alert severity="error">{error}</Alert>}
                {!loading && !filtered.length && <Alert severity="info">No published sectors yet. Create them in Admin → Sectors.</Alert>}
                <Grid container spacing={3}>
                    {filtered.map(s => (
                        <Grid key={s.id} size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card
                                component={Link}
                                to={`/sectors/${s.slug}`}
                                sx={{
                                    textDecoration: 'none',
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 60px -15px rgba(25,127,148,0.15)' },
                                    transition: 'all 0.3s',
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                    <Box sx={{ p: 1.5, bgcolor: 'rgba(25,127,148,0.08)', borderRadius: 2, color: 'secondary.main' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 30 }}>
                                            category
                                        </span>
                                    </Box>
                                    {s.featured && <Chip label="Featured" size="small" color="secondary" variant="outlined" />}
                                </Stack>
                                <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                                    {s.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1, lineHeight: 1.7 }}>
                                    {s.description || 'Open to see reports in this sector.'}
                                </Typography>
                                <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'secondary.main' }}>
                                    <Typography variant="body2" fontWeight={700}>
                                        View sector
                                    </Typography>
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

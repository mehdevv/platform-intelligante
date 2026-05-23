import React, { useEffect, useMemo, useState } from 'react'
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
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import SearchIcon from '@mui/icons-material/Search'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

export default function SectorsListingPage() {
    const { t } = useTranslation()
    const { supabase } = useAuth()
    const [sectors, setSectors] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase) {
                setLoading(false)
                return
            }
            setError('')
            const { data, error: e } = await supabase
                .from('sectors')
                .select('*')
                .eq('is_published', true)
                .order('sort_order')
                .order('name')
            if (cancelled) return
            if (e) setError(e.message)
            else setSectors(data || [])
            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase])

    const filteredSectors = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return sectors
        return sectors.filter(s => s.name.toLowerCase().includes(q) || s.slug.includes(q))
    }, [sectors, search])

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 6, pt: 14 }}>
                <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto', mb: 4 }}>
                    <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
                        {t('sectorsListing.title')}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '1.125rem' }}>
                        {t('sectorsListing.subtitle')}
                    </Typography>
                </Box>

                <Box sx={{ maxWidth: 480, mx: 'auto', mb: 5 }}>
                    <TextField
                        fullWidth
                        size="medium"
                        placeholder={t('sectorsListing.searchSectors')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
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
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {!loading && (
                    <>
                        {!filteredSectors.length && (
                            <Alert severity="info" sx={{ mb: 4 }}>
                                {t('sectorsListing.noSectorsMatch')}
                            </Alert>
                        )}
                        <Grid container spacing={3}>
                            {filteredSectors.map(s => (
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
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 20px 60px -15px rgba(25,127,148,0.15)',
                                            },
                                            transition: 'all 0.3s',
                                        }}
                                    >
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                            {s.icon_image_url ? (
                                                <Avatar src={s.icon_image_url} alt="" variant="rounded" sx={{ width: 56, height: 56 }} />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        bgcolor: 'rgba(25,127,148,0.08)',
                                                        borderRadius: 2,
                                                        color: 'secondary.main',
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: 30 }}>
                                                        category
                                                    </span>
                                                </Box>
                                            )}
                                            {s.featured && (
                                                <Chip label="Featured" size="small" color="secondary" variant="outlined" />
                                            )}
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
                    </>
                )}
            </Container>
            <Footer />
        </Box>
    )
}

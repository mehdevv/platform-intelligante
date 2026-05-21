import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Pagination from '@mui/material/Pagination'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StarIcon from '@mui/icons-material/Star'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { formatPriceFromCents } from '../lib/moneyFormat'
import { reportPublicPath } from '../lib/reportPath'

const drawerWidth = 280

function FiltersContent({ onClose }) {
    return (
        <Stack spacing={4}>
            {onClose && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Filters</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            )}
            <Typography variant="body2" color="text.secondary">
                Faceted filters will use sector and region columns when added to the schema.
            </Typography>
        </Stack>
    )
}

export default function ReportsListingPage() {
    const { supabase } = useAuth()
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase) {
                setLoading(false)
                return
            }
            const { data, error: e } = await supabase
                .from('reports')
                .select('id, slug, title, summary, status, price_cents, currency, published_at, thumbnail_image_url, sectors(name, slug, icon_image_url)')
                .eq('status', 'published')
                .order('published_at', { ascending: false, nullsFirst: false })
            if (cancelled) return
            if (e) setError(e.message)
            else setReports(data || [])
            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase])

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Drawer anchor="left" open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} PaperProps={{ sx: { width: 300, p: 3, pt: 4 } }}>
                <FiltersContent onClose={() => setMobileFiltersOpen(false)} />
            </Drawer>
            <Box sx={{ pt: 10, display: 'flex', maxWidth: '100%', px: { lg: 4 }, minHeight: '100vh' }}>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        display: { xs: 'none', lg: 'block' },
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            position: 'sticky',
                            top: 80,
                            height: 'calc(100vh - 80px)',
                            bgcolor: 'background.default',
                            borderRight: '1px solid #e2e8f0',
                            borderLeft: 'none',
                            p: 3,
                        },
                    }}
                >
                    <FiltersContent />
                </Drawer>

                <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, pl: { lg: 4 }, minWidth: 0 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} gap={2} sx={{ mb: 4 }}>
                        <Box>
                            <Breadcrumbs sx={{ mb: 1, fontSize: '0.75rem' }}>
                                <Box component={Link} to="/" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                                    Home
                                </Box>
                                <Typography variant="caption" color="text.primary" fontWeight={600}>
                                    Reports
                                </Typography>
                            </Breadcrumbs>
                            <Stack direction="row" alignItems="center" gap={2}>
                                <Typography variant="h4" sx={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                    Industry Reports
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<FilterListIcon />}
                                    onClick={() => setMobileFiltersOpen(true)}
                                    sx={{ display: { lg: 'none' }, whiteSpace: 'nowrap' }}
                                >
                                    Filters
                                </Button>
                            </Stack>
                        </Box>
                        <FormControl size="small">
                            <Select defaultValue="newest" sx={{ minWidth: 200 }}>
                                <MenuItem value="newest">Sort: Newest</MenuItem>
                                <MenuItem value="title">Sort: Title</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress color="secondary" />
                        </Box>
                    )}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {!loading && !reports.length && !error && (
                        <Alert severity="info">No published reports yet. Add sectors and reports from the admin catalogue.</Alert>
                    )}

                    <Grid container spacing={3}>
                        {reports.map(r => (
                            <Grid key={r.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
                                <Card
                                    component={Link}
                                    to={reportPublicPath(r)}
                                    sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column', '&:hover .report-title': { color: 'primary.main' } }}
                                >
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            aspectRatio: '4/3',
                                            overflow: 'hidden',
                                            background: 'linear-gradient(135deg, #4B5B72, #197F94)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {r.thumbnail_image_url && (
                                            <Box
                                                component="img"
                                                src={r.thumbnail_image_url}
                                                alt=""
                                                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        )}
                                        {!r.thumbnail_image_url && (
                                            <span className="material-symbols-outlined" style={{ fontSize: 60, color: 'rgba(255,255,255,0.15)' }}>
                                                analytics
                                            </span>
                                        )}
                                        <Stack direction="row" gap={1} sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                                            {r.sectors?.name && (
                                                <Chip
                                                    avatar={
                                                        r.sectors.icon_image_url ? (
                                                            <Avatar alt="" src={r.sectors.icon_image_url} sx={{ width: 22, height: 22 }} />
                                                        ) : undefined
                                                    }
                                                    label={r.sectors.name}
                                                    size="small"
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 700 }}
                                                />
                                            )}
                                        </Stack>
                                        {r.price_cents > 0 && (
                                            <Chip
                                                icon={<StarIcon sx={{ fontSize: 14 }} />}
                                                label="Paid"
                                                size="small"
                                                sx={{ position: 'absolute', top: 12, right: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
                                            />
                                        )}
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary', mb: 1 }}>
                                            {r.published_at ? new Date(r.published_at).toLocaleDateString() : 'Draft'}
                                        </Typography>
                                        <Typography className="report-title" variant="h6" sx={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 700, mb: 2, flexGrow: 1, color: 'text.primary' }}>
                                            {r.title}
                                        </Typography>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderTop: '1px solid #f1f5f9', pt: 2 }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                {r.price_cents > 0 ? formatPriceFromCents(r.price_cents, r.currency) : '—'}
                                            </Typography>
                                            <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />} variant="contained" sx={{ fontSize: '0.75rem' }}>
                                                View
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Stack alignItems="center" sx={{ mt: 8, mb: 4 }}>
                        <Pagination count={1} color="primary" shape="rounded" disabled />
                    </Stack>
                </Box>
            </Box>
        </Box>
    )
}

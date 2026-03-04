import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Pagination from '@mui/material/Pagination'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StarIcon from '@mui/icons-material/Star'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import Header from '../components/Header'

const drawerWidth = 280

const reports = [
    { title: 'Digital Commerce Trends 2024', sector: 'Retail', region: 'Global', date: 'January 2024', type: '42 Pages PDF', premium: true },
    { title: 'Renewable Energy Outlook', sector: 'Energy', region: 'Europe', date: 'December 2023', type: 'Interactive Data', premium: false },
    { title: 'Banking Sector Analysis Q3', sector: 'Finance', region: 'APAC', date: 'November 2023', type: 'Dataset Included', premium: true },
    { title: 'Global Logistics Report', sector: 'Logistics', region: 'Global', date: 'October 2023', type: '56 Pages PDF', premium: false },
    { title: 'AI in Healthcare 2024', sector: 'Healthcare', region: 'North America', date: 'September 2023', type: 'Interactive Visualization', premium: true },
    { title: 'Global Sustainability Index', sector: 'Sustainability', region: 'Global', date: 'August 2023', type: 'Excel Data Export', premium: false },
]

function FiltersContent({ onClose }) {
    return (
        <Stack spacing={4}>
            {onClose && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Filters</Typography>
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Stack>
            )}
            <Box>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary', mb: 2, display: onClose ? 'none' : 'block' }}>Filters</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, bgcolor: 'rgba(0,51,153,0.05)', borderRadius: 2, border: '1px solid rgba(0,51,153,0.1)' }}>
                    <Typography variant="body2" fontWeight={600} color="primary">Premium Only</Typography>
                    <Switch size="small" defaultChecked color="primary" />
                </Stack>
            </Box>
            <Box>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>Sector</Typography>
                {['Technology', 'Retail', 'Healthcare', 'Finance'].map(s => (
                    <FormControlLabel key={s} control={<Checkbox size="small" defaultChecked={s === 'Retail'} color="primary" />} label={<Typography variant="body2" color="text.secondary">{s}</Typography>} sx={{ display: 'flex' }} />
                ))}
            </Box>
            <Box>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>Region</Typography>
                {['Global', 'North America', 'Europe', 'APAC'].map(r => (
                    <FormControlLabel key={r} control={<Checkbox size="small" defaultChecked={r === 'Global'} color="primary" />} label={<Typography variant="body2" color="text.secondary">{r}</Typography>} sx={{ display: 'flex' }} />
                ))}
            </Box>
            <Box>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>Content Type</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {['PDF Report', 'Interactive', 'Dataset'].map((t, i) => (
                        <Chip key={t} label={t} size="small" clickable variant={i === 1 ? 'filled' : 'outlined'} color={i === 1 ? 'primary' : 'default'} />
                    ))}
                </Stack>
            </Box>
            <Button size="small" sx={{ alignSelf: 'flex-start', textDecoration: 'underline' }}>Clear All Filters</Button>
        </Stack>
    )
}

export default function ReportsListingPage() {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            {/* Mobile filter drawer */}
            <Drawer anchor="left" open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}
                PaperProps={{ sx: { width: 300, p: 3, pt: 4 } }}>
                <FiltersContent onClose={() => setMobileFiltersOpen(false)} />
            </Drawer>
            <Box sx={{ pt: 10, display: 'flex', maxWidth: '100%', px: { lg: 4 }, minHeight: '100vh' }}>
                {/* Sidebar — desktop permanent */}
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
                            p: 3
                        },
                    }}
                >
                    <FiltersContent />
                </Drawer>

                {/* Main Content */}
                <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, pl: { lg: 4 }, minWidth: 0 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} gap={2} sx={{ mb: 4 }}>
                        <Box>
                            <Breadcrumbs sx={{ mb: 1, fontSize: '0.75rem' }}>
                                <Box component={Link} to="/" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Home</Box>
                                <Typography variant="caption" color="text.primary" fontWeight={600}>Reports</Typography>
                            </Breadcrumbs>
                            <Stack direction="row" alignItems="center" gap={2}>
                                <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>Industry Reports</Typography>
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
                            <Select defaultValue="relevance" sx={{ minWidth: 200 }}>
                                <MenuItem value="relevance">Sort By: Relevance</MenuItem>
                                <MenuItem value="newest">Sort By: Newest First</MenuItem>
                                <MenuItem value="popular">Sort By: Popularity</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    <Grid container spacing={3}>
                        {reports.map((r, i) => (
                            <Grid key={i} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
                                <Card component={Link} to={`/reports/${i + 1}`} sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column', '&:hover .report-title': { color: 'primary.main' } }}>
                                    <Box sx={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'linear-gradient(135deg, #003399, #1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 60, color: 'rgba(255,255,255,0.1)' }}>analytics</span>
                                        <Stack direction="row" gap={1} sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                                            <Chip label={r.sector} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', color: 'primary.main', fontWeight: 700 }} />
                                            <Chip label={r.region} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', color: 'primary.main', fontWeight: 700 }} />
                                        </Stack>
                                        {r.premium && (
                                            <Chip icon={<StarIcon sx={{ fontSize: 14 }} />} label="Premium" size="small" sx={{ position: 'absolute', top: 12, right: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }} />
                                        )}
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary', mb: 1 }}>{r.date}</Typography>
                                        <Typography className="report-title" variant="h6" sx={{ fontFamily: '"Playfair Display", serif', mb: 2, transition: 'color 0.2s', color: 'text.primary', flexGrow: 1 }}>{r.title}</Typography>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderTop: '1px solid #f1f5f9', pt: 2 }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>{r.type}</Typography>
                                            <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />} variant="contained" sx={{ fontSize: '0.75rem' }}>View Report</Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Stack alignItems="center" sx={{ mt: 8, mb: 4 }}>
                        <Pagination count={12} color="primary" shape="rounded" />
                    </Stack>
                </Box>
            </Box>
        </Box>
    )
}

import React from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import LinearProgress from '@mui/material/LinearProgress'
import IconButton from '@mui/material/IconButton'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import StorageIcon from '@mui/icons-material/Storage'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PersonIcon from '@mui/icons-material/Person'
import DashboardIcon from '@mui/icons-material/Dashboard'
import BarChartIcon from '@mui/icons-material/BarChart'
import FolderIcon from '@mui/icons-material/Folder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import SettingsIcon from '@mui/icons-material/Settings'
import StarIcon from '@mui/icons-material/Star'
import DownloadIcon from '@mui/icons-material/Download'
import MoreVertIcon from '@mui/icons-material/MoreVert'

const drawerWidth = 240

const navItems = [
    { icon: <DashboardIcon fontSize="small" />, label: 'Overview', active: true },
    { icon: <BarChartIcon fontSize="small" />, label: 'Analytics' },
    { icon: <FolderIcon fontSize="small" />, label: 'My Reports' },
    { icon: <BookmarkIcon fontSize="small" />, label: 'Watchlist' },
    { icon: <SettingsIcon fontSize="small" />, label: 'Settings' },
]

export default function DashboardPage() {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Drawer variant="permanent" sx={{ width: drawerWidth, '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: '#0f172a', color: '#fff', borderRight: 'none' } }}>
                <Stack sx={{ height: '100%' }}>
                    <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 3, pb: 2 }}>
                        <StorageIcon sx={{ color: '#60a5fa' }} />
                        <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: '1.25rem' }}>DataVault</Typography>
                    </Stack>
                    <Stack spacing={0.5} sx={{ px: 1.5, mt: 2, flexGrow: 1 }}>
                        {navItems.map(item => (
                            <Button
                                key={item.label}
                                startIcon={item.icon}
                                fullWidth
                                sx={{
                                    justifyContent: 'flex-start', color: item.active ? '#fff' : '#94a3b8', px: 2, py: 1.2,
                                    bgcolor: item.active ? '#1e293b' : 'transparent', borderRadius: 2,
                                    '&:hover': { bgcolor: '#1e293b', color: '#fff' },
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Stack>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#1e293b', border: '1px solid rgba(148,163,184,0.1)' }}>
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#94a3b8' }}>Storage Used</Typography>
                            <LinearProgress variant="determinate" value={72} sx={{ mt: 1, mb: 1, height: 4, borderRadius: 2 }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>7.2 GB of 10 GB used</Typography>
                        </Box>
                    </Box>
                </Stack>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, ml: 0 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', h: 64, px: 4, py: 2, borderBottom: '1px solid #e2e8f0', bgcolor: 'background.paper' }}>
                    <Typography variant="h5">Welcome back, Alex</Typography>
                    <Stack direction="row" alignItems="center" gap={2}>
                        <IconButton><NotificationsIcon /></IconButton>
                        <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(0,51,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PersonIcon color="primary" fontSize="small" />
                        </Box>
                    </Stack>
                </Box>

                <Box sx={{ p: 4 }}>
                    {/* KPI Cards */}
                    <Grid container spacing={3} sx={{ mb: 5 }}>
                        {[
                            { label: 'Total Reports', value: '48', delta: '+3 this month', color: 'primary.main' },
                            { label: 'Active Watches', value: '12', delta: '2 alerts pending', color: 'secondary.main' },
                            { label: 'Data Credit', value: '2,450', delta: '/5,000 used', color: 'success.main' },
                            { label: 'Renewal', value: 'Dec 25', delta: 'Professional Plan', color: 'warning.main' },
                        ].map((kpi, i) => (
                            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                                <Card sx={{ p: 3, borderTop: `3px solid`, borderTopColor: kpi.color }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{kpi.label}</Typography>
                                    <Typography variant="h4" sx={{ mb: 0.5 }}>{kpi.value}</Typography>
                                    <Typography variant="caption" color="text.secondary">{kpi.delta}</Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Charts */}
                    <Grid container spacing={4} sx={{ mb: 5 }}>
                        <Grid size={{ xs: 12, lg: 7 }}>
                            <Card sx={{ p: 4, height: '100%' }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
                                    <Box><Typography variant="subtitle1">Market Comparison</Typography><Typography variant="caption" color="text.secondary">YoY revenue trends across selected sectors</Typography></Box>
                                    <Stack direction="row" gap={2} alignItems="center">
                                        <Stack direction="row" alignItems="center" gap={0.5}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} /><Typography variant="caption">2023</Typography></Stack>
                                        <Stack direction="row" alignItems="center" gap={0.5}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main' }} /><Typography variant="caption">2024</Typography></Stack>
                                    </Stack>
                                </Stack>
                                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 192 }}>
                                    {[{ l: 'Tech', h1: 60, h2: 85 }, { l: 'Finance', h1: 40, h2: 55 }, { l: 'Health', h1: 50, h2: 70 }, { l: 'Energy', h1: 35, h2: 65 }, { l: 'Retail', h1: 45, h2: 50 }].map((bar, i) => (
                                        <Box key={i} sx={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                                            <Box sx={{ flex: 1, bgcolor: 'primary.main', borderRadius: '4px 4px 0 0', height: `${bar.h1}%`, transition: 'all 0.3s' }} />
                                            <Box sx={{ flex: 1, bgcolor: 'secondary.main', borderRadius: '4px 4px 0 0', height: `${bar.h2}%`, transition: 'all 0.3s' }} />
                                            <Typography variant="caption" sx={{ position: 'absolute', bottom: -22, width: '100%', textAlign: 'center', fontWeight: 600, fontSize: '0.625rem' }}>{bar.l}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, lg: 5 }}>
                            <Card sx={{ p: 4, height: '100%' }}>
                                <Typography variant="subtitle1" sx={{ mb: 3 }}>Regional Distribution</Typography>
                                <Stack spacing={3}>
                                    {[
                                        { region: 'North America', pct: 42, color: 'primary.main' },
                                        { region: 'Europe', pct: 28, color: '#60a5fa' },
                                        { region: 'APAC', pct: 20, color: '#94a3b8' },
                                        { region: 'Other', pct: 10, color: '#cbd5e1' },
                                    ].map((r, i) => (
                                        <Box key={i}>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                <Typography variant="body2" fontWeight={600}>{r.region}</Typography>
                                                <Typography variant="body2" fontWeight={700}>{r.pct}%</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={r.pct} sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: r.color, borderRadius: 3 } }} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Pinned Reports Table */}
                    <Card sx={{ overflow: 'hidden' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
                            <Typography variant="subtitle1">Pinned Reports</Typography>
                            <Button component={Link} to="/reports" size="small">View All</Button>
                        </Stack>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow><TableCell>Report</TableCell><TableCell>Sector</TableCell><TableCell>Updated</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow>
                                </TableHead>
                                <TableBody>
                                    {[
                                        { title: 'Global Retail Forecast 2025', sector: 'Retail', date: 'Oct 12', status: 'New' },
                                        { title: 'SaaS Industry Analysis', sector: 'Technology', date: 'Oct 10', status: 'Read' },
                                        { title: 'Renewable Energy Index', sector: 'Energy', date: 'Oct 08', status: 'Saved' },
                                    ].map((r, i) => (
                                        <TableRow key={i} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                            <TableCell><Typography variant="body2" fontWeight={700}>{r.title}</Typography></TableCell>
                                            <TableCell><Chip label={r.sector} size="small" variant="outlined" /></TableCell>
                                            <TableCell><Typography variant="caption">{r.date}</Typography></TableCell>
                                            <TableCell><Chip label={r.status} size="small" sx={{ bgcolor: r.status === 'New' ? 'rgba(16,185,129,0.1)' : r.status === 'Read' ? 'rgba(0,51,153,0.1)' : '#f1f5f9', color: r.status === 'New' ? 'success.main' : r.status === 'Read' ? 'primary.main' : 'text.secondary' }} /></TableCell>
                                            <TableCell>
                                                <Stack direction="row" gap={0.5}>
                                                    <IconButton size="small"><DownloadIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small"><StarIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Box>
            </Box>
        </Box>
    )
}

import React, { useState } from 'react'
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
import Pagination from '@mui/material/Pagination'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import StorageIcon from '@mui/icons-material/Storage'
import SearchIcon from '@mui/icons-material/Search'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ArticleIcon from '@mui/icons-material/Article'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AddIcon from '@mui/icons-material/Add'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import NotificationsIcon from '@mui/icons-material/Notifications'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'

const drawerWidth = 240

const navItems = [
    { icon: <DashboardIcon fontSize="small" />, label: 'Dashboard', active: true },
    { icon: <ArticleIcon fontSize="small" />, label: 'Reports' },
    { icon: <PeopleIcon fontSize="small" />, label: 'Users' },
    { icon: <BarChartIcon fontSize="small" />, label: 'Analytics' },
    { icon: <SettingsIcon fontSize="small" />, label: 'Settings' },
]

const reports = [
    { id: 'RPT-042', title: 'Digital Commerce Trends 2024', sector: 'Retail', status: 'Published', views: '1,245', date: '10/12' },
    { id: 'RPT-041', title: 'Cloud Infrastructure Forecast', sector: 'Technology', status: 'Published', views: '3,482', date: '10/10' },
    { id: 'RPT-040', title: 'Renewable Energy Index 2024', sector: 'Energy', status: 'Draft', views: '-', date: '10/08' },
    { id: 'RPT-039', title: 'Banking Sector Q3 Analysis', sector: 'Finance', status: 'Review', views: '189', date: '10/05' },
    { id: 'RPT-038', title: 'EV Adoption Statistics', sector: 'Automotive', status: 'Published', views: '2,671', date: '10/01' },
]

function SidebarContent({ onClose }) {
    return (
        <Stack sx={{ height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3, pb: 2 }}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <StorageIcon sx={{ color: '#60a5fa' }} />
                    <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: '1.25rem' }}>DataVault</Typography>
                </Stack>
                {onClose && <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}><CloseIcon /></IconButton>}
            </Stack>
            <Typography variant="caption" sx={{ px: 3, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, mb: 1 }}>Administration</Typography>
            <Stack spacing={0.5} sx={{ px: 1.5, flexGrow: 1 }}>
                {navItems.map(item => (
                    <Button key={item.label} startIcon={item.icon} fullWidth onClick={onClose}
                        sx={{ justifyContent: 'flex-start', color: item.active ? '#fff' : '#94a3b8', px: 2, py: 1.2, bgcolor: item.active ? '#1e293b' : 'transparent', borderRadius: 2, '&:hover': { bgcolor: '#1e293b', color: '#fff' } }}>
                        {item.label}
                    </Button>
                ))}
            </Stack>
            <Divider sx={{ borderColor: '#1e293b' }} />
            <Box sx={{ p: 2 }}>
                <Button component={Link} to="/" startIcon={<StorageIcon fontSize="small" />} fullWidth
                    sx={{ justifyContent: 'flex-start', color: '#94a3b8', '&:hover': { color: '#fff' } }} onClick={onClose}>
                    Back to Site
                </Button>
            </Box>
        </Stack>
    )
}

export default function AdminPage() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Desktop sidebar */}
            <Drawer variant="permanent"
                sx={{ width: drawerWidth, display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: '#0f172a', color: '#fff', borderRight: 'none', boxSizing: 'border-box' } }}>
                <SidebarContent />
            </Drawer>

            {/* Mobile sidebar */}
            <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: '#0f172a', color: '#fff', boxSizing: 'border-box' } }}>
                <SidebarContent onClose={() => setMobileOpen(false)} />
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
                {/* Top bar */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: 2, borderBottom: '1px solid #e2e8f0', bgcolor: 'background.paper' }}>
                    <Stack direction="row" alignItems="center" gap={2}>
                        {isMobile && <IconButton onClick={() => setMobileOpen(true)} size="small"><MenuIcon /></IconButton>}
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>Admin Dashboard</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <IconButton size="small"><NotificationsIcon /></IconButton>
                        <Chip label="Admin" size="small" color="primary" />
                    </Stack>
                </Box>

                <Box sx={{ p: { xs: 2, md: 4 } }}>
                    {/* Stats */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {[
                            { label: 'Total Reports', value: '1,247', delta: '+12%' },
                            { label: 'Active Users', value: '3,891', delta: '+8%' },
                            { label: 'Revenue (MTD)', value: '$42.5K', delta: '+15%' },
                            { label: 'API Calls', value: '284K', delta: '+22%' },
                        ].map((s, i) => (
                            <Grid key={i} size={{ xs: 6, sm: 6, lg: 3 }}>
                                <Card sx={{ p: { xs: 2, md: 3 } }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: { xs: '0.7rem', md: '0.875rem' } }}>{s.label}</Typography>
                                    <Stack direction="row" alignItems="baseline" gap={1} flexWrap="wrap">
                                        <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', md: '1.5rem' } }}>{s.value}</Typography>
                                        <Stack direction="row" alignItems="center" gap={0.3}>
                                            <TrendingUpIcon sx={{ fontSize: 12, color: 'success.main' }} />
                                            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>{s.delta}</Typography>
                                        </Stack>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Reports Table */}
                    <Card>
                        <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid #f1f5f9' }}>
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={2}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>Report Management</Typography>
                                    <Typography variant="caption" color="text.secondary">Manage and publish reports</Typography>
                                </Box>
                                <Stack direction="row" gap={1} flexWrap="wrap">
                                    <TextField size="small" placeholder="Search reports..."
                                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                                        sx={{ width: { xs: '100%', sm: 200 } }} />
                                    <Stack direction="row" gap={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                        <Select defaultValue="all" size="small" sx={{ minWidth: 120, flex: 1 }}>
                                            <MenuItem value="all">All Status</MenuItem>
                                            <MenuItem value="published">Published</MenuItem>
                                            <MenuItem value="draft">Draft</MenuItem>
                                            <MenuItem value="review">Review</MenuItem>
                                        </Select>
                                        <Button variant="contained" startIcon={<AddIcon />} size="small" sx={{ whiteSpace: 'nowrap' }}>New</Button>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Box>
                        <TableContainer>
                            <Table sx={{ minWidth: 480 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>ID</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Sector</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Views</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reports.map((r, i) => (
                                        <TableRow key={i} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                            <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{r.id}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={700} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{r.title}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Chip label={r.sector} size="small" variant="outlined" /></TableCell>
                                            <TableCell>
                                                <Chip label={r.status} size="small" sx={{
                                                    bgcolor: r.status === 'Published' ? 'rgba(16,185,129,0.1)' : r.status === 'Draft' ? '#f1f5f9' : 'rgba(245,158,11,0.1)',
                                                    color: r.status === 'Published' ? 'success.main' : r.status === 'Draft' ? 'text.secondary' : '#d97706',
                                                }} />
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Typography variant="caption">{r.views}</Typography></TableCell>
                                            <TableCell>
                                                <Stack direction="row" gap={0.25}>
                                                    <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small" color="error" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}><DeleteIcon fontSize="small" /></IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={1} sx={{ p: 2, borderTop: '1px solid #f1f5f9' }}>
                            <Typography variant="caption" color="text.secondary">Showing 1-5 of 1,247 reports</Typography>
                            <Pagination count={20} size="small" color="primary" shape="rounded" />
                        </Stack>
                    </Card>
                </Box>
            </Box>
        </Box>
    )
}

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import PersonIcon from '@mui/icons-material/Person'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DownloadIcon from '@mui/icons-material/Download'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import ReceiptIcon from '@mui/icons-material/Receipt'
import EditIcon from '@mui/icons-material/Edit'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function ProfilePage() {
    const [tab, setTab] = useState(0)

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 5, pt: 12 }}>
                {/* Profile Header */}
                <Card sx={{ p: 4, mb: 4 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={3} alignItems={{ md: 'center' }} justifyContent="space-between">
                        <Stack direction="row" gap={3} alignItems="center">
                            <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: '1.5rem' }}>AR</Avatar>
                            <Box>
                                <Typography variant="h5">Alex Rivers</Typography>
                                <Typography variant="body2" color="text.secondary">alex.rivers@company.com</Typography>
                                <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                                    <Chip icon={<WorkspacePremiumIcon sx={{ fontSize: 14 }} />} label="Professional Plan" size="small" sx={{ bgcolor: 'rgba(0,51,153,0.1)', color: 'primary.main' }} />
                                    <Chip icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />} label="Joined Sep 2023" size="small" variant="outlined" />
                                </Stack>
                            </Box>
                        </Stack>
                        <Button variant="outlined" startIcon={<EditIcon />}>Edit Profile</Button>
                    </Stack>
                </Card>

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                        { label: 'Reports Viewed', value: '142', sub: 'This month: 23' },
                        { label: 'Data Downloads', value: '56', sub: 'This month: 8' },
                        { label: 'API Calls', value: '1,204', sub: 'Limit: 5,000/mo' },
                        { label: 'Saved Reports', value: '18', sub: '3 new alerts' },
                    ].map((s, i) => (
                        <Grid key={i} size={{ xs: 6, lg: 3 }}>
                            <Card sx={{ p: { xs: 2, md: 3 } }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: { xs: '0.7rem', md: '0.875rem' } }}>{s.label}</Typography>
                                <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>{s.value}</Typography>
                                <Typography variant="caption" color="text.secondary">{s.sub}</Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Tabs */}
                <Card>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{ borderBottom: '1px solid #e2e8f0', px: { xs: 0, md: 2 } }}
                    >
                        <Tab label="Subscription" />
                        <Tab label="Purchased" />
                        <Tab label="Favorites" />
                        <Tab label="Invoices" />
                        <Tab label="Settings" />
                    </Tabs>
                    <Box sx={{ p: { xs: 2, md: 4 } }}>
                        {tab === 0 && (
                            <Stack spacing={4}>
                                <Card variant="outlined" sx={{ p: 3 }}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={2}>
                                        <Box>
                                            <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: 'success.main', mb: 1 }} />
                                            <Typography variant="h6">Professional Plan – Annual</Typography>
                                            <Typography variant="body2" color="text.secondary">$276/year • Renews December 25, 2024</Typography>
                                        </Box>
                                        <Stack direction="row" gap={1}>
                                            <Button variant="contained" size="small">Upgrade to Enterprise</Button>
                                            <Button variant="outlined" size="small" color="error">Cancel</Button>
                                        </Stack>
                                    </Stack>
                                </Card>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Usage This Month</Typography>
                                    {[
                                        { label: 'Reports', used: 23, total: 50 },
                                        { label: 'Downloads', used: 8, total: 25 },
                                        { label: 'API Calls', used: 1204, total: 5000 },
                                    ].map((u, i) => (
                                        <Box key={i} sx={{ mb: 2 }}>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                <Typography variant="body2">{u.label}</Typography>
                                                <Typography variant="caption" color="text.secondary">{u.used} / {u.total}</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={(u.used / u.total) * 100} sx={{ height: 6, borderRadius: 3 }} />
                                        </Box>
                                    ))}
                                </Box>
                            </Stack>
                        )}
                        {tab === 1 && (
                            <Stack spacing={2}>
                                {[
                                    { title: 'Digital Commerce Trends 2024', date: 'Jan 15, 2024', type: 'PDF' },
                                    { title: 'Healthcare AI Integration Report', date: 'Dec 20, 2023', type: 'XLSX' },
                                    { title: 'Renewable Energy Market Analysis', date: 'Nov 8, 2023', type: 'PDF' },
                                ].map((r, i) => (
                                    <Card key={i} variant="outlined" sx={{ p: 2 }}>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1}>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>{r.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">Purchased {r.date} • {r.type}</Typography>
                                            </Box>
                                            <Button startIcon={<DownloadIcon />} size="small" variant="outlined" sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>Download</Button>
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                        {tab === 2 && (
                            <Stack spacing={2}>
                                {[
                                    { title: 'SaaS Industry Forecast 2025', sector: 'Technology' },
                                    { title: 'Global Logistics Index Q4', sector: 'Logistics' },
                                ].map((r, i) => (
                                    <Card key={i} variant="outlined" sx={{ p: 2 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" gap={1} alignItems="center">
                                                <BookmarkIcon color="primary" fontSize="small" />
                                                <Box>
                                                    <Typography variant="subtitle2">{r.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{r.sector}</Typography>
                                                </Box>
                                            </Stack>
                                            <Button component={Link} to="/reports/1" size="small">View Report</Button>
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                        {tab === 3 && (
                            <Stack spacing={2}>
                                {[
                                    { id: 'INV-2024-001', date: 'Jan 01, 2024', amount: '$276.00', status: 'Paid' },
                                    { id: 'INV-2023-012', date: 'Dec 01, 2023', amount: '$29.99', status: 'Paid' },
                                ].map((inv, i) => (
                                    <Card key={i} variant="outlined" sx={{ p: 2 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" gap={2} alignItems="center">
                                                <ReceiptIcon color="action" />
                                                <Box>
                                                    <Typography variant="subtitle2">{inv.id}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{inv.date}</Typography>
                                                </Box>
                                            </Stack>
                                            <Stack direction="row" gap={2} alignItems="center">
                                                <Typography variant="subtitle2">{inv.amount}</Typography>
                                                <Chip label={inv.status} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: 'success.main' }} />
                                                <Button size="small">Download</Button>
                                            </Stack>
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                        {tab === 4 && (
                            <Stack spacing={4} sx={{ maxWidth: 600 }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Personal Information</Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={6}><TextField fullWidth label="First Name" defaultValue="Alex" size="small" /></Grid>
                                        <Grid size={6}><TextField fullWidth label="Last Name" defaultValue="Rivers" size="small" /></Grid>
                                        <Grid size={12}><TextField fullWidth label="Email" defaultValue="alex.rivers@company.com" size="small" /></Grid>
                                        <Grid size={12}><TextField fullWidth label="Company" defaultValue="Rivers Analytics Inc." size="small" /></Grid>
                                    </Grid>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Notifications</Typography>
                                    {['Email weekly digest', 'Report update alerts', 'Product announcements'].map(n => (
                                        <Stack key={n} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
                                            <Typography variant="body2">{n}</Typography>
                                            <Switch defaultChecked size="small" />
                                        </Stack>
                                    ))}
                                </Box>
                                <Button variant="contained" sx={{ alignSelf: 'flex-start' }}>Save Changes</Button>
                            </Stack>
                        )}
                    </Box>
                </Card>
            </Container>
            <Footer />
        </Box>
    )
}

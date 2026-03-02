import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ShareIcon from '@mui/icons-material/Share'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import MicIcon from '@mui/icons-material/Mic'
import SendIcon from '@mui/icons-material/Send'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import StorageIcon from '@mui/icons-material/Storage'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

const sidebarWidth = 260

export default function AIAgentPage() {
    const navigate = useNavigate()

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
            {/* Left Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: sidebarWidth,
                    display: { xs: 'none', lg: 'block' },
                    '& .MuiDrawer-paper': { width: sidebarWidth, bgcolor: 'background.paper', borderRight: '1px solid #e2e8f0', position: 'relative' },
                }}
            >
                <Stack sx={{ height: '100%' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}>Back</Button>
                            <Stack component={Link} to="/" direction="row" alignItems="center" gap={1} sx={{ textDecoration: 'none' }}>
                                <StorageIcon color="primary" sx={{ fontSize: 22 }} />
                                <Typography variant="subtitle2" color="primary">DataVault</Typography>
                            </Stack>
                        </Stack>
                        <Button fullWidth variant="contained" startIcon={<AddIcon />}>New Research</Button>
                    </Box>
                    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1.5 }}>Recent Insights</Typography>
                        <Stack spacing={0.5} sx={{ mb: 3 }}>
                            {['Q3 Tech Sector Summary', 'SaaS Multiples 2024', 'Emerging Markets Growth'].map((item, i) => (
                                <Button
                                    key={i}
                                    startIcon={<ChatBubbleIcon fontSize="small" />}
                                    fullWidth
                                    sx={{
                                        justifyContent: 'flex-start', color: i === 0 ? 'primary.main' : 'text.secondary',
                                        bgcolor: i === 0 ? 'rgba(0,51,153,0.05)' : 'transparent',
                                        fontSize: '0.8125rem', fontWeight: i === 0 ? 700 : 500, borderRadius: 2,
                                        '&:hover': { bgcolor: '#f8fafc' },
                                    }}
                                >
                                    <Typography variant="body2" noWrap>{item}</Typography>
                                </Button>
                            ))}
                        </Stack>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1.5 }}>Saved Queries</Typography>
                        <Stack spacing={0.5}>
                            {['AI Chipset Competitors', 'Cloud Infra Spending'].map((item, i) => (
                                <Button key={i} startIcon={<BookmarkIcon fontSize="small" />} fullWidth sx={{ justifyContent: 'flex-start', color: 'text.secondary', fontSize: '0.8125rem', borderRadius: 2, '&:hover': { bgcolor: '#f8fafc' } }}>
                                    <Typography variant="body2" noWrap>{item}</Typography>
                                </Button>
                            ))}
                        </Stack>
                    </Box>
                    <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>Storage Usage</Typography>
                            <LinearProgress variant="determinate" value={65} sx={{ height: 4, borderRadius: 2, mb: 1 }} />
                            <Typography variant="caption" color="text.secondary">6.5GB of 10GB used</Typography>
                        </Paper>
                    </Box>
                </Stack>
            </Drawer>

            {/* Main Chat */}
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                    <Stack spacing={4} sx={{ maxWidth: 720, mx: 'auto' }}>
                        {/* User Message */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Stack alignItems="flex-end" gap={1} sx={{ maxWidth: '85%' }}>
                                <Paper sx={{ bgcolor: 'primary.main', color: '#fff', px: 3, py: 2, borderRadius: '16px 16px 4px 16px' }}>
                                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>Analyze the latest tech sector trends. Specifically, I'm looking for Q3 performance metrics for major cloud infrastructure providers.</Typography>
                                </Paper>
                                <Typography variant="caption" color="text.secondary">10:42 AM</Typography>
                            </Stack>
                        </Box>

                        {/* AI Message */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <SmartToyIcon sx={{ color: '#fff', fontSize: 18 }} />
                            </Box>
                            <Stack gap={2} sx={{ maxWidth: '90%' }}>
                                <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px 16px 16px 4px' }}>
                                    <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 3 }}>
                                        I've analyzed the Q3 performance for the major cloud infrastructure providers (AWS, Azure, and Google Cloud). Overall, the sector continues to show robust growth, driven primarily by generative AI workloads.
                                    </Typography>
                                    <Stack direction={{ xs: 'column', md: 'row' }} gap={2} sx={{ mb: 3 }}>
                                        {[
                                            { label: 'Avg Cloud Growth', value: '+24.2%', change: '▲ 3.1%', color: 'success.main', highlight: true },
                                            { label: 'Market Cap Add', value: '$412B', change: '▲ 5.8%', color: 'success.main' },
                                            { label: 'Capex Intensity', value: 'High', change: 'Stable', color: 'secondary.main' },
                                        ].map((kpi, i) => (
                                            <Card key={i} variant="outlined" sx={{ p: 2, flex: 1, ...(kpi.highlight && { borderColor: 'primary.main', bgcolor: 'rgba(0,51,153,0.03)' }) }}>
                                                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: 'text.secondary' }}>{kpi.label}</Typography>
                                                <Stack direction="row" alignItems="baseline" gap={1}>
                                                    <Typography variant="h6">{kpi.value}</Typography>
                                                    <Typography variant="caption" sx={{ color: kpi.color, fontWeight: 700 }}>{kpi.change}</Typography>
                                                </Stack>
                                            </Card>
                                        ))}
                                    </Stack>
                                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow><TableCell>Provider</TableCell><TableCell>Q3 Revenue</TableCell><TableCell>YoY Growth</TableCell><TableCell>Op Margin</TableCell></TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow><TableCell sx={{ fontWeight: 700 }}>AWS</TableCell><TableCell>$24.2B</TableCell><TableCell sx={{ color: 'success.main' }}>+12%</TableCell><TableCell>30.1%</TableCell></TableRow>
                                                <TableRow><TableCell sx={{ fontWeight: 700 }}>Azure</TableCell><TableCell>$21.8B</TableCell><TableCell sx={{ color: 'success.main' }}>+29%</TableCell><TableCell>44.0%</TableCell></TableRow>
                                                <TableRow><TableCell sx={{ fontWeight: 700 }}>GCP</TableCell><TableCell>$8.4B</TableCell><TableCell sx={{ color: 'success.main' }}>+22%</TableCell><TableCell>3.2%</TableCell></TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                                        The key takeaway is that Microsoft's Azure continues to lead in growth rate, while Amazon maintains the largest market share but faces increased margin pressure due to infrastructure investment.
                                    </Typography>
                                </Paper>
                                <Stack direction="row" gap={2}>
                                    {[
                                        { icon: <ThumbUpIcon sx={{ fontSize: 16 }} />, label: 'Helpful' },
                                        { icon: <ContentCopyIcon sx={{ fontSize: 16 }} />, label: 'Copy' },
                                        { icon: <ShareIcon sx={{ fontSize: 16 }} />, label: 'Share' },
                                    ].map(action => (
                                        <Button key={action.label} startIcon={action.icon} size="small" sx={{ color: 'text.secondary', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em', '&:hover': { color: 'primary.main' } }}>
                                            {action.label}
                                        </Button>
                                    ))}
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                {/* Input */}
                <Box sx={{ p: 3, pt: 0 }}>
                    <Stack sx={{ maxWidth: 720, mx: 'auto' }}>
                        <Paper elevation={4} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, p: 1.5, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                            <IconButton size="small" sx={{ color: 'text.secondary' }}><AttachFileIcon /></IconButton>
                            <TextField
                                fullWidth
                                multiline
                                maxRows={3}
                                placeholder="Ask DataVault anything about market trends..."
                                variant="standard"
                                slotProps={{ input: { disableUnderline: true } }}
                                sx={{ px: 1 }}
                            />
                            <Stack direction="row" gap={0.5}>
                                <IconButton size="small" sx={{ color: 'text.secondary' }}><MicIcon /></IconButton>
                                <IconButton sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, boxShadow: '0 4px 14px rgba(0,51,153,0.3)' }}><SendIcon /></IconButton>
                            </Stack>
                        </Paper>
                        <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 1.5 }}>DataVault AI can make mistakes. Verify critical financial data with original source filings.</Typography>
                    </Stack>
                </Box>
            </Box>

            {/* Right Sidebar */}
            <Box sx={{ width: 320, borderLeft: '1px solid #e2e8f0', bgcolor: 'background.paper', display: { xs: 'none', xl: 'flex' }, flexDirection: 'column', flexShrink: 0 }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <LightbulbIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2">Data Context</Typography>
                    </Stack>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2.5 }}>
                    <Stack spacing={4}>
                        <Box>
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1.5 }}>Suggested Reports</Typography>
                            <Stack spacing={1.5}>
                                {[
                                    { title: '2024 Cloud Infrastructure Forecast', type: 'PDF', source: 'Gartner Research' },
                                    { title: 'Hyperscale Capex Analysis', type: 'XLSX', source: 'Internal Data' },
                                ].map((r, i) => (
                                    <Card key={i} variant="outlined" sx={{ p: 2, cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(0,51,153,0.02)' } }}>
                                        <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>{r.title}</Typography>
                                        <Stack direction="row" gap={1}>
                                            <Chip label={r.type} size="small" sx={{ bgcolor: '#f1f5f9', height: 20, fontSize: '0.625rem' }} />
                                            <Typography variant="caption" color="text.secondary">{r.source}</Typography>
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1.5 }}>Related Sector Trends</Typography>
                            <Stack spacing={2}>
                                {[
                                    { text: 'Semiconductor supply chains stabilizing for H2', time: '2h ago' },
                                    { text: 'Energy constraints affecting new data center permits', time: '5h ago' },
                                    { text: 'Open-source LLM adoption in FinTech enterprise', time: '1d ago' },
                                ].map((t, i) => (
                                    <Stack key={i} direction="row" gap={1.5} alignItems="flex-start">
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'secondary.main', mt: 1, flexShrink: 0 }} />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">{t.text}</Typography>
                                            <Typography variant="caption" color="text.secondary">Updated {t.time}</Typography>
                                        </Box>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                        <Card sx={{ bgcolor: 'primary.main', color: '#fff', p: 2.5, position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: -24, right: -24, width: 96, height: 96, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(24px)' }} />
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Upgrade to Pro</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mb: 2 }}>Unlock deeper analytics and real-time terminal access.</Typography>
                            <Button component={Link} to="/pricing" fullWidth variant="contained" color="secondary" size="small">Learn More</Button>
                        </Card>
                    </Stack>
                </Box>
            </Box>
        </Box>
    )
}

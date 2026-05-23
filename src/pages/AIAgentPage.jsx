import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Drawer from '@mui/material/Drawer'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ShareIcon from '@mui/icons-material/Share'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import AIChatBar, { AI_CHAT_BAR_FLOAT_HEIGHT } from '../components/ai/AIChatBar'

const sidebarWidth = 260

function LeftSidebarContent({ navigate, onClose, isCollapsed }) {
    return (
        <Stack sx={{ height: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
                <Stack direction="row" justifyContent={isCollapsed ? 'center' : 'space-between'} alignItems="center" sx={{ mb: 2 }}>
                    {isCollapsed ? (
                        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}>
                            <ArrowBackIcon />
                        </IconButton>
                    ) : (
                        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}>
                            Back
                        </Button>
                    )}
                    {onClose && !isCollapsed && (
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    )}
                </Stack>
                <Button 
                    fullWidth={!isCollapsed} 
                    variant="contained" 
                    sx={{
                        minWidth: isCollapsed ? 0 : 'auto',
                        p: isCollapsed ? 1 : undefined,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <AddIcon sx={{ mr: isCollapsed ? 0 : 1 }} />
                    {!isCollapsed && <span>New Research</span>}
                </Button>
            </Box>
            <Box
                sx={{
                    flexGrow: 1,
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isCollapsed ? 'center' : 'stretch',
                }}
            >
                {!isCollapsed && (
                    <Typography
                        variant="caption"
                        sx={{
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: 700,
                            color: 'text.secondary',
                            display: 'block',
                            mb: 1.5,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Recent Insights
                    </Typography>
                )}
                <Stack spacing={0.5} sx={{ mb: 3, alignItems: isCollapsed ? 'center' : 'stretch' }}>
                    {['Q3 Tech Sector Summary', 'SaaS Multiples 2024', 'Emerging Markets Growth'].map((item, i) => (
                        <Button
                            key={i}
                            fullWidth={!isCollapsed}
                            onClick={onClose}
                            sx={{ 
                                justifyContent: isCollapsed ? 'center' : 'flex-start', 
                                color: i === 0 ? 'primary.main' : 'text.secondary', 
                                bgcolor: i === 0 ? 'rgba(0,51,153,0.05)' : 'transparent', 
                                fontSize: '0.8125rem', 
                                fontWeight: i === 0 ? 700 : 500, 
                                borderRadius: 2, 
                                minWidth: isCollapsed ? 0 : 'auto',
                                p: isCollapsed ? 1.5 : '6px 8px',
                                '&:hover': { bgcolor: '#f8fafc' },
                            }}
                        >
                            <ChatBubbleIcon fontSize="small" sx={{ mr: isCollapsed ? 0 : 1 }} />
                            {!isCollapsed && (
                                <Typography variant="body2" noWrap>
                                    {item}
                                </Typography>
                            )}
                        </Button>
                    ))}
                </Stack>
            </Box>
            <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
                {!isCollapsed ? (
                    <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Account Name
                        </Typography>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                            Pro Plan
                        </Typography>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                            Usage Limit
                        </Typography>
                        <LinearProgress variant="determinate" value={65} sx={{ height: 4, borderRadius: 2, mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                            650 / 1000 requests
                        </Typography>
                    </Paper>
                ) : (
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                            flexShrink: 0,
                        }}
                    >
                        A
                    </Box>
                )}
            </Box>
        </Stack>
    )
}

function ChatMessages() {
    return (
        <Stack spacing={4} sx={{ maxWidth: 720, mx: 'auto', width: '100%' }}>
            <Box
                component={motion.div}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
                <Stack alignItems="flex-end" gap={1} sx={{ maxWidth: '85%' }}>
                    <Paper sx={{ bgcolor: 'primary.main', color: '#fff', px: { xs: 2, md: 3 }, py: 2, borderRadius: '16px 16px 4px 16px' }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                            Analyze the latest tech sector trends. Specifically, I'm looking for Q3 performance metrics for major cloud infrastructure providers.
                        </Typography>
                    </Paper>
                    <Typography variant="caption" color="text.secondary">
                        10:42 AM
                    </Typography>
                </Stack>
            </Box>

            <Box
                component={motion.div}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.6 }}
                sx={{ display: 'flex', gap: 2 }}
            >
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SmartToyIcon sx={{ color: '#fff', fontSize: 18 }} />
                </Box>
                <Stack gap={2} sx={{ maxWidth: '90%', minWidth: 0 }}>
                    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px 16px 16px 4px' }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 3, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                            I've analyzed the Q3 performance for the major cloud infrastructure providers (AWS, Azure, and Google Cloud). The sector continues to show robust growth, driven primarily by generative AI workloads.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} sx={{ mb: 3 }}>
                            {[
                                { label: 'Avg Cloud Growth', value: '+24.2%', change: '▲ 3.1%', color: 'success.main', highlight: true },
                                { label: 'Market Cap Add', value: '$412B', change: '▲ 5.8%', color: 'success.main' },
                                { label: 'Capex Intensity', value: 'High', change: 'Stable', color: 'secondary.main' },
                            ].map((kpi, i) => (
                                <Card key={i} variant="outlined" sx={{ p: 2, flex: 1, ...(kpi.highlight && { borderColor: 'primary.main', bgcolor: 'rgba(0,51,153,0.03)' }) }}>
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: 'text.secondary' }}>
                                        {kpi.label}
                                    </Typography>
                                    <Stack direction="row" alignItems="baseline" gap={1}>
                                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                                            {kpi.value}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: kpi.color, fontWeight: 700 }}>
                                            {kpi.change}
                                        </Typography>
                                    </Stack>
                                </Card>
                            ))}
            </Stack>
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, overflowX: 'auto' }}>
                            <Table size="small" sx={{ minWidth: 320 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Provider</TableCell>
                                        <TableCell>Q3 Revenue</TableCell>
                                        <TableCell>YoY Growth</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Op Margin</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>AWS</TableCell>
                                        <TableCell>$24.2B</TableCell>
                                        <TableCell sx={{ color: 'success.main' }}>+12%</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>30.1%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Azure</TableCell>
                                        <TableCell>$21.8B</TableCell>
                                        <TableCell sx={{ color: 'success.main' }}>+29%</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>44.0%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>GCP</TableCell>
                                        <TableCell>$8.4B</TableCell>
                                        <TableCell sx={{ color: 'success.main' }}>+22%</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>3.2%</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Typography variant="body2" sx={{ lineHeight: 1.7, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                            Microsoft's Azure continues to lead in growth rate, while Amazon maintains the largest market share but faces increased margin pressure.
                        </Typography>
        </Paper>
                    <Stack direction="row" gap={2} flexWrap="wrap">
                        {[
                            { icon: <ThumbUpIcon sx={{ fontSize: 16 }} />, label: 'Helpful' },
                            { icon: <ContentCopyIcon sx={{ fontSize: 16 }} />, label: 'Copy' },
                            { icon: <ShareIcon sx={{ fontSize: 16 }} />, label: 'Share' },
                        ].map(action => (
                            <Button
                                key={action.label}
                                startIcon={action.icon}
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.625rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    '&:hover': { color: 'primary.main' },
                                }}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </Stack>
                </Stack>
            </Box>
    </Stack>
)
}

export default function AIAgentPage() {
    const navigate = useNavigate()
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
    const [hasChat, setHasChat] = useState(false)
    const [inputValue, setInputValue] = useState('')

    const toggleSidebar = () => {
        if (window.innerWidth >= 1200) {
            setDesktopSidebarOpen(!desktopSidebarOpen)
        } else {
            setMobileSidebarOpen(!mobileSidebarOpen)
        }
    }

    const handleSend = () => {
        if (inputValue.trim()) {
            setHasChat(true)
            setInputValue('')
        }
    }

    const chatBarProps = {
        inputValue,
        onInputChange: e => setInputValue(e.target.value),
        onSend: handleSend,
        hasChat,
        layoutId: 'ai-chat-bar',
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: desktopSidebarOpen ? sidebarWidth : 72,
                    display: { xs: 'none', lg: 'block' },
                    flexShrink: 0,
                    transition: 'width 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                    '& .MuiDrawer-paper': { 
                        width: desktopSidebarOpen ? sidebarWidth : 72, 
                        bgcolor: 'background.paper', 
                        borderRight: '1px solid #e2e8f0', 
                        position: 'relative',
                        transition: 'width 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                        overflowX: 'hidden',
                    },
                }}
            >
                <LeftSidebarContent navigate={navigate} onClose={null} isCollapsed={!desktopSidebarOpen} />
            </Drawer>

            <Drawer
                variant="temporary"
                open={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: sidebarWidth, bgcolor: 'background.paper' } }}
            >
                <LeftSidebarContent navigate={navigate} onClose={() => setMobileSidebarOpen(false)} isCollapsed={false} />
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0, minHeight: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0', bgcolor: 'background.paper', flexShrink: 0, zIndex: 10 }}>
                    <IconButton onClick={toggleSidebar} sx={{ p: 1, color: 'text.secondary' }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="subtitle2" sx={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 800 }}>
                        Researcha AI
                    </Typography>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: hasChat ? 'background.paper' : 'background.default',
                    }}
                >
                {hasChat ? (
                    <>
                            <Box
                                component="section"
                                aria-label="Chat messages"
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    overflow: 'auto',
                                    p: { xs: 2, md: 3 },
                                    pb: AI_CHAT_BAR_FLOAT_HEIGHT,
                                    zIndex: 1,
                                }}
                            >
                                <ChatMessages />
                                </Box>
                            <AIChatBar {...chatBarProps} position="floating" />
                    </>
                ) : (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 20,
                                isolation: 'isolate',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                px: { xs: 2, md: 3 },
                                py: 4,
                            }}
                        >
                            <Stack
                                alignItems="center"
                                spacing={{ xs: 3, md: 4 }}
                                sx={{ width: '100%', maxWidth: 800 }}
                            >
                                <motion.div
                                    initial={{ scale: 0.92, opacity: 0, y: 16 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    transition={{ type: 'spring', bounce: 0.45, duration: 0.75 }}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="center" gap={{ xs: 1, md: 2 }}>
                                <AutoAwesomeIcon sx={{ fontSize: { xs: 28, md: 40 }, color: 'primary.main' }} />
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontFamily: '"Georgia", "Times New Roman", serif',
                                                fontWeight: 400,
                                                color: 'text.primary',
                                                fontSize: { xs: '1.75rem', md: '3rem' },
                                                textAlign: 'center',
                                            }}
                                        >
                                    Good evening, Researcha
                                </Typography>
                            </Stack>
                        </motion.div>
                                <AIChatBar {...chatBarProps} position="inline" />
                            </Stack>
                    </Box>
                )}
                </Box>
            </Box>
        </Box>
    )
}

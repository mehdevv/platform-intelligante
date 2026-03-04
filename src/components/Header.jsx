import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import SearchIcon from '@mui/icons-material/Search'
import StorageIcon from '@mui/icons-material/Storage'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'

const navLinks = [
    { label: 'Sectors', to: '/sectors' },
    { label: 'Reports', to: '/reports' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'AI Assistant', to: '/ai' },
]

export default function Header() {
    const [visible, setVisible] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    const lastScrollY = useRef(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            if (currentScrollY < 10) setVisible(true)
            else if (currentScrollY > lastScrollY.current) setVisible(false)
            else setVisible(true)
            lastScrollY.current = currentScrollY
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #e2e8f0',
                    transform: visible ? 'translateY(0)' : 'translateY(-100%)',
                    transition: 'transform 0.3s ease',
                }}
            >
                <Toolbar sx={{ maxWidth: 1440, mx: 'auto', width: '100%', px: { xs: 2, md: 3 }, gap: { xs: 1, md: 3 } }}>
                    {/* Logo */}
                    <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
                        <StorageIcon sx={{ color: 'primary.main', fontSize: { xs: 24, md: 30 } }} />
                        <Box
                            component={Link}
                            to="/"
                            sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: '1.15rem', md: '1.5rem' }, color: 'primary.main', textDecoration: 'none', fontWeight: 700 }}
                        >
                            DataVault
                        </Box>
                    </Stack>

                    {/* Search bar — desktop only */}
                    <Box sx={{ flex: 1, maxWidth: 480, display: { xs: 'none', md: 'block' } }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search statistics, data points..."
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>

                    {/* Nav links — desktop only */}
                    <Stack direction="row" gap={3} alignItems="center" sx={{ display: { xs: 'none', lg: 'flex' }, flexShrink: 0 }}>
                        {navLinks.map(item => (
                            <Box
                                key={item.label}
                                component={Link}
                                to={item.to}
                                sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }}
                            >
                                {item.label}
                            </Box>
                        ))}
                    </Stack>

                    {/* CTA buttons — desktop */}
                    <Stack direction="row" gap={1.5} alignItems="center" sx={{ flexShrink: 0, display: { xs: 'none', md: 'flex' }, ml: 'auto' }}>
                        <Button component={Link} to="/login" sx={{ color: 'text.primary', fontWeight: 700 }}>Login</Button>
                        <Button component={Link} to="/pricing" variant="contained" color="secondary" size="small">
                            Get full access
                        </Button>
                    </Stack>

                    {/* Hamburger — mobile only */}
                    <IconButton
                        sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto', color: 'text.primary' }}
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                PaperProps={{ sx: { width: '85vw', maxWidth: 320 } }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <StorageIcon sx={{ color: 'primary.main' }} />
                        <Box sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', color: 'primary.main', fontWeight: 700 }}>DataVault</Box>
                    </Stack>
                    <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
                </Box>

                {/* Mobile search */}
                <Box sx={{ p: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search statistics..."
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>

                <List disablePadding>
                    {navLinks.map(item => (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton component={Link} to={item.to} onClick={() => setMobileOpen(false)}>
                                <ListItemText primary={item.label} slotProps={{ primary: { fontWeight: 600 } }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Stack gap={1.5} sx={{ px: 2 }}>
                    <Button fullWidth component={Link} to="/login" variant="outlined" onClick={() => setMobileOpen(false)}>Login</Button>
                    <Button fullWidth component={Link} to="/pricing" variant="contained" color="secondary" onClick={() => setMobileOpen(false)}>
                        Get full access
                    </Button>
                </Stack>
            </Drawer>
        </>
    )
}

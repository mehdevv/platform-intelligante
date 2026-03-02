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
import SearchIcon from '@mui/icons-material/Search'
import StorageIcon from '@mui/icons-material/Storage'

export default function Header() {
    const [visible, setVisible] = useState(true)
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
            <Toolbar sx={{ maxWidth: 1440, mx: 'auto', width: '100%', px: 3, gap: 3 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
                    <StorageIcon sx={{ color: 'primary.main', fontSize: 30 }} />
                    <Box
                        component={Link}
                        to="/"
                        sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: 'primary.main', textDecoration: 'none', fontWeight: 700 }}
                    >
                        DataVault
                    </Box>
                </Stack>

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

                <Stack direction="row" gap={3} alignItems="center" sx={{ display: { xs: 'none', lg: 'flex' }, flexShrink: 0 }}>
                    {[
                        { label: 'Sectors', to: '/sectors' },
                        { label: 'Reports', to: '/reports' },
                        { label: 'Pricing', to: '/pricing' },
                        { label: 'AI Assistant', to: '/ai' },
                    ].map(item => (
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

                <Stack direction="row" gap={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
                    <Button component={Link} to="/login" sx={{ color: 'text.primary', fontWeight: 700 }}>Login</Button>
                    <Button component={Link} to="/pricing" variant="contained" color="secondary" size="small">
                        Get full access
                    </Button>
                </Stack>
            </Toolbar>
        </AppBar>
    )
}

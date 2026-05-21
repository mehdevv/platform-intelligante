import React, { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import BrandLogo from '../components/BrandLogo'
import AdminStorageUsage from '../components/admin/AdminStorageUsage'

const drawerWidth = 268

const nav = [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/sectors', label: 'Sectors' },
    { to: '/admin/blog', label: 'Blog' },
    { to: '/admin/payments', label: 'Payments' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/audit', label: 'Audit log' },
    { to: '/admin/settings', label: 'Settings' },
]

function NavBlock({ onNavigate }) {
    return (
        <Stack spacing={0.5} sx={{ px: 1.5, py: 2 }}>
            {nav.map(item => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    {({ isActive }) => (
                        <Box
                            sx={{
                                px: 2,
                                py: 1.25,
                                borderRadius: 1,
                                borderLeft: '3px solid',
                                borderLeftColor: isActive ? 'secondary.main' : 'transparent',
                                bgcolor: isActive ? 'rgba(25, 127, 148, 0.08)' : 'transparent',
                                color: isActive ? 'secondary.dark' : 'text.secondary',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '0.875rem',
                                '&:hover': { bgcolor: 'rgba(75, 91, 114, 0.06)', color: 'text.primary' },
                            }}
                        >
                            {item.label}
                        </Box>
                    )}
                </NavLink>
            ))}
        </Stack>
    )
}

function SidebarBody({ onClose }) {
    return (
        <Stack sx={{ height: '100%', bgcolor: 'background.paper' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, pt: 3, pb: 1 }}>
                <BrandLogo />
                {onClose && (
                    <IconButton onClick={onClose} size="small" sx={{ display: { md: 'none' } }}>
                        <CloseIcon />
                    </IconButton>
                )}
            </Stack>
            <Typography variant="caption" sx={{ px: 3, pt: 1, pb: 0.5, color: 'text.secondary', letterSpacing: '0.08em', fontWeight: 700 }}>
                Administration
            </Typography>
            <NavBlock onNavigate={onClose} />
            <Box sx={{ flex: 1 }} />
            <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <AdminStorageUsage variant="sidebar" />
            </Box>
            <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography component={Link} to="/" variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, textDecoration: 'none' }}>
                    ← Back to site
                </Typography>
            </Box>
        </Stack>
    )
}

export default function AdminLayout() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const [open, setOpen] = useState(false)

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    },
                }}
            >
                <SidebarBody />
            </Drawer>
            <Drawer
                variant="temporary"
                open={open}
                onClose={() => setOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <SidebarBody onClose={() => setOpen(false)} />
            </Drawer>

            <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        bgcolor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        {isMobile && (
                            <IconButton edge="start" onClick={() => setOpen(true)} aria-label="menu">
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, fontWeight: 700 }}>
                            Admin
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <IconButton size="small" aria-label="notifications">
                            <NotificationsNoneIcon fontSize="small" />
                        </IconButton>
                        <Chip label="Admin" size="small" color="secondary" variant="outlined" sx={{ fontWeight: 700 }} />
                    </Stack>
                </Box>
                <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 } }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    )
}

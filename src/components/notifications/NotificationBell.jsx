import React, { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import { useAuth } from '../../context/AuthContext'
import { fetchUnreadNotifications, markAllNotificationsRead, markNotificationsRead } from '../../lib/notifications'

/**
 * @param {{ paymentsHref?: string, emptyLabel?: string }} props
 */
export default function NotificationBell({ paymentsHref = '/admin/payments', emptyLabel = 'No new notifications' }) {
    const { supabase } = useAuth()
    const navigate = useNavigate()
    const [anchor, setAnchor] = useState(null)
    const [rows, setRows] = useState([])
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)

    const refresh = useCallback(async () => {
        if (!supabase) return
        try {
            const { rows: list, count: c } = await fetchUnreadNotifications(supabase, 15)
            setRows(list)
            setCount(c)
        } catch {
            setRows([])
            setCount(0)
        }
    }, [supabase])

    useEffect(() => {
        refresh()
        const id = window.setInterval(refresh, 60_000)
        return () => window.clearInterval(id)
    }, [refresh])

    const open = Boolean(anchor)

    const handleOpen = e => {
        setAnchor(e.currentTarget)
        setLoading(true)
        refresh().finally(() => setLoading(false))
    }

    const handleClose = () => setAnchor(null)

    const openNotification = async row => {
        handleClose()
        try {
            await markNotificationsRead(supabase, [row.id])
            setRows(prev => prev.filter(r => r.id !== row.id))
            setCount(c => Math.max(0, c - 1))
        } catch {
            /* ignore */
        }
        if (row.href) navigate(row.href)
    }

    const markAllRead = async () => {
        try {
            await markAllNotificationsRead(supabase)
            setRows([])
            setCount(0)
        } catch {
            /* ignore */
        }
        handleClose()
    }

    return (
        <>
            <IconButton size="small" aria-label="notifications" onClick={handleOpen}>
                <Badge badgeContent={count > 0 ? count : null} color="secondary" max={99}>
                    <NotificationsNoneIcon fontSize="small" />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchor}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { width: 340, maxWidth: '95vw' } } }}
            >
                <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" fontWeight={800}>
                        Notifications
                    </Typography>
                    {count > 0 && (
                        <Button size="small" onClick={markAllRead} sx={{ minWidth: 0, fontSize: '0.7rem' }}>
                            Mark all read
                        </Button>
                    )}
                </Box>
                <Divider />
                {loading && rows.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                            Loading…
                        </Typography>
                    </MenuItem>
                ) : rows.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                            {emptyLabel}
                        </Typography>
                    </MenuItem>
                ) : (
                    rows.map(row => (
                        <MenuItem key={row.id} onClick={() => openNotification(row)} sx={{ alignItems: 'flex-start', py: 1.5, whiteSpace: 'normal' }}>
                            <Box>
                                <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.35 }}>
                                    {row.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                                    {row.body}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75 }}>
                                    {new Date(row.created_at).toLocaleString()}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
                )}
                <Divider />
                <MenuItem component={RouterLink} to={paymentsHref} onClick={handleClose}>
                    <Typography variant="body2" fontWeight={600} color="secondary.main">
                        Open payments
                    </Typography>
                </MenuItem>
            </Menu>
        </>
    )
}

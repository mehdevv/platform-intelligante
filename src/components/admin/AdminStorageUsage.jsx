import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import { useAuth } from '../../context/AuthContext'
import { formatBytes, getStorageQuotaBytes } from '../../lib/storageQuota'

const REFRESH_MS = 120_000

/**
 * @param {{ variant?: 'sidebar' | 'card' }} props
 */
export default function AdminStorageUsage({ variant = 'card' }) {
    const { supabase } = useAuth()
    const [usedBytes, setUsedBytes] = useState(null)
    const [error, setError] = useState(false)
    const quota = getStorageQuotaBytes()

    const load = useCallback(async () => {
        if (!supabase) return
        setError(false)
        const { data, error: rpcErr } = await supabase.rpc('admin_storage_usage_bytes')
        if (rpcErr) {
            setError(true)
            setUsedBytes(null)
            return
        }
        const n = typeof data === 'number' ? data : Number(data)
        setUsedBytes(Number.isFinite(n) ? n : 0)
    }, [supabase])

    useEffect(() => {
        if (!supabase) return undefined
        void load()
        const id = window.setInterval(() => void load(), REFRESH_MS)
        const onFocus = () => void load()
        window.addEventListener('focus', onFocus)
        return () => {
            window.clearInterval(id)
            window.removeEventListener('focus', onFocus)
        }
    }, [supabase, load])

    const pct = usedBytes != null && quota > 0 ? Math.min(100, (usedBytes / quota) * 100) : 0
    const isSidebar = variant === 'sidebar'

    if (error) {
        return (
            <Box sx={{ px: isSidebar ? 0 : 0 }}>
                <Typography variant={isSidebar ? 'caption' : 'body2'} color="text.secondary" sx={{ lineHeight: 1.4 }}>
                    Storage usage unavailable. Apply migration <Typography component="span" sx={{ fontFamily: 'monospace', fontSize: 'inherit' }}>20260523140000_admin_storage_usage_rpc.sql</Typography> or check staff role.
                </Typography>
            </Box>
        )
    }

    if (usedBytes == null) {
        return (
            <Box sx={{ width: '100%' }}>
                <LinearProgress sx={{ height: isSidebar ? 3 : 6, borderRadius: 1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Loading storage…
                </Typography>
            </Box>
        )
    }

    const label = `${formatBytes(usedBytes)} / ${formatBytes(quota)} used`
    const remaining = Math.max(0, quota - usedBytes)

    return (
        <Tooltip title={`About ${formatBytes(remaining)} remaining (quota from VITE_SUPABASE_STORAGE_QUOTA_BYTES).`} placement="top" enterDelay={400}>
            <Box sx={{ width: '100%' }}>
                <Typography
                    variant={isSidebar ? 'caption' : 'body2'}
                    color="text.secondary"
                    sx={{ fontWeight: isSidebar ? 600 : 700, mb: 0.5, letterSpacing: isSidebar ? '0.04em' : undefined, textTransform: isSidebar ? 'uppercase' : undefined }}
                >
                    Supabase storage
                </Typography>
                <LinearProgress variant="determinate" value={pct} sx={{ height: isSidebar ? 4 : 8, borderRadius: 1 }} color={pct > 90 ? 'error' : pct > 75 ? 'warning' : 'secondary'} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block', lineHeight: 1.35 }}>
                    {label}
                </Typography>
                <Typography
                    component={Link}
                    to="/admin/storage"
                    variant="caption"
                    sx={{ mt: 0.75, display: 'block', fontWeight: 700, color: 'secondary.main', textDecoration: 'none' }}
                >
                    Manage files →
                </Typography>
            </Box>
        </Tooltip>
    )
}

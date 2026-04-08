import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'

export default function RequireAdmin({ children }) {
    const { user, loading, profileLoading, isAdmin, supabaseConfigured } = useAuth()
    const location = useLocation()

    if (!supabaseConfigured) {
        return <Navigate to="/admin/login" replace state={{ from: location.pathname, reason: 'no_supabase' }} />
    }
    if (loading || (user && profileLoading)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                <CircularProgress color="secondary" />
            </Box>
        )
    }
    if (!user) {
        return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    }
    if (!isAdmin) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location.pathname, reason: 'not_admin' }}
            />
        )
    }
    return children
}

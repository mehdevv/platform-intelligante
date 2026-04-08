import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'

export default function RequireAuth({ children }) {
    const { user, loading, supabaseConfigured } = useAuth()
    const location = useLocation()

    if (!supabaseConfigured) {
        return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'no_supabase' }} />
    }
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                <CircularProgress color="secondary" />
            </Box>
        )
    }
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }
    return children
}

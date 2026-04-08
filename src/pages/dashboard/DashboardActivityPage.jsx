import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import EmptyState from '../../components/shell/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { reportPublicPath } from '../../lib/reportPath'

export default function DashboardActivityPage() {
    const { supabase, user } = useAuth()
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !user) {
                setLoading(false)
                return
            }
            const { data } = await supabase
                .from('usage_events')
                .select('id, event_type, created_at, metadata, reports(id, title, slug)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(100)
            if (!cancelled) {
                setRows(data || [])
                setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, user])

    return (
        <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800}>
                Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Logged events (search, report_open, exports, etc.). Retention policy applies in production.
            </Typography>
            {loading && (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={32} />
                </Stack>
            )}
            {!loading && !rows.length && (
                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <EmptyState title="No activity recorded">
                        <Button component={Link} to="/search" variant="outlined" size="small">
                            Try search
                        </Button>
                    </EmptyState>
                </Card>
            )}
            {!!rows.length && (
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <List disablePadding>
                        {rows.map(r => (
                            <ListItem key={r.id} divider>
                                <ListItemText
                                    primary={`${r.event_type}${r.reports ? ` · ${r.reports.title}` : ''}`}
                                    secondary={new Date(r.created_at).toLocaleString()}
                                />
                                {r.reports && (
                                    <Button component={Link} to={reportPublicPath(r.reports)} size="small">
                                        Open
                                    </Button>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </Card>
            )}
        </Stack>
    )
}

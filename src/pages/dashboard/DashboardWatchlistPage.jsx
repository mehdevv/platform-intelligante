import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EmptyState from '../../components/shell/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { reportPublicPath } from '../../lib/reportPath'

export default function DashboardWatchlistPage() {
    const { supabase, user } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    const load = async () => {
        if (!supabase || !user) return
        const { data } = await supabase
            .from('watchlist_items')
            .select('id, sector_id, report_id, sectors(name, slug), reports(id, title, slug)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        setItems(data || [])
    }

    useEffect(() => {
        let cancelled = false
        queueMicrotask(async () => {
            if (!supabase || !user) {
                if (!cancelled) setLoading(false)
                return
            }
            await load()
            if (!cancelled) setLoading(false)
        })
        return () => {
            cancelled = true
        }
    }, [supabase, user])

    const remove = async id => {
        if (!supabase) return
        await supabase.from('watchlist_items').delete().eq('id', id)
        load()
    }

    return (
        <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800}>
                Watchlist
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Sectors and reports you follow. Add from sector pages when signed in.
            </Typography>
            {loading && (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={32} />
                </Stack>
            )}
            {!loading && !items.length && (
                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <EmptyState title="Watchlist empty">
                        <Button component={Link} to="/sectors" variant="outlined" size="small">
                            Browse sectors
                        </Button>
                    </EmptyState>
                </Card>
            )}
            {!!items.length && (
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <List disablePadding>
                        {items.map(w => (
                            <ListItem
                                key={w.id}
                                secondaryAction={
                                    <IconButton edge="end" aria-label="remove" onClick={() => remove(w.id)}>
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={
                                        w.sectors
                                            ? `Sector: ${w.sectors.name}`
                                            : w.reports
                                              ? `Report: ${w.reports.title}`
                                              : 'Item'
                                    }
                                    secondary={
                                        w.sectors ? (
                                            <Button component={Link} to={`/sectors/${w.sectors.slug}`} size="small">
                                                Open sector
                                            </Button>
                                        ) : w.reports ? (
                                            <Button component={Link} to={reportPublicPath(w.reports)} size="small">
                                                Open report
                                            </Button>
                                        ) : null
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Card>
            )}
        </Stack>
    )
}

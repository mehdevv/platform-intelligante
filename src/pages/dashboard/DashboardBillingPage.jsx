import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { useAuth } from '../../context/AuthContext'

function formatTier(t) {
    if (!t) return '—'
    return t.charAt(0).toUpperCase() + t.slice(1)
}

export default function DashboardBillingPage() {
    const { supabase, user, subscription } = useAuth()
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !user) {
                setLoading(false)
                return
            }
            const { data } = await supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
            if (!cancelled) {
                setInvoices(data || [])
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
                Billing
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Active subscription row and recent invoices from Supabase (Stripe webhooks still to wire).
            </Typography>
            <Card variant="outlined" sx={{ p: 3, maxWidth: 480, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                    Current plan
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, mb: 2, fontWeight: 800 }}>
                    {subscription ? formatTier(subscription.plan_tier) : 'No active subscription'}
                </Typography>
                {subscription && (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Status: {subscription.status}
                        </Typography>
                        {subscription.current_period_end && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                Period ends {new Date(subscription.current_period_end).toLocaleDateString()}
                            </Typography>
                        )}
                    </>
                )}
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" gap={1} flexWrap="wrap">
                    <Button component={Link} to="/checkout" variant="contained" color="secondary" size="small">
                        Checkout
                    </Button>
                    <Button component={Link} to="/pricing" variant="outlined" size="small">
                        Pricing
                    </Button>
                </Stack>
            </Card>
            <Typography variant="subtitle1" fontWeight={700}>
                Invoices
            </Typography>
            {loading && (
                <Stack alignItems="center" py={2}>
                    <CircularProgress size={28} />
                </Stack>
            )}
            {!loading && !invoices.length && <Alert severity="info">No invoices yet.</Alert>}
            {!!invoices.length && (
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <List disablePadding>
                        {invoices.map(inv => (
                            <ListItem key={inv.id} divider>
                                <ListItemText
                                    primary={`${inv.amount_cents / 100} ${inv.currency}`}
                                    secondary={new Date(inv.created_at).toLocaleString()}
                                />
                                {inv.pdf_url && (
                                    <Button href={inv.pdf_url} target="_blank" rel="noreferrer" size="small">
                                        PDF
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

import React, { useCallback, useEffect, useState } from 'react'
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
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import { useAuth } from '../../context/AuthContext'
import { formatPriceFromCents } from '../../lib/moneyFormat'
import { cancelPlatformSubscription, cancelSectorAccess, formatPlanTier, isEntitlementActive } from '../../lib/accountActions'

const STATUS_CHIP = {
    active: { label: 'Active', color: 'success' },
    trialing: { label: 'Trial', color: 'info' },
    past_due: { label: 'Past due', color: 'warning' },
    canceled: { label: 'Canceled', color: 'default' },
    incomplete: { label: 'Incomplete', color: 'warning' },
}

export default function DashboardBillingPage() {
    const { supabase, user, subscription, refreshProfile } = useAuth()
    const [sectorAccess, setSectorAccess] = useState([])
    const [subscriptionHistory, setSubscriptionHistory] = useState([])
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')
    const [msg, setMsg] = useState('')
    const [busy, setBusy] = useState(false)
    const [cancelTarget, setCancelTarget] = useState(null)

    const load = useCallback(async () => {
        if (!supabase || !user) {
            setLoading(false)
            return
        }
        setErr('')
        const [ent, subs, inv] = await Promise.all([
            supabase
                .from('user_report_entitlements')
                .select(
                    'id, sector_id, expires_at, source, granted_at, notes, sectors:sector_id ( id, name, slug, subscription_price_cents, currency )',
                )
                .eq('user_id', user.id)
                .not('sector_id', 'is', null)
                .order('granted_at', { ascending: false }),
            supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10),
            supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        ])
        if (ent.error) setErr(ent.error.message)
        else setSectorAccess(ent.data || [])
        if (!ent.error) {
            setSubscriptionHistory(subs.data || [])
            setInvoices(inv.data || [])
        }
        setLoading(false)
    }, [supabase, user])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            await load()
            if (cancelled) return
        })()
        return () => {
            cancelled = true
        }
    }, [load])

    const activeSectors = sectorAccess.filter(isEntitlementActive)
    const expiredSectors = sectorAccess.filter(r => !isEntitlementActive(r))

    const runCancel = async () => {
        if (!cancelTarget) return
        setBusy(true)
        setMsg('')
        setErr('')
        let error
        if (cancelTarget.type === 'platform') {
            ;({ error } = await cancelPlatformSubscription(supabase))
        } else {
            ;({ error } = await cancelSectorAccess(supabase, cancelTarget.id))
        }
        setBusy(false)
        setCancelTarget(null)
        if (error) {
            const hint =
                error.message?.includes('Could not find the function') || error.code === 'PGRST202'
                    ? ' Run the latest Supabase migration (user_subscription_and_account_rls) on your project.'
                    : ''
            setErr((error.message || 'Cancel failed') + hint)
            return
        }
        setMsg(cancelTarget.type === 'platform' ? 'Platform subscription canceled.' : 'Sector access ended. You can subscribe again anytime from Pricing.')
        await refreshProfile()
        await load()
    }

    const closeDialog = () => {
        if (!busy) setCancelTarget(null)
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                    Billing & subscriptions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage sector access purchased via bank transfer, your platform plan (when assigned), and invoice history.
                </Typography>
            </Box>

            {msg && <Alert severity="success" onClose={() => setMsg('')}>{msg}</Alert>}
            {err && <Alert severity="error" onClose={() => setErr('')}>{err}</Alert>}

            {loading && (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={32} />
                </Stack>
            )}

            {!loading && (
                <>
                    <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    Sector subscriptions
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Monthly access to all reports in each sector. Pay by bank transfer on Pricing, then track approval under Payments.
                                </Typography>
                            </Box>
                            <Button component={Link} to="/pricing" variant="contained" color="secondary" size="small" disableElevation>
                                {activeSectors.length ? 'Add or upgrade sectors' : 'Subscribe to sectors'}
                            </Button>
                        </Stack>

                        {!activeSectors.length && (
                            <Alert severity="info" sx={{ mb: expiredSectors.length ? 2 : 0 }}>
                                No active sector access. Choose sectors on{' '}
                                <Box component={Link} to="/pricing" sx={{ fontWeight: 700, color: 'inherit' }}>
                                    Pricing
                                </Box>{' '}
                                and upload your receipt at checkout.
                            </Alert>
                        )}

                        {!!activeSectors.length && (
                            <List disablePadding>
                                {activeSectors.map(row => {
                                    const sector = row.sectors
                                    return (
                                        <ListItem
                                            key={row.id}
                                            divider
                                            sx={{ px: 0, alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}
                                            secondaryAction={
                                                <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                                                    {sector?.slug && (
                                                        <Button component={Link} to={`/sectors/${sector.slug}`} size="small">
                                                            View sector
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                        onClick={() =>
                                                            setCancelTarget({
                                                                type: 'sector',
                                                                id: row.id,
                                                                name: sector?.name || 'this sector',
                                                            })
                                                        }
                                                    >
                                                        Cancel access
                                                    </Button>
                                                </Stack>
                                            }
                                        >
                                            <ListItemText
                                                primary={sector?.name || 'Sector'}
                                                secondary={
                                                    <>
                                                        {row.expires_at
                                                            ? `Access until ${new Date(row.expires_at).toLocaleDateString()}`
                                                            : 'Open-ended access'}
                                                        {sector?.subscription_price_cents > 0 && (
                                                            <>
                                                                {' · '}
                                                                {formatPriceFromCents(sector.subscription_price_cents, sector.currency || 'DZD')}
                                                                /month
                                                            </>
                                                        )}
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    )
                                })}
                            </List>
                        )}

                        {!!expiredSectors.length && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                                    Expired or canceled
                                </Typography>
                                <List disablePadding dense>
                                    {expiredSectors.map(row => (
                                        <ListItem key={row.id} sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={row.sectors?.name || 'Sector'}
                                                secondary={
                                                    row.expires_at
                                                        ? `Ended ${new Date(row.expires_at).toLocaleDateString()}`
                                                        : 'No longer active'
                                                }
                                            />
                                            <Button
                                                component={Link}
                                                to={`/checkout?sectorIds=${row.sector_id}`}
                                                size="small"
                                                variant="outlined"
                                            >
                                                Renew
                                            </Button>
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                    </Card>

                    <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                            Platform membership
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Optional plan tier (Simple, Premium, Corporate) with quotas. Assigned by admin or future Stripe billing.
                        </Typography>

                        {subscription ? (
                            <Stack spacing={2}>
                                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                    <Typography variant="h6" fontWeight={800}>
                                        {formatPlanTier(subscription.plan_tier)}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={STATUS_CHIP[subscription.status]?.label || subscription.status}
                                        color={STATUS_CHIP[subscription.status]?.color || 'default'}
                                    />
                                </Stack>
                                {subscription.report_quota != null && (
                                    <Typography variant="body2" color="text.secondary">
                                        Report quota: {subscription.report_quota}
                                    </Typography>
                                )}
                                {subscription.current_period_end && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {subscription.status === 'canceled' ? 'Ended' : 'Period ends'}{' '}
                                        {new Date(subscription.current_period_end).toLocaleDateString()}
                                    </Typography>
                                )}
                                <Stack direction="row" gap={1} flexWrap="wrap">
                                    <Button component={Link} to="/pricing" variant="outlined" size="small">
                                        Compare sector plans
                                    </Button>
                                    {subscription.status === 'active' || subscription.status === 'trialing' || subscription.status === 'past_due' ? (
                                        <Button
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                            onClick={() =>
                                                setCancelTarget({
                                                    type: 'platform',
                                                    name: formatPlanTier(subscription.plan_tier),
                                                })
                                            }
                                        >
                                            Cancel membership
                                        </Button>
                                    ) : null}
                                </Stack>
                            </Stack>
                        ) : (
                            <Stack spacing={2}>
                                <Typography variant="body2" color="text.secondary">
                                    No active platform membership on your account.
                                </Typography>
                                <Button component={Link} to="/pricing" variant="outlined" size="small">
                                    Explore sector subscriptions
                                </Button>
                            </Stack>
                        )}

                        {subscriptionHistory.length > 1 && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                    History
                                </Typography>
                                <List dense disablePadding>
                                    {subscriptionHistory
                                        .filter(s => s.id !== subscription?.id)
                                        .map(s => (
                                            <ListItem key={s.id} sx={{ px: 0 }}>
                                                <ListItemText
                                                    primary={formatPlanTier(s.plan_tier)}
                                                    secondary={`${s.status} · ${new Date(s.created_at).toLocaleDateString()}`}
                                                />
                                            </ListItem>
                                        ))}
                                </List>
                            </>
                        )}
                    </Card>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Invoices
                        </Typography>
                        <Button component={Link} to="/dashboard/payments" size="small">
                            Payment receipts
                        </Button>
                    </Stack>

                    {!invoices.length && <Alert severity="info">No invoices yet. Approved bank transfers may appear here when invoicing is enabled.</Alert>}
                    {!!invoices.length && (
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <List disablePadding>
                                {invoices.map(inv => (
                                    <ListItem key={inv.id} divider>
                                        <ListItemText
                                            primary={`${(inv.amount_cents / 100).toLocaleString()} ${inv.currency}`}
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
                </>
            )}

            <Dialog open={!!cancelTarget} onClose={closeDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Cancel subscription?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {cancelTarget?.type === 'platform'
                            ? `Your ${cancelTarget?.name} platform membership will be marked canceled. You may lose quota-based benefits immediately.`
                            : `Access to ${cancelTarget?.name} will end now. You can subscribe again later from Pricing.`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={busy}>
                        Keep
                    </Button>
                    <Button color="error" variant="contained" onClick={runCancel} disabled={busy}>
                        {busy ? 'Canceling…' : 'Confirm cancel'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}

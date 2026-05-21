import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { useAuth } from '../../context/AuthContext'
import { formatPriceFromCents } from '../../lib/moneyFormat'

const STATUS_LABEL = {
    pending: { label: 'Awaiting review', color: 'warning' },
    approved: { label: 'Approved', color: 'success' },
    rejected: { label: 'Rejected', color: 'default' },
}

function describe(row) {
    if (row.kind === 'sector_subscription') {
        const name = row.sectors?.name || row.sector_id?.slice(0, 8)
        return { primary: `Sector subscription — ${name}`, link: row.sectors?.slug ? `/sectors/${row.sectors.slug}` : null }
    }
    if (row.kind === 'report') {
        const name = row.reports?.title || row.report_id?.slice(0, 8)
        return { primary: `Report — ${name}`, link: row.reports?.slug ? `/reports/${row.reports.slug}` : null }
    }
    return { primary: row.kind, link: null }
}

export default function DashboardPaymentsPage() {
    const { supabase, user } = useAuth()
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !user) {
                setLoading(false)
                return
            }
            const { data, error } = await supabase
                .from('payment_requests')
                .select('id, kind, report_id, sector_id, amount_cents, currency, status, admin_note, created_at, reviewed_at, reports:report_id ( id, title, slug ), sectors:sector_id ( id, name, slug )')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(100)
            if (cancelled) return
            if (error) setErr(error.message)
            else setRows(data || [])
            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, user])

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                    Payments & receipts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Bank-transfer receipts you uploaded. Access is granted once the admin approves your receipt.
                </Typography>
            </Box>
            {err && <Alert severity="error">{err}</Alert>}
            {loading ? (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={32} />
                </Stack>
            ) : rows.length === 0 ? (
                <Card variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        No payment requests yet. Subscribe to a sector or buy a single report to start.
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <Button component={Link} to="/pricing" variant="contained" color="secondary" disableElevation>
                            Sector subscriptions
                        </Button>
                        <Button component={Link} to="/reports">Browse reports</Button>
                    </Stack>
                </Card>
            ) : (
                <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Submitted</TableCell>
                                <TableCell>For</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Reviewer note</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(r => {
                                const d = describe(r)
                                const s = STATUS_LABEL[r.status] || { label: r.status, color: 'default' }
                                return (
                                    <TableRow key={r.id}>
                                        <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {d.link ? (
                                                <Box component={Link} to={d.link} sx={{ color: 'secondary.main', fontWeight: 600, textDecoration: 'none' }}>
                                                    {d.primary}
                                                </Box>
                                            ) : (
                                                d.primary
                                            )}
                                        </TableCell>
                                        <TableCell>{formatPriceFromCents(r.amount_cents, r.currency || 'DZD')}</TableCell>
                                        <TableCell>
                                            <Chip size="small" label={s.label} color={s.color} variant={r.status === 'rejected' ? 'outlined' : 'filled'} />
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 280 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {r.admin_note || '—'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </Stack>
    )
}

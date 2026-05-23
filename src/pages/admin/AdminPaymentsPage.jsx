import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'
import { logAdminAction } from '../../lib/adminAudit'
import { notifyPaymentEvent } from '../../lib/paymentNotify'
import { formatPriceFromCents } from '../../lib/moneyFormat'
import { getReceiptSignedUrl } from '../../lib/paymentReceiptUpload'
import {
    enrichPaymentRowsWithBundleSectors,
    grantSectorSubscriptionAccess,
    paymentRequestKindLabel,
    sectorIdsForPaymentApproval,
} from '../../lib/paymentRequestDisplay'

const TABS = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
]

const STATUS_COLOUR = {
    pending: 'warning',
    approved: 'success',
    rejected: 'default',
}

function userLabel(profile) {
    if (!profile) return '—'
    return profile.full_name || profile.notification_email || profile.id?.slice(0, 8)
}

function userSubLabel(profile) {
    if (!profile) return ''
    return profile.notification_email || ''
}

export default function AdminPaymentsPage() {
    const { supabase, user } = useAuth()
    const [status, setStatus] = useState('pending')
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')
    const [notice, setNotice] = useState('')

    const [reviewOpen, setReviewOpen] = useState(false)
    const [reviewRow, setReviewRow] = useState(null)
    const [reviewAction, setReviewAction] = useState('approve')
    const [reviewNote, setReviewNote] = useState('')
    const [reviewBusy, setReviewBusy] = useState(false)
    const [receiptUrl, setReceiptUrl] = useState('')
    const [receiptLoading, setReceiptLoading] = useState(false)

    const load = async () => {
        if (!supabase) return
        setLoading(true)
        setErr('')
        const { data, error } = await supabase
            .from('payment_requests')
            .select(
                'id, user_id, kind, report_id, sector_id, bundle_sector_ids, amount_cents, currency, receipt_storage_path, status, reviewed_by, reviewed_at, admin_note, created_at, profiles:user_id ( id, full_name, notification_email ), reports:report_id ( id, title, slug ), sectors:sector_id ( id, name, slug )',
            )
            .eq('status', status)
            .order('created_at', { ascending: false })
            .limit(200)
        if (error) setErr(error.message)
        else setRows(await enrichPaymentRowsWithBundleSectors(supabase, data || []))
        setLoading(false)
    }

    useEffect(() => {
        queueMicrotask(load)
    }, [supabase, status])

    const openReview = async (row, action) => {
        setReviewRow(row)
        setReviewAction(action)
        setReviewNote(row.admin_note || '')
        setReviewOpen(true)
        setReceiptUrl('')
        setReceiptLoading(true)
        const url = await getReceiptSignedUrl(supabase, row.receipt_storage_path, 600)
        setReceiptUrl(url || '')
        setReceiptLoading(false)
    }

    const closeReview = () => {
        if (reviewBusy) return
        setReviewOpen(false)
        setReviewRow(null)
        setReceiptUrl('')
    }

    const submitReview = async () => {
        if (!supabase || !reviewRow) return
        setReviewBusy(true)
        setErr('')
        setNotice('')
        try {
            if (reviewAction === 'approve') {
                if (reviewRow.kind === 'report') {
                    const notes = reviewNote.trim() || null
                    const { data: existing, error: selErr } = await supabase
                        .from('user_report_entitlements')
                        .select('id')
                        .eq('user_id', reviewRow.user_id)
                        .eq('report_id', reviewRow.report_id)
                        .maybeSingle()
                    if (selErr) throw new Error(selErr.message)
                    const patch = { source: 'purchase', notes, expires_at: null }
                    if (existing?.id) {
                        const { error } = await supabase.from('user_report_entitlements').update(patch).eq('id', existing.id)
                        if (error) throw new Error(error.message)
                    } else {
                        const { error } = await supabase
                            .from('user_report_entitlements')
                            .insert({
                                user_id: reviewRow.user_id,
                                report_id: reviewRow.report_id,
                                ...patch,
                            })
                        if (error) throw new Error(error.message)
                    }
                } else {
                    const sectorIds = sectorIdsForPaymentApproval(reviewRow)
                    if (sectorIds.length) {
                        await grantSectorSubscriptionAccess(supabase, {
                            userId: reviewRow.user_id,
                            sectorIds,
                            notes: reviewNote.trim() || null,
                        })
                    }
                }
            }
            const { error: updErr } = await supabase
                .from('payment_requests')
                .update({
                    status: reviewAction === 'approve' ? 'approved' : 'rejected',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user?.id ?? null,
                    admin_note: reviewNote.trim() || null,
                })
                .eq('id', reviewRow.id)
            if (updErr) throw new Error(updErr.message)
            await logAdminAction(supabase, {
                action: reviewAction === 'approve' ? 'approve_payment' : 'reject_payment',
                entityType: 'payment_request',
                entityId: reviewRow.id,
                diff: { kind: reviewRow.kind, target: reviewRow.report_id || reviewRow.sector_id },
            })
            const reviewStatus = reviewAction === 'approve' ? 'approved' : 'rejected'
            const emailResult = await notifyPaymentEvent(supabase, {
                event: 'reviewed',
                paymentRequestId: reviewRow.id,
                reviewStatus,
            })
            const bundleN = reviewRow.kind === 'sector_bundle' ? reviewRow.bundle_sector_ids?.length || 0 : 0
            let noticeText =
                reviewAction === 'approve'
                    ? reviewRow.kind === 'sector_bundle'
                        ? `Receipt approved — access granted for ${bundleN} sectors in one payment.`
                        : 'Receipt approved and access granted.'
                    : 'Receipt rejected.'
            if (!emailResult.ok) {
                const detail = emailResult.emails?.[0]?.reason || emailResult.reason || 'unknown'
                noticeText += ` Email not sent (${detail}). Check console & EmailJS template uses {{to_email}}.`
                if (emailResult.hint) noticeText += ` ${emailResult.hint}`
            }
            setNotice(noticeText)
            closeReview()
            load()
        } catch (ex) {
            setErr(ex?.message || 'Review failed')
        } finally {
            setReviewBusy(false)
        }
    }

    const reviewerNoteLabel = reviewAction === 'approve' ? 'Internal note (optional)' : 'Reason shown to the client (required)'

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                    Payment requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Review bank-transfer receipts uploaded by clients. Approving a sector subscription grants 30 days of access to every report in that sector; approving a report grants permanent access to that report.
                </Typography>
            </Box>
            {err && <Alert severity="error">{err}</Alert>}
            {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

            <Tabs value={status} onChange={(_, v) => setStatus(v)} textColor="secondary" indicatorColor="secondary">
                {TABS.map(t => (
                    <Tab key={t.value} value={t.value} label={t.label} />
                ))}
            </Tabs>

            {loading ? (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={32} />
                </Stack>
            ) : (
                <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Submitted</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>For</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(r => (
                                <TableRow key={r.id}>
                                    <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>{userLabel(r.profiles)}</Typography>
                                        {userSubLabel(r.profiles) && (
                                            <Typography variant="caption" color="text.secondary">{userSubLabel(r.profiles)}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{paymentRequestKindLabel(r)}</TableCell>
                                    <TableCell>{formatPriceFromCents(r.amount_cents, r.currency || 'DZD')}</TableCell>
                                    <TableCell>
                                        <Chip size="small" label={r.status} color={STATUS_COLOUR[r.status] || 'default'} variant={r.status === 'rejected' ? 'outlined' : 'filled'} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            {r.status === 'pending' ? (
                                                <>
                                                    <Button size="small" variant="outlined" onClick={() => openReview(r, 'approve')}>
                                                        Approve
                                                    </Button>
                                                    <Button size="small" color="error" variant="outlined" onClick={() => openReview(r, 'reject')}>
                                                        Reject
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button size="small" onClick={() => openReview(r, 'view')}>
                                                    View receipt
                                                </Button>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!rows.length && (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                                            No {status} requests.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            )}

            <Dialog open={reviewOpen} onClose={closeReview} fullWidth maxWidth="md">
                <DialogTitle>
                    {reviewAction === 'approve' && 'Approve receipt'}
                    {reviewAction === 'reject' && 'Reject receipt'}
                    {reviewAction === 'view' && 'Receipt'}
                </DialogTitle>
                <DialogContent dividers>
                    {reviewRow && (
                        <Stack spacing={2}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>USER</Typography>
                                    <Typography variant="body2" fontWeight={600}>{userLabel(reviewRow.profiles)}</Typography>
                                    {userSubLabel(reviewRow.profiles) && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{userSubLabel(reviewRow.profiles)}</Typography>
                                    )}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>FOR</Typography>
                                    <Typography variant="body2">{paymentRequestKindLabel(reviewRow)}</Typography>
                                    {reviewRow.kind === 'sector_bundle' && reviewRow.bundle_sectors?.length > 0 && (
                                        <Box component="ul" sx={{ m: '8px 0 0', pl: 2.5 }}>
                                            {reviewRow.bundle_sectors.map(s => (
                                                <Typography key={s.id} component="li" variant="caption" color="text.secondary">
                                                    {s.name}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>AMOUNT</Typography>
                                    <Typography variant="body2" fontWeight={700}>{formatPriceFromCents(reviewRow.amount_cents, reviewRow.currency || 'DZD')}</Typography>
                                </Box>
                            </Stack>

                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>RECEIPT</Typography>
                                {receiptLoading ? (
                                    <Stack alignItems="center" py={3}>
                                        <CircularProgress size={24} />
                                    </Stack>
                                ) : receiptUrl ? (
                                    /\.(png|jpe?g|webp|gif)$/i.test(reviewRow.receipt_storage_path) ? (
                                        <Box
                                            component="img"
                                            src={receiptUrl}
                                            alt="Receipt"
                                            sx={{ width: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}
                                        />
                                    ) : (
                                        <Button component="a" href={receiptUrl} target="_blank" rel="noopener noreferrer" variant="outlined">
                                            Open receipt (PDF)
                                        </Button>
                                    )
                                ) : (
                                    <Alert severity="warning">Could not load the receipt file.</Alert>
                                )}
                            </Box>

                            {reviewAction !== 'view' && (
                                <TextField
                                    label={reviewerNoteLabel}
                                    value={reviewNote}
                                    onChange={e => setReviewNote(e.target.value)}
                                    multiline
                                    minRows={2}
                                    fullWidth
                                    size="small"
                                />
                            )}

                            {reviewAction === 'view' && reviewRow.admin_note && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>ADMIN NOTE</Typography>
                                    <Typography variant="body2">{reviewRow.admin_note}</Typography>
                                </Box>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeReview} disabled={reviewBusy}>Close</Button>
                    {reviewAction === 'approve' && (
                        <Button variant="contained" color="success" disableElevation onClick={submitReview} disabled={reviewBusy}>
                            {reviewBusy ? 'Approving…' : 'Approve & grant access'}
                        </Button>
                    )}
                    {reviewAction === 'reject' && (
                        <Button variant="contained" color="error" disableElevation onClick={submitReview} disabled={reviewBusy || !reviewNote.trim()}>
                            {reviewBusy ? 'Rejecting…' : 'Reject'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Stack>
    )
}

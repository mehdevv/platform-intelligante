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
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'
import { logAdminAction } from '../../lib/adminAudit'

const TABS = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'read', label: 'Read' },
]

export default function AdminCorporateInboxPage() {
    const { supabase, user } = useAuth()
    const [filter, setFilter] = useState('all')
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')
    const [dialog, setDialog] = useState(null)
    const [busy, setBusy] = useState(false)
    const [notice, setNotice] = useState('')

    const load = async () => {
        if (!supabase) return
        setLoading(true)
        setErr('')
        let q = supabase
            .from('corporate_messages')
            .select('id, name, email, subject, body, status, created_at, read_at')
            .order('created_at', { ascending: false })
            .limit(500)
        if (filter !== 'all') q = q.eq('status', filter)
        const { data, error } = await q
        if (error) setErr(error.message)
        else setRows(data || [])
        setLoading(false)
    }

    useEffect(() => {
        queueMicrotask(load)
    }, [supabase, filter])

    const markRead = async row => {
        if (!supabase || !row || row.status === 'read') return
        setBusy(true)
        setNotice('')
        const now = new Date().toISOString()
        const { error } = await supabase
            .from('corporate_messages')
            .update({ status: 'read', read_at: now, read_by: user?.id ?? null })
            .eq('id', row.id)
        if (error) {
            setNotice(error.message)
            setBusy(false)
            return
        }
        await logAdminAction(supabase, {
            action: 'corporate_message_read',
            entityType: 'corporate_message',
            entityId: row.id,
        })
        const updated = { ...row, status: 'read', read_at: now }
        setRows(list => list.map(m => (m.id === row.id ? updated : m)))
        setDialog(prev => (prev?.id === row.id ? updated : prev))
        setBusy(false)
    }

    const openMessage = row => {
        setDialog(row)
        setNotice('')
        if (row.status === 'new') markRead(row)
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                    Corporate services inbox
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Contact requests submitted from the homepage corporate services form.
                </Typography>
            </Box>

            {err && (
                <Alert severity="error" onClose={() => setErr('')}>
                    {err}
                </Alert>
            )}

            <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ minHeight: 40 }}>
                {TABS.map(tab => (
                    <Tab key={tab.value} value={tab.value} label={tab.label} sx={{ textTransform: 'none', fontWeight: 700, minHeight: 40 }} />
                ))}
            </Tabs>

            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {loading ? (
                    <Stack alignItems="center" py={6}>
                        <CircularProgress size={36} />
                    </Stack>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Received</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Subject</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                            {filter === 'all' ? 'No corporate messages yet.' : `No ${filter} messages.`}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map(row => (
                                    <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => openMessage(row)}>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(row.created_at).toLocaleString()}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.email}</TableCell>
                                        <TableCell sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.subject}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={row.status === 'new' ? 'New' : 'Read'}
                                                color={row.status === 'new' ? 'secondary' : 'default'}
                                                variant={row.status === 'new' ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </Card>

            <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} maxWidth="sm" fullWidth>
                {dialog && (
                    <>
                        <DialogTitle sx={{ fontWeight: 800 }}>{dialog.subject}</DialogTitle>
                        <DialogContent dividers>
                            {notice && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {notice}
                                </Alert>
                            )}
                            <Stack spacing={1.5}>
                                <Typography variant="body2">
                                    <strong>From:</strong> {dialog.name}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Email:</strong>{' '}
                                    <Box component="a" href={`mailto:${dialog.email}`} sx={{ color: 'secondary.main' }}>
                                        {dialog.email}
                                    </Box>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(dialog.created_at).toLocaleString()}
                                    {dialog.read_at ? ` · Read ${new Date(dialog.read_at).toLocaleString()}` : ''}
                                </Typography>
                                <Divider />
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                    {dialog.body}
                                </Typography>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                component="a"
                                href={`mailto:${dialog.email}?subject=${encodeURIComponent(`Re: ${dialog.subject}`)}`}
                            >
                                Reply by email
                            </Button>
                            {dialog.status === 'new' && (
                                <Button onClick={() => markRead(dialog)} disabled={busy}>
                                    Mark as read
                                </Button>
                            )}
                            <Button onClick={() => setDialog(null)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Stack>
    )
}

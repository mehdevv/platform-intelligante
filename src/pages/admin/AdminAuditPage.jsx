import React, { useEffect, useMemo, useState } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useAuth } from '../../context/AuthContext'

const RECENT_LIMIT = 30
const FETCH_LIMIT = 300

function AuditTable({ rows }) {
    if (!rows.length) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 2 }}>
                No entries.
            </Typography>
        )
    }
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>When</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Id</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map(r => (
                    <TableRow key={r.id}>
                        <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                        <TableCell>{r.action}</TableCell>
                        <TableCell>{r.entity_type}</TableCell>
                        <TableCell>{r.entity_id || '—'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function AdminAuditPage() {
    const { supabase } = useAuth()
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase) {
                setLoading(false)
                return
            }
            const { data } = await supabase
                .from('admin_audit_log')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(FETCH_LIMIT)
            if (!cancelled) {
                setRows(data || [])
                setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [supabase])

    const { recent, history } = useMemo(() => {
        const recentRows = rows.slice(0, RECENT_LIMIT)
        const historyRows = rows.slice(RECENT_LIMIT)
        return { recent: recentRows, history: historyRows }
    }, [rows])

    return (
        <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800}>
                Audit log
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Recent staff actions (create/update/delete on key entities). The latest {RECENT_LIMIT} entries are shown above; older rows from this fetch stay in{' '}
                <strong>Log history</strong> on the same page.
            </Typography>
            {loading ? (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={32} />
                </Stack>
            ) : (
                <Stack spacing={2}>
                    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle2" fontWeight={700}>
                                Recent activity
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {recent.length} of last {RECENT_LIMIT}
                            </Typography>
                        </Stack>
                        <AuditTable rows={recent} />
                    </Card>

                    {history.length > 0 && (
                        <Accordion defaultExpanded={false} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:before': { display: 'none' } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, minHeight: 48 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%', pr: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        Log history
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ({history.length} older entr{history.length === 1 ? 'y' : 'ies'} — same page, collapsed by default)
                                    </Typography>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 0, pt: 0, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ overflow: 'auto' }}>
                                    <AuditTable rows={history} />
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    )}
                </Stack>
            )}
        </Stack>
    )
}

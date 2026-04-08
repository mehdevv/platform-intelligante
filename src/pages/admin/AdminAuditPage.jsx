import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'

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
            const { data } = await supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(100)
            if (!cancelled) {
                setRows(data || [])
                setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [supabase])

    return (
        <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800}>
                Audit log
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Recent staff actions (create/update/delete on key entities).
            </Typography>
            {loading ? (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={32} />
                </Stack>
            ) : (
                <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
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
                </Card>
            )}
        </Stack>
    )
}

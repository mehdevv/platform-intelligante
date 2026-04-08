import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'
import { logAdminAction } from '../../lib/adminAudit'

export default function AdminPromotionsPage() {
    const { supabase } = useAuth()
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [percentOff, setPercentOff] = useState('10')

    const load = async () => {
        if (!supabase) return
        const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false })
        setRows(data || [])
        setLoading(false)
    }

    useEffect(() => {
        queueMicrotask(() => load())
    }, [supabase])

    const create = async () => {
        if (!supabase) return
        await supabase.from('promotions').insert({
            code: code.trim().toUpperCase(),
            description: description.trim() || null,
            percent_off: parseFloat(percentOff) || 10,
        })
        await logAdminAction(supabase, { action: 'create', entityType: 'promotion', entityId: code })
        setOpen(false)
        setCode('')
        setDescription('')
        setPercentOff('10')
        load()
    }

    return (
        <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h5" fontWeight={800}>
                    Promotions
                </Typography>
                <Button variant="contained" color="secondary" size="small" onClick={() => setOpen(true)}>
                    New code
                </Button>
            </Stack>
            {loading ? (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={32} />
                </Stack>
            ) : (
                <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Code</TableCell>
                                <TableCell>% off</TableCell>
                                <TableCell>Redemptions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.code}</TableCell>
                                    <TableCell>{p.percent_off}</TableCell>
                                    <TableCell>
                                        {p.redemptions_count}
                                        {p.max_redemptions != null ? ` / ${p.max_redemptions}` : ''}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>New promotion</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="Code" fullWidth value={code} onChange={e => setCode(e.target.value)} size="small" />
                        <TextField label="Description" fullWidth value={description} onChange={e => setDescription(e.target.value)} size="small" />
                        <TextField label="Percent off" type="number" fullWidth value={percentOff} onChange={e => setPercentOff(e.target.value)} size="small" />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={create} disabled={!code.trim()}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}

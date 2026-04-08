import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsersPage() {
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
            const { data } = await supabase.from('profiles').select('id, full_name, app_role, locale, created_at, suspended_until').order('created_at', { ascending: false }).limit(200)
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
                Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Profiles (no auth email from client API). Use Supabase Auth dashboard for email. RLS allows staff to read all profiles.
            </Typography>
            <Alert severity="info">
                Admins sign in at <code>/admin/login</code>. To promote a user: SQL{' '}
                <code>update profiles set app_role = &apos;admin&apos; where id = &apos;…&apos;;</code>
            </Alert>
            {loading ? (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={32} />
                </Stack>
            ) : (
                <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>User id</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Locale</TableCell>
                                <TableCell>Joined</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                            {String(p.id).slice(0, 8)}…
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{p.full_name || '—'}</TableCell>
                                    <TableCell>
                                        <Chip label={p.app_role} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>{p.locale}</TableCell>
                                    <TableCell>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </Stack>
    )
}

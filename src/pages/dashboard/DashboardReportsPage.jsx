import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import EmptyState from '../../components/shell/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { reportPublicPath } from '../../lib/reportPath'

export default function DashboardReportsPage() {
    const { supabase, user } = useAuth()
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !user) {
                setLoading(false)
                return
            }
            const { data } = await supabase
                .from('user_report_entitlements')
                .select('id, source, expires_at, granted_at, reports(id, title, slug, sectors(name))')
                .eq('user_id', user.id)
                .order('granted_at', { ascending: false })
            if (!cancelled) {
                setRows(data || [])
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
                Reports library
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Entitlements from <strong>user_report_entitlements</strong>. Full list also on{' '}
                <Button component={Link} to="/my-reports" size="small" sx={{ fontWeight: 700, verticalAlign: 'baseline', p: 0, minWidth: 0 }}>
                    My reports
                </Button>
                .
            </Typography>
            {loading && (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={32} />
                </Stack>
            )}
            {!loading && !rows.length && (
                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <EmptyState title="No entitled reports" description="Purchases and grants appear here automatically.">
                        <Button component={Link} to="/reports" variant="outlined" size="small">
                            Browse catalogue
                        </Button>
                    </EmptyState>
                </Card>
            )}
            {!!rows.length && (
                <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Sector</TableCell>
                                <TableCell>Source</TableCell>
                                <TableCell align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(row => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.reports?.title}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.reports?.sectors?.name || '—'}</TableCell>
                                    <TableCell>{row.source}</TableCell>
                                    <TableCell align="right">
                                        {row.reports && (
                                            <Button component={Link} to={reportPublicPath(row.reports)} size="small">
                                                Open
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </Stack>
    )
}

import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Pagination from '@mui/material/Pagination'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import { useAuth } from '../../context/AuthContext'
import { reportPublicPath } from '../../lib/reportPath'
import { logAdminAction } from '../../lib/adminAudit'

export default function AdminReportsPage() {
    const { supabase } = useAuth()
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const load = async () => {
        if (!supabase) return
        let q = supabase.from('reports').select('id, slug, title, status, view_count, sectors(name), created_at').order('updated_at', { ascending: false })
        if (statusFilter !== 'all') q = q.eq('status', statusFilter)
        const { data } = await q
        setRows(data || [])
        setLoading(false)
    }

    useEffect(() => {
        queueMicrotask(() => load())
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on filter
    }, [supabase, statusFilter])

    const filtered = useMemo(() => {
        const s = search.trim().toLowerCase()
        if (!s) return rows
        return rows.filter(r => r.title?.toLowerCase().includes(s) || r.slug?.toLowerCase().includes(s))
    }, [rows, search])

    const remove = async id => {
        if (!supabase || !window.confirm('Delete this report?')) return
        await supabase.from('reports').delete().eq('id', id)
        await logAdminAction(supabase, { action: 'delete', entityType: 'report', entityId: id })
        load()
    }

    return (
        <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800}>
                Reports
            </Typography>
            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={2}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                Catalogue
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Live data from Supabase (all statuses for staff).
                            </Typography>
                        </Box>
                        <Stack direction="row" gap={1} flexWrap="wrap">
                            <TextField
                                size="small"
                                placeholder="Search"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                                sx={{ width: { xs: '100%', sm: 200 } }}
                            />
                            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} size="small" sx={{ minWidth: 120 }}>
                                <MenuItem value="all">All status</MenuItem>
                                <MenuItem value="published">Published</MenuItem>
                                <MenuItem value="draft">Draft</MenuItem>
                                <MenuItem value="review">Review</MenuItem>
                                <MenuItem value="archived">Archived</MenuItem>
                            </Select>
                            <Button component={Link} to="/admin/reports/new" variant="contained" color="secondary" startIcon={<AddIcon />} size="small" disableElevation>
                                New
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
                {loading ? (
                    <Stack alignItems="center" py={4}>
                        <CircularProgress size={32} />
                    </Stack>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>ID</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Sector</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Views</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map(r => (
                                    <TableRow key={r.id} hover>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                {String(r.id).slice(0, 8)}…
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {r.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                            {r.sectors?.name && <Chip label={r.sectors.name} size="small" variant="outlined" />}
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={r.status} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                            <Typography variant="caption">{r.view_count ?? 0}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            {r.status === 'published' && (
                                                <IconButton component={Link} to={reportPublicPath(r)} size="small" aria-label="Preview">
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            <IconButton component={Link} to={`/admin/reports/${r.id}`} size="small" aria-label="Edit">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" aria-label="Delete" onClick={() => remove(r.id)} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={1} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        {filtered.length} row(s)
                    </Typography>
                    <Pagination count={1} size="small" color="primary" disabled />
                </Stack>
            </Card>
        </Stack>
    )
}

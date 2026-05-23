import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useAuth } from '../../context/AuthContext'
import { logAdminAction } from '../../lib/adminAudit'
import {
    fetchStorageInventory,
    deleteNotNeededStorageFile,
    formatStorageSize,
    reasonLabel,
    STORAGE_CATEGORY_LABELS,
    STORAGE_TIED_LABELS,
} from '../../lib/adminStorageInventory'

const TABS = [
    { value: 'not_needed', label: 'Not needed' },
    { value: 'needed', label: 'Needed' },
    { value: 'all', label: 'All files' },
]

function categoryColour(cat) {
    if (cat === 'pdf') return 'primary'
    if (cat === 'image') return 'secondary'
    if (cat === 'receipt') return 'warning'
    return 'default'
}

export default function AdminStoragePage() {
    const { supabase } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')
    const [notice, setNotice] = useState('')
    const [tab, setTab] = useState('not_needed')
    const [deletingPath, setDeletingPath] = useState(null)
    const [bulkBusy, setBulkBusy] = useState(false)

    const load = useCallback(async () => {
        if (!supabase) return
        setLoading(true)
        setErr('')
        try {
            const list = await fetchStorageInventory(supabase)
            setItems(list)
        } catch (e) {
            setErr(e?.message || 'Failed to load storage inventory')
            setItems([])
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        void load()
    }, [load])

    const filtered = useMemo(() => {
        if (tab === 'needed') return items.filter(i => i.needed)
        if (tab === 'not_needed') return items.filter(i => !i.needed)
        return items
    }, [items, tab])

    const stats = useMemo(() => {
        const total = items.reduce((s, i) => s + i.bytes, 0)
        const needed = items.filter(i => i.needed)
        const notNeeded = items.filter(i => !i.needed)
        return {
            total,
            neededCount: needed.length,
            neededBytes: needed.reduce((s, i) => s + i.bytes, 0),
            notNeededCount: notNeeded.length,
            notNeededBytes: notNeeded.reduce((s, i) => s + i.bytes, 0),
        }
    }, [items])

    const byCategory = useMemo(() => {
        const map = new Map()
        for (const i of filtered) {
            const key = i.file_category || 'document'
            if (!map.has(key)) map.set(key, [])
            map.get(key).push(i)
        }
        return [...map.entries()].sort((a, b) => {
            const sumA = a[1].reduce((s, x) => s + x.bytes, 0)
            const sumB = b[1].reduce((s, x) => s + x.bytes, 0)
            return sumB - sumA
        })
    }, [filtered])

    const deleteOne = async item => {
        if (!supabase || item.needed) return
        const label = `${item.bucket}/${item.path}`
        if (!window.confirm(`Delete this file from storage?\n\n${label}\n\nThis cannot be undone.`)) return
        setDeletingPath(`${item.bucket}:${item.path}`)
        setErr('')
        setNotice('')
        try {
            await deleteNotNeededStorageFile(supabase, item.bucket, item.path)
            await logAdminAction(supabase, {
                action: 'delete',
                entityType: 'storage_file',
                entityId: label,
                diff: { reason: item.reason, bytes: item.bytes },
            })
            setNotice('File deleted.')
            await load()
        } catch (e) {
            setErr(e?.message || 'Delete failed')
        } finally {
            setDeletingPath(null)
        }
    }

    const deleteAllNotNeeded = async () => {
        const targets = items.filter(i => !i.needed)
        if (!targets.length) return
        if (
            !window.confirm(
                `Delete ${targets.length} not-needed file(s) (${formatStorageSize(stats.notNeededBytes)})?\n\nThis cannot be undone.`,
            )
        ) {
            return
        }
        setBulkBusy(true)
        setErr('')
        setNotice('')
        let ok = 0
        let fail = 0
        for (const item of targets) {
            try {
                await deleteNotNeededStorageFile(supabase, item.bucket, item.path)
                await logAdminAction(supabase, {
                    action: 'delete',
                    entityType: 'storage_file',
                    entityId: `${item.bucket}/${item.path}`,
                    diff: { reason: item.reason, bytes: item.bytes, bulk: true },
                })
                ok += 1
            } catch {
                fail += 1
            }
        }
        setNotice(fail ? `Deleted ${ok}; ${fail} failed.` : `Deleted ${ok} file(s).`)
        await load()
        setBulkBusy(false)
    }

    return (
        <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} gap={2}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>
                        Storage files
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
                        Supabase buckets only. Thumbnails and gallery images on imgBB are not listed here.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => void load()} disabled={loading || bulkBusy} aria-label="Refresh">
                        <RefreshIcon />
                    </IconButton>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled={loading || bulkBusy || stats.notNeededCount === 0}
                        onClick={() => void deleteAllNotNeeded()}
                    >
                        Delete all not needed
                    </Button>
                </Stack>
            </Stack>

            {err && <Alert severity="error">{err}</Alert>}
            {notice && (
                <Alert severity="success" onClose={() => setNotice('')}>
                    {notice}
                </Alert>
            )}

            {err?.includes('admin_storage_inventory') && (
                <Alert severity="info">
                    Run migration <Typography component="span" sx={{ fontFamily: 'monospace', fontSize: 'inherit' }}>20260528150000_admin_storage_inventory.sql</Typography> on Supabase.
                </Alert>
            )}

            <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                <Chip label={`Total ${formatStorageSize(stats.total)}`} variant="outlined" />
                <Chip label={`Needed ${stats.neededCount} · ${formatStorageSize(stats.neededBytes)}`} color="success" variant="outlined" />
                <Chip label={`Not needed ${stats.notNeededCount} · ${formatStorageSize(stats.notNeededBytes)}`} color="error" variant="outlined" />
            </Stack>

            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                {TABS.map(t => (
                    <Tab key={t.value} value={t.value} label={t.label} />
                ))}
            </Tabs>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress color="secondary" />
                </Box>
            )}

            {!loading && !filtered.length && (
                <Alert severity="info">{tab === 'not_needed' ? 'No removable files found.' : 'No files in this view.'}</Alert>
            )}

            {!loading &&
                byCategory.map(([category, rows]) => (
                    <Card key={category} variant="outlined" sx={{ overflow: 'hidden' }}>
                        <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(75, 91, 114, 0.06)', borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" fontWeight={800}>
                                    {STORAGE_CATEGORY_LABELS[category] || category}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {rows.length} file(s) · {formatStorageSize(rows.reduce((s, r) => s + r.bytes, 0))}
                                </Typography>
                            </Stack>
                        </Box>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Size</TableCell>
                                    <TableCell>Bucket / path</TableCell>
                                    <TableCell>Tied to</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map(row => {
                                    const busy = deletingPath === `${row.bucket}:${row.path}`
                                    return (
                                        <TableRow key={`${row.bucket}:${row.path}`} hover>
                                            <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                {formatStorageSize(row.bytes)}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {row.bucket}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                                    {row.path}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={STORAGE_TIED_LABELS[row.tied_type] || row.tied_type} sx={{ mb: 0.5 }} />
                                                <Typography variant="body2">{row.tied_label}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                    <Chip size="small" label={STORAGE_CATEGORY_LABELS[row.file_category] || row.file_category} color={categoryColour(row.file_category)} variant="outlined" />
                                                    {row.needed ? (
                                                        <Chip size="small" label="Needed" color="success" />
                                                    ) : (
                                                        <Chip size="small" label="Not needed" color="error" />
                                                    )}
                                                </Stack>
                                                {!row.needed && row.reason && (
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                        {reasonLabel(row.reason)}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                {!row.needed ? (
                                                    <Tooltip title="Delete from storage">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                disabled={busy || bulkBusy}
                                                                onClick={() => void deleteOne(row)}
                                                            >
                                                                {busy ? <CircularProgress size={18} /> : <DeleteOutlineIcon fontSize="small" />}
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        —
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </Card>
                ))}
        </Stack>
    )
}

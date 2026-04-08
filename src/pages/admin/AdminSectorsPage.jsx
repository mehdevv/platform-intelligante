import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'
import { slugify } from '../../lib/slugify'
import { logAdminAction } from '../../lib/adminAudit'

export default function AdminSectorsPage() {
    const { supabase } = useAuth()
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [featured, setFeatured] = useState(false)
    const [published, setPublished] = useState(true)

    const load = async () => {
        if (!supabase) return
        const { data } = await supabase.from('sectors').select('*').order('sort_order').order('name')
        setRows(data || [])
        setLoading(false)
    }

    useEffect(() => {
        queueMicrotask(() => load())
    }, [supabase])


    const add = async () => {
        if (!supabase) return
        await supabase.from('sectors').insert({
            name: name.trim(),
            slug: (slug.trim() || slugify(name)).trim(),
            description: description.trim() || null,
            featured,
            is_published: published,
            sort_order: rows.length,
        })
        await logAdminAction(supabase, { action: 'create', entityType: 'sector', entityId: (slug.trim() || slugify(name)).trim() })
        setOpen(false)
        setName('')
        setSlug('')
        setDescription('')
        setFeatured(false)
        setPublished(true)
        load()
    }

    return (
        <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h5" fontWeight={800}>
                    Sectors
                </Typography>
                <Button variant="contained" color="secondary" size="small" onClick={() => setOpen(true)}>
                    New sector
                </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
                Taxonomy for the public catalogue. Slug is used in <code>/sectors/:slug</code>.
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
                                <TableCell>Name</TableCell>
                                <TableCell>Slug</TableCell>
                                <TableCell>Published</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(s => (
                                <TableRow key={s.id}>
                                    <TableCell>{s.name}</TableCell>
                                    <TableCell>{s.slug}</TableCell>
                                    <TableCell>{s.is_published ? 'Yes' : 'No'}</TableCell>
                                    <TableCell align="right">
                                        <Button component={Link} to={`/sectors/${s.slug}`} size="small">
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>New sector</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="Name" fullWidth value={name} onChange={e => setName(e.target.value)} size="small" />
                        <TextField label="Slug" fullWidth value={slug} onChange={e => setSlug(e.target.value)} size="small" />
                        <TextField label="Description" fullWidth multiline minRows={2} value={description} onChange={e => setDescription(e.target.value)} size="small" />
                        <FormControlLabel control={<Switch checked={featured} onChange={e => setFeatured(e.target.checked)} />} label="Featured" />
                        <FormControlLabel control={<Switch checked={published} onChange={e => setPublished(e.target.checked)} />} label="Published" />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={add} disabled={!name.trim()}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}

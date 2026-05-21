import React, { useEffect, useRef, useState } from 'react'
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
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useAuth } from '../../context/AuthContext'
import { slugify } from '../../lib/slugify'
import { logAdminAction } from '../../lib/adminAudit'
import { uploadImageFileToImgbb } from '../../lib/imgbbUpload'
import { formatPriceFromCents, majorAmountToCents } from '../../lib/moneyFormat'

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
    const [iconFile, setIconFile] = useState(null)
    const [iconPreview, setIconPreview] = useState('')
    const [priceMajor, setPriceMajor] = useState('0.00')
    const newIconInputRef = useRef(null)

    const [editOpen, setEditOpen] = useState(false)
    const [editId, setEditId] = useState(null)
    const [editName, setEditName] = useState('')
    const [editSlug, setEditSlug] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editFeatured, setEditFeatured] = useState(false)
    const [editPublished, setEditPublished] = useState(true)
    const [editIconUrl, setEditIconUrl] = useState('')
    const [editPriceMajor, setEditPriceMajor] = useState('0.00')
    const [editSaving, setEditSaving] = useState(false)
    const [editUploading, setEditUploading] = useState(false)
    const editIconInputRef = useRef(null)
    const [formErr, setFormErr] = useState('')

    const load = async () => {
        if (!supabase) return
        const { data } = await supabase.from('sectors').select('*').order('sort_order').order('name')
        setRows(data || [])
        setLoading(false)
    }

    useEffect(() => {
        queueMicrotask(() => load())
    }, [supabase])

    const resetNewForm = () => {
        setName('')
        setSlug('')
        setDescription('')
        setFeatured(false)
        setPublished(true)
        setIconFile(null)
        setIconPreview('')
        if (newIconInputRef.current) newIconInputRef.current.value = ''
    }

    const onPickNewIcon = e => {
        const f = e.target.files?.[0]
        setIconFile(f || null)
        if (!f) {
            setIconPreview('')
            return
        }
        setIconPreview(URL.createObjectURL(f))
    }

    const add = async () => {
        if (!supabase) return
        setFormErr('')
        let iconUrl = null
        try {
            if (iconFile) {
                const { displayUrl } = await uploadImageFileToImgbb(iconFile)
                iconUrl = displayUrl
            }
        } catch (ex) {
            setFormErr(ex?.message || 'Icon upload failed')
            return
        }
        await supabase.from('sectors').insert({
            name: name.trim(),
            slug: (slug.trim() || slugify(name)).trim(),
            description: description.trim() || null,
            featured,
            is_published: published,
            sort_order: rows.length,
            icon_image_url: iconUrl,
            subscription_price_cents: Math.max(0, majorAmountToCents(priceMajor)),
        })
        await logAdminAction(supabase, { action: 'create', entityType: 'sector', entityId: (slug.trim() || slugify(name)).trim() })
        setOpen(false)
        resetNewForm()
        load()
    }

    const openEdit = s => {
        setFormErr('')
        setEditId(s.id)
        setEditName(s.name || '')
        setEditSlug(s.slug || '')
        setEditDescription(s.description || '')
        setEditFeatured(!!s.featured)
        setEditPublished(!!s.is_published)
        setEditIconUrl(s.icon_image_url || '')
        setEditPriceMajor(((s.subscription_price_cents ?? 0) / 100).toFixed(2))
        setEditOpen(true)
        if (editIconInputRef.current) editIconInputRef.current.value = ''
    }

    const saveEdit = async () => {
        if (!supabase || !editId) return
        setEditSaving(true)
        setFormErr('')
        const { error } = await supabase
            .from('sectors')
            .update({
                name: editName.trim(),
                slug: editSlug.trim(),
                description: editDescription.trim() || null,
                featured: editFeatured,
                is_published: editPublished,
                icon_image_url: editIconUrl.trim() || null,
            })
            .eq('id', editId)
        setEditSaving(false)
        if (error) {
            setFormErr(error.message)
            return
        }
        await logAdminAction(supabase, { action: 'update', entityType: 'sector', entityId: editId, diff: { slug: editSlug } })
        setEditOpen(false)
        setEditId(null)
        load()
    }

    const uploadEditIcon = async e => {
        const f = e.target.files?.[0]
        e.target.value = ''
        if (!f || !supabase) return
        setEditUploading(true)
        setFormErr('')
        try {
            const { displayUrl } = await uploadImageFileToImgbb(f)
            setEditIconUrl(displayUrl)
        } catch (ex) {
            setFormErr(ex?.message || 'Upload failed')
        } finally {
            setEditUploading(false)
        }
    }

    const clearEditIcon = () => {
        setEditIconUrl('')
        if (editIconInputRef.current) editIconInputRef.current.value = ''
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
                Taxonomy for the public catalogue. Slug is used in <code>/sectors/:slug</code>. Optional icons are hosted on imgBB — set{' '}
                <Box component="code" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>VITE_IMGBB_API_KEY</Box> in <code>.env</code>.
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
                                <TableCell width={56}>Icon</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Slug</TableCell>
                                <TableCell>Monthly price</TableCell>
                                <TableCell>Published</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(s => (
                                <TableRow key={s.id}>
                                    <TableCell>
                                        {s.icon_image_url ? (
                                            <Avatar src={s.icon_image_url} alt="" variant="rounded" sx={{ width: 40, height: 40 }} />
                                        ) : (
                                            <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'rgba(25,127,148,0.12)', color: 'secondary.main' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                                                    category
                                                </span>
                                            </Avatar>
                                        )}
                                    </TableCell>
                                    <TableCell>{s.name}</TableCell>
                                    <TableCell>{s.slug}</TableCell>
                                    <TableCell>
                                        {(s.subscription_price_cents ?? 0) > 0
                                            ? formatPriceFromCents(s.subscription_price_cents, s.currency || 'DZD')
                                            : '—'}
                                    </TableCell>
                                    <TableCell>{s.is_published ? 'Yes' : 'No'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" aria-label="Edit" onClick={() => openEdit(s)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
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
                    {formErr && (
                        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                            {formErr}
                        </Typography>
                    )}
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="Name" fullWidth value={name} onChange={e => setName(e.target.value)} size="small" />
                        <TextField label="Slug" fullWidth value={slug} onChange={e => setSlug(e.target.value)} size="small" />
                        <TextField label="Description" fullWidth multiline minRows={2} value={description} onChange={e => setDescription(e.target.value)} size="small" />
                        <TextField
                            label="Monthly subscription price (DZD)"
                            fullWidth
                            size="small"
                            type="number"
                            value={priceMajor}
                            onChange={e => setPriceMajor(e.target.value)}
                            inputProps={{ min: 0, step: '0.01' }}
                            helperText="Shown on /pricing. Set to 0 to hide this sector from the subscriptions carousel."
                        />
                        <FormControlLabel control={<Switch checked={featured} onChange={e => setFeatured(e.target.checked)} />} label="Featured" />
                        <FormControlLabel control={<Switch checked={published} onChange={e => setPublished(e.target.checked)} />} label="Published" />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Sector icon (optional)
                            </Typography>
                            <input ref={newIconInputRef} type="file" accept="image/*" hidden onChange={onPickNewIcon} />
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                <Button size="small" variant="outlined" onClick={() => newIconInputRef.current?.click()}>
                                    {iconFile ? 'Change icon' : 'Upload icon'}
                                </Button>
                                {iconPreview && <Avatar src={iconPreview} variant="rounded" sx={{ width: 48, height: 48 }} />}
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpen(false); resetNewForm(); setFormErr('') }}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={add} disabled={!name.trim()}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editOpen} onClose={() => !editSaving && setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit sector</DialogTitle>
                <DialogContent>
                    {formErr && (
                        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                            {formErr}
                        </Typography>
                    )}
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="Name" fullWidth value={editName} onChange={e => setEditName(e.target.value)} size="small" />
                        <TextField label="Slug" fullWidth value={editSlug} onChange={e => setEditSlug(e.target.value)} size="small" />
                        <TextField label="Description" fullWidth multiline minRows={2} value={editDescription} onChange={e => setEditDescription(e.target.value)} size="small" />
                        <TextField
                            label="Monthly subscription price (DZD)"
                            fullWidth
                            size="small"
                            type="number"
                            value={editPriceMajor}
                            onChange={e => setEditPriceMajor(e.target.value)}
                            inputProps={{ min: 0, step: '0.01' }}
                            helperText="Shown on /pricing. Set to 0 to hide this sector from the subscriptions carousel."
                        />
                        <FormControlLabel control={<Switch checked={editFeatured} onChange={e => setEditFeatured(e.target.checked)} />} label="Featured" />
                        <FormControlLabel control={<Switch checked={editPublished} onChange={e => setEditPublished(e.target.checked)} />} label="Published" />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Sector icon
                            </Typography>
                            <input ref={editIconInputRef} type="file" accept="image/*" hidden onChange={uploadEditIcon} />
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                <Button size="small" variant="outlined" disabled={editUploading} onClick={() => editIconInputRef.current?.click()}>
                                    {editUploading ? 'Uploading…' : 'Upload new icon'}
                                </Button>
                                {editIconUrl && (
                                    <>
                                        <Avatar src={editIconUrl} variant="rounded" sx={{ width: 48, height: 48 }} />
                                        <IconButton size="small" aria-label="Remove icon" onClick={clearEditIcon}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setEditOpen(false); setEditId(null); setFormErr('') }} disabled={editSaving}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="secondary" onClick={saveEdit} disabled={editSaving || !editName.trim() || !editSlug.trim()}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}

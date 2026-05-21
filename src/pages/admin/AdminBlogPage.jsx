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
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import ImageIcon from '@mui/icons-material/Image'
import AddLinkIcon from '@mui/icons-material/AddLink'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useAuth } from '../../context/AuthContext'
import { slugify } from '../../lib/slugify'
import { logAdminAction } from '../../lib/adminAudit'
import { uploadImageFileToImgbb } from '../../lib/imgbbUpload'
import { uploadBlogSourceFileToStorage } from '../../lib/blogSourceUpload'

function normalizeSources(rows) {
    if (!Array.isArray(rows)) return []
    return rows
        .map(s => ({ label: String(s?.label || '').trim(), url: String(s?.url || '').trim() }))
        .filter(s => s.url.length > 0)
}

function parseSourcesFromDb(raw) {
    if (!Array.isArray(raw)) return []
    return raw.map(s => ({ label: String(s?.label || ''), url: String(s?.url || '') }))
}

export default function AdminBlogPage() {
    const { supabase, user } = useAuth()
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState('create')
    const [editingId, setEditingId] = useState(null)
    const [editingSeo, setEditingSeo] = useState({})
    const [editingPublishedAt, setEditingPublishedAt] = useState(null)

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [tag, setTag] = useState('News')
    const [excerpt, setExcerpt] = useState('')
    const [body, setBody] = useState('')
    const [status, setStatus] = useState('draft')
    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [coverBusy, setCoverBusy] = useState(false)
    const [sources, setSources] = useState([])
    const [sourceUploadBusy, setSourceUploadBusy] = useState(false)
    const [saveBusy, setSaveBusy] = useState(false)
    const [err, setErr] = useState('')

    const coverInputRef = useRef(null)
    const sourceFileInputRef = useRef(null)

    const load = async () => {
        if (!supabase) return
        const { data } = await supabase.from('blog_posts').select('*').order('updated_at', { ascending: false })
        setRows(data || [])
        setLoading(false)
    }

    useEffect(() => {
        queueMicrotask(() => load())
    }, [supabase])

    const resetForm = () => {
        setDialogMode('create')
        setEditingId(null)
        setEditingSeo({})
        setEditingPublishedAt(null)
        setTitle('')
        setSlug('')
        setTag('News')
        setExcerpt('')
        setBody('')
        setStatus('draft')
        setCoverImageUrl('')
        setSources([])
        setErr('')
    }

    const openCreate = () => {
        resetForm()
        setDialogOpen(true)
    }

    const openEdit = row => {
        setErr('')
        setDialogMode('edit')
        setEditingId(row.id)
        setEditingSeo(row.seo && typeof row.seo === 'object' ? { ...row.seo } : {})
        setEditingPublishedAt(row.published_at || null)
        setTitle(row.title || '')
        setSlug(row.slug || '')
        setTag((row.seo && row.seo.tag) || 'News')
        setExcerpt(row.excerpt || '')
        setBody(row.body || '')
        setStatus(row.status === 'published' ? 'published' : 'draft')
        setCoverImageUrl(row.cover_image_url || '')
        setSources(parseSourcesFromDb(row.sources))
        setDialogOpen(true)
    }

    const onPickCover = async e => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file || !supabase) return
        setCoverBusy(true)
        setErr('')
        try {
            const { displayUrl } = await uploadImageFileToImgbb(file)
            setCoverImageUrl(displayUrl)
        } catch (ex) {
            setErr(ex?.message || 'Cover upload failed')
        } finally {
            setCoverBusy(false)
        }
    }

    const onPickSourceFile = async e => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file || !supabase || !user) return
        setSourceUploadBusy(true)
        setErr('')
        try {
            const url = await uploadBlogSourceFileToStorage(supabase, user.id, file)
            setSources(prev => [...prev, { label: file.name || 'Download', url }])
        } catch (ex) {
            setErr(ex?.message || 'File upload failed')
        } finally {
            setSourceUploadBusy(false)
        }
    }

    const save = async () => {
        if (!supabase || !user || !title.trim()) return
        setSaveBusy(true)
        setErr('')
        const finalSlug = (slug.trim() || slugify(title)).trim()
        const seo = { ...editingSeo, tag: tag.trim() || 'News' }
        const payload = {
            title: title.trim(),
            slug: finalSlug,
            excerpt: excerpt.trim() || null,
            body: body.trim() || null,
            status,
            seo,
            cover_image_url: coverImageUrl.trim() || null,
            sources: normalizeSources(sources),
        }

        if (dialogMode === 'create') {
            const published_at = status === 'published' ? new Date().toISOString() : null
            const { error } = await supabase.from('blog_posts').insert({
                ...payload,
                author_id: user.id,
                published_at,
            })
            setSaveBusy(false)
            if (error) {
                setErr(error.message)
                return
            }
            await logAdminAction(supabase, { action: 'create', entityType: 'blog_post', entityId: finalSlug })
        } else {
            const published_at =
                status === 'published' ? editingPublishedAt || new Date().toISOString() : null
            const { error } = await supabase.from('blog_posts').update({ ...payload, published_at }).eq('id', editingId)
            setSaveBusy(false)
            if (error) {
                setErr(error.message)
                return
            }
            await logAdminAction(supabase, { action: 'update', entityType: 'blog_post', entityId: finalSlug })
        }

        setDialogOpen(false)
        resetForm()
        load()
    }

    return (
        <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h5" fontWeight={800}>
                    Blog & news
                </Typography>
                <Button variant="contained" color="secondary" size="small" onClick={openCreate}>
                    New post
                </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
                Posts with status <strong>published</strong> appear on <code>/blog</code> when <code>published_at</code> is set. Cover images use imgBB (
                <code>VITE_IMGBB_API_KEY</code>); source files use the <code>blog-sources</code> storage bucket.
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
                                <TableCell>Title</TableCell>
                                <TableCell>Slug</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.title}</TableCell>
                                    <TableCell>{p.slug}</TableCell>
                                    <TableCell>{p.status}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Button component={Link} to={`/blog/${p.slug}`} size="small">
                                                View
                                            </Button>
                                            <Button size="small" variant="outlined" onClick={() => openEdit(p)}>
                                                Edit
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
            <Dialog open={dialogOpen} onClose={() => !saveBusy && setDialogOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>{dialogMode === 'create' ? 'New post' : 'Edit post'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {err && <Alert severity="error">{err}</Alert>}
                        <TextField label="Title" fullWidth value={title} onChange={e => setTitle(e.target.value)} size="small" required />
                        <TextField label="Slug" fullWidth value={slug} onChange={e => setSlug(e.target.value)} size="small" helperText="URL segment; generated from title if empty" />
                        <TextField label="Tag" fullWidth value={tag} onChange={e => setTag(e.target.value)} size="small" helperText="Shown as the chip on listing and article" />
                        <TextField label="Excerpt" fullWidth multiline minRows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} size="small" />
                        <TextField label="Body" fullWidth multiline minRows={10} value={body} onChange={e => setBody(e.target.value)} size="small" />
                        <TextField label="Status" select fullWidth size="small" value={status} onChange={e => setStatus(e.target.value)}>
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="published">Published</MenuItem>
                        </TextField>

                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                Cover image (optional)
                            </Typography>
                            <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={onPickCover} />
                            <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={coverBusy ? <CircularProgress size={16} /> : <ImageIcon />}
                                    disabled={coverBusy}
                                    onClick={() => coverInputRef.current?.click()}
                                >
                                    {coverBusy ? 'Uploading…' : coverImageUrl ? 'Change cover' : 'Upload cover'}
                                </Button>
                                {coverImageUrl && (
                                    <Button size="small" onClick={() => setCoverImageUrl('')}>
                                        Remove cover
                                    </Button>
                                )}
                            </Stack>
                            {coverImageUrl && (
                                <Box
                                    component="img"
                                    src={coverImageUrl}
                                    alt=""
                                    sx={{ mt: 1.5, maxWidth: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                                />
                            )}
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                Sources & files
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Add links manually, or upload PDFs / documents (stored in Supabase, public URL).
                            </Typography>
                            <input ref={sourceFileInputRef} type="file" hidden onChange={onPickSourceFile} />
                            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<AddLinkIcon />}
                                    onClick={() => setSources(prev => [...prev, { label: '', url: '' }])}
                                >
                                    Add link
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={sourceUploadBusy ? <CircularProgress size={16} /> : <AttachFileIcon />}
                                    disabled={sourceUploadBusy}
                                    onClick={() => sourceFileInputRef.current?.click()}
                                >
                                    {sourceUploadBusy ? 'Uploading…' : 'Upload file'}
                                </Button>
                            </Stack>
                            <Stack spacing={1.5}>
                                {sources.map((s, i) => (
                                    <Stack key={i} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                                        <TextField
                                            label="Label"
                                            size="small"
                                            value={s.label}
                                            onChange={e => {
                                                const v = e.target.value
                                                setSources(prev => prev.map((row, j) => (j === i ? { ...row, label: v } : row)))
                                            }}
                                            sx={{ flex: 1, minWidth: 120 }}
                                        />
                                        <TextField
                                            label="URL"
                                            size="small"
                                            value={s.url}
                                            onChange={e => {
                                                const v = e.target.value
                                                setSources(prev => prev.map((row, j) => (j === i ? { ...row, url: v } : row)))
                                            }}
                                            sx={{ flex: 2, minWidth: 0 }}
                                        />
                                        <IconButton aria-label="Remove source" onClick={() => setSources(prev => prev.filter((_, j) => j !== i))} size="small">
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={saveBusy}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="secondary" onClick={save} disabled={!title.trim() || saveBusy}>
                        {saveBusy ? 'Saving…' : dialogMode === 'create' ? 'Create' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}

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
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'
import { slugify } from '../../lib/slugify'
import { logAdminAction } from '../../lib/adminAudit'

export default function AdminBlogPage() {
    const { supabase, user } = useAuth()
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [body, setBody] = useState('')
    const [status, setStatus] = useState('draft')

    const load = async () => {
        if (!supabase) return
        const { data } = await supabase.from('blog_posts').select('*').order('updated_at', { ascending: false })
        setRows(data || [])
        setLoading(false)
    }

    useEffect(() => {
        queueMicrotask(() => load())
    }, [supabase])


    const create = async () => {
        if (!supabase || !user) return
        await supabase.from('blog_posts').insert({
            title: title.trim(),
            slug: (slug.trim() || slugify(title)).trim(),
            excerpt: excerpt.trim() || null,
            body: body.trim() || null,
            status,
            author_id: user.id,
            published_at: status === 'published' ? new Date().toISOString() : null,
            seo: {},
        })
        await logAdminAction(supabase, { action: 'create', entityType: 'blog_post', entityId: slug })
        setOpen(false)
        setTitle('')
        setSlug('')
        setExcerpt('')
        setBody('')
        setStatus('draft')
        load()
    }

    return (
        <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h5" fontWeight={800}>
                    Blog & news
                </Typography>
                <Button variant="contained" color="secondary" size="small" onClick={() => setOpen(true)}>
                    New post
                </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
                Posts with status <strong>published</strong> appear on <code>/blog</code> when <code>published_at</code> is set.
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
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.title}</TableCell>
                                    <TableCell>{p.slug}</TableCell>
                                    <TableCell>{p.status}</TableCell>
                                    <TableCell align="right">
                                        <Button component={Link} to={`/blog/${p.slug}`} size="small">
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
                <DialogTitle>New post</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="Title" fullWidth value={title} onChange={e => setTitle(e.target.value)} size="small" />
                        <TextField label="Slug" fullWidth value={slug} onChange={e => setSlug(e.target.value)} size="small" />
                        <TextField label="Excerpt" fullWidth multiline minRows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} size="small" />
                        <TextField label="Body" fullWidth multiline minRows={4} value={body} onChange={e => setBody(e.target.value)} size="small" />
                        <TextField label="Status" select fullWidth size="small" value={status} onChange={e => setStatus(e.target.value)}>
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="published">Published</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={create} disabled={!title.trim()}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}

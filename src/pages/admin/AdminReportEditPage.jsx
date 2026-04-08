import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'
import { logAdminAction } from '../../lib/adminAudit'

export default function AdminReportEditPage() {
    const { reportId } = useParams()
    const { supabase } = useAuth()
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [summary, setSummary] = useState('')
    const [status, setStatus] = useState('draft')
    const [previewPct, setPreviewPct] = useState(10)
    const [priceCents, setPriceCents] = useState(0)
    const [sectorId, setSectorId] = useState('')
    const [sectors, setSectors] = useState([])
    const [publishedAt, setPublishedAt] = useState(null)
    const [err, setErr] = useState('')
    const [msg, setMsg] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !reportId) {
                setLoading(false)
                return
            }
            const [{ data: sec }, { data: rep, error }] = await Promise.all([
                supabase.from('sectors').select('id, name').order('name'),
                supabase.from('reports').select('*').eq('id', reportId).single(),
            ])
            if (cancelled) return
            setSectors(sec || [])
            if (error || !rep) {
                setErr(error?.message || 'Not found')
                setLoading(false)
                return
            }
            setTitle(rep.title || '')
            setSlug(rep.slug || '')
            setSummary(rep.summary || '')
            setStatus(rep.status || 'draft')
            setPreviewPct(rep.preview_pct ?? 10)
            setPriceCents(rep.price_cents ?? 0)
            setSectorId(rep.sector_id || '')
            setPublishedAt(rep.published_at || null)
            setLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, reportId])

    const save = async () => {
        if (!supabase || !reportId) return
        setSaving(true)
        setErr('')
        setMsg('')
        const nextPublished = status === 'published' ? publishedAt || new Date().toISOString() : null
        const { error } = await supabase
            .from('reports')
            .update({
                title: title.trim(),
                slug: slug.trim(),
                summary: summary.trim() || null,
                status,
                preview_pct: Math.min(100, Math.max(0, Number(previewPct))),
                price_cents: Math.max(0, Number(priceCents) || 0),
                sector_id: sectorId || null,
                published_at: nextPublished,
            })
            .eq('id', reportId)
        if (!error && status === 'published' && nextPublished) setPublishedAt(nextPublished)
        setSaving(false)
        if (error) setErr(error.message)
        else {
            setMsg('Saved.')
            await logAdminAction(supabase, { action: 'update', entityType: 'report', entityId: reportId, diff: { title, status } })
        }
    }

    if (loading) {
        return (
            <Stack alignItems="center" py={6}>
                <CircularProgress />
            </Stack>
        )
    }

    return (
        <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800}>
                Edit report
            </Typography>
            <Typography variant="body2" color="text.secondary">
                ID: <Typography component="span" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{reportId}</Typography>
            </Typography>
            {err && <Alert severity="error">{err}</Alert>}
            {msg && <Alert severity="success">{msg}</Alert>}
            <Card variant="outlined" sx={{ p: 3, maxWidth: 640, borderRadius: 2 }}>
                <Stack spacing={2}>
                    <TextField label="Title" fullWidth size="small" value={title} onChange={e => setTitle(e.target.value)} />
                    <TextField label="Slug" fullWidth size="small" value={slug} onChange={e => setSlug(e.target.value)} />
                    <TextField label="Sector" select fullWidth size="small" value={sectorId} onChange={e => setSectorId(e.target.value)}>
                        <MenuItem value="">None</MenuItem>
                        {sectors.map(s => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField label="Summary" fullWidth multiline minRows={3} size="small" value={summary} onChange={e => setSummary(e.target.value)} />
                    <TextField label="Status" select fullWidth size="small" value={status} onChange={e => setStatus(e.target.value)}>
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="review">Review</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                    </TextField>
                    <TextField label="Preview % free" type="number" fullWidth size="small" value={previewPct} onChange={e => setPreviewPct(e.target.value)} inputProps={{ min: 0, max: 100 }} />
                    <TextField label="Price (cents)" type="number" fullWidth size="small" value={priceCents} onChange={e => setPriceCents(e.target.value)} />
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" color="secondary" disableElevation disabled={saving} onClick={save}>
                            Save
                        </Button>
                        <Button component={Link} to="/admin/reports" variant="outlined">
                            Back to list
                        </Button>
                    </Stack>
                </Stack>
            </Card>
        </Stack>
    )
}

import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import { useAuth } from '../../context/AuthContext'
import { slugify } from '../../lib/slugify'
import { logAdminAction } from '../../lib/adminAudit'

export default function AdminReportNewPage() {
    const { supabase, user } = useAuth()
    const navigate = useNavigate()
    const [sectors, setSectors] = useState([])
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [sectorId, setSectorId] = useState('')
    const [summary, setSummary] = useState('')
    const [priceCents, setPriceCents] = useState('0')
    const [err, setErr] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        ;(async () => {
            if (!supabase) return
            const { data } = await supabase.from('sectors').select('id, name').order('name')
            setSectors(data || [])
        })()
    }, [supabase])

    const save = async () => {
        if (!supabase || !user) return
        setErr('')
        setSaving(true)
        const finalSlug = (slug.trim() || slugify(title)).trim()
        const { data, error } = await supabase
            .from('reports')
            .insert({
                title: title.trim(),
                slug: finalSlug,
                sector_id: sectorId || null,
                summary: summary.trim() || null,
                status: 'draft',
                price_cents: Math.max(0, parseInt(priceCents, 10) || 0),
                created_by: user.id,
            })
            .select('id')
            .single()
        setSaving(false)
        if (error) {
            setErr(error.message)
            return
        }
        await logAdminAction(supabase, { action: 'create', entityType: 'report', entityId: data.id, diff: { title } })
        navigate(`/admin/reports/${data.id}`)
    }

    return (
        <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800}>
                New report
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Create catalogue metadata. Upload PDFs to storage and attach paths in edit view (report_assets).
            </Typography>
            {err && <Alert severity="error">{err}</Alert>}
            <Card variant="outlined" sx={{ p: 3, maxWidth: 640, borderRadius: 2 }}>
                <Stack spacing={2}>
                    <TextField label="Title" fullWidth required size="small" value={title} onChange={e => setTitle(e.target.value)} />
                    <TextField label="Slug" fullWidth size="small" helperText="URL segment" value={slug} onChange={e => setSlug(e.target.value)} />
                    <TextField label="Sector" select fullWidth size="small" value={sectorId} onChange={e => setSectorId(e.target.value)}>
                        <MenuItem value="">None</MenuItem>
                        {sectors.map(s => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField label="Summary" fullWidth multiline minRows={3} size="small" value={summary} onChange={e => setSummary(e.target.value)} />
                    <TextField label="Price (cents)" fullWidth size="small" value={priceCents} onChange={e => setPriceCents(e.target.value)} type="number" />
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" color="secondary" disableElevation disabled={saving || !title.trim()} onClick={save}>
                            Save draft
                        </Button>
                        <Button component={Link} to="/admin/reports" variant="outlined">
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Card>
        </Stack>
    )
}

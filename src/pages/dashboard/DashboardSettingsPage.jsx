import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import { useAuth } from '../../context/AuthContext'

export default function DashboardSettingsPage() {
    const { supabase, user, profile, refreshProfile } = useAuth()
    const [fullName, setFullName] = useState('')
    const [locale, setLocale] = useState('en')
    const [notificationEmail, setNotificationEmail] = useState('')
    const [digest, setDigest] = useState('off')
    const [msg, setMsg] = useState('')
    const [err, setErr] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!profile) return
        queueMicrotask(() => {
            setFullName(profile.full_name || '')
            setLocale(profile.locale || 'en')
            setNotificationEmail(profile.notification_email || '')
            setDigest(profile.digest_frequency || 'off')
        })
    }, [profile])

    const save = async () => {
        if (!supabase || !user) return
        setSaving(true)
        setMsg('')
        setErr('')
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName.trim() || null,
                locale,
                notification_email: notificationEmail.trim() || null,
                digest_frequency: digest,
            })
            .eq('id', user.id)
        setSaving(false)
        if (error) setErr(error.message)
        else {
            setMsg('Saved.')
            refreshProfile()
        }
    }

    return (
        <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800}>
                Workspace settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Identity email is managed in{' '}
                <Button component={Link} to="/profile" size="small" sx={{ fontWeight: 700, verticalAlign: 'baseline', p: 0, minWidth: 0 }}>
                    Profile
                </Button>
                .
            </Typography>
            {msg && <Alert severity="success">{msg}</Alert>}
            {err && <Alert severity="error">{err}</Alert>}
            <Card variant="outlined" sx={{ p: 3, maxWidth: 520, borderRadius: 2 }}>
                <Stack spacing={2}>
                    <TextField label="Display name" value={fullName} onChange={e => setFullName(e.target.value)} size="small" fullWidth />
                    <TextField label="Locale" select value={locale} onChange={e => setLocale(e.target.value)} size="small" fullWidth>
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="fr">Français</MenuItem>
                    </TextField>
                    <TextField
                        label="Notification email"
                        type="email"
                        value={notificationEmail}
                        onChange={e => setNotificationEmail(e.target.value)}
                        size="small"
                        fullWidth
                        helperText="Optional; can differ from login email"
                    />
                    <TextField label="Digest" select value={digest} onChange={e => setDigest(e.target.value)} size="small" fullWidth>
                        <MenuItem value="off">Off</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                    </TextField>
                    <Button variant="contained" color="secondary" onClick={save} disabled={saving} sx={{ alignSelf: 'flex-start', fontWeight: 700 }}>
                        {saving ? 'Saving…' : 'Save'}
                    </Button>
                </Stack>
            </Card>
        </Stack>
    )
}

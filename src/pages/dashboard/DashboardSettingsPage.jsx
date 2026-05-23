import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useAuth } from '../../context/AuthContext'
import {
    deleteOwnAccount,
    exportPersonalData,
    updateAccountEmail,
    updateAccountPassword,
} from '../../lib/accountActions'

const DELETE_CONFIRM = 'DELETE'

export default function DashboardSettingsPage() {
    const navigate = useNavigate()
    const { supabase, user, profile, refreshProfile, signOut } = useAuth()

    const [fullName, setFullName] = useState('')
    const [locale, setLocale] = useState('en')
    const [notificationEmail, setNotificationEmail] = useState('')
    const [digest, setDigest] = useState('off')
    const [avatarUrl, setAvatarUrl] = useState('')

    const [newEmail, setNewEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const [msg, setMsg] = useState('')
    const [err, setErr] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingEmail, setSavingEmail] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)
    const [exporting, setExporting] = useState(false)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState('')
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!profile) return
        queueMicrotask(() => {
            setFullName(profile.full_name || '')
            setLocale(profile.locale || 'en')
            setNotificationEmail(profile.notification_email || '')
            setDigest(profile.digest_frequency || 'off')
            setAvatarUrl(profile.avatar_url || '')
            setNewEmail(user?.email || '')
        })
    }, [profile, user?.email])

    const saveProfile = async () => {
        if (!supabase || !user) return
        setSavingProfile(true)
        setMsg('')
        setErr('')
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName.trim() || null,
                locale,
                notification_email: notificationEmail.trim() || null,
                digest_frequency: digest,
                avatar_url: avatarUrl.trim() || null,
            })
            .eq('id', user.id)
        setSavingProfile(false)
        if (error) setErr(error.message)
        else {
            setMsg('Profile saved.')
            refreshProfile()
        }
    }

    const saveEmail = async () => {
        if (!user) return
        const trimmed = newEmail.trim()
        if (!trimmed || trimmed === user.email) {
            setErr('Enter a new email address different from your current one.')
            return
        }
        setSavingEmail(true)
        setMsg('')
        setErr('')
        const { error } = await updateAccountEmail(supabase, trimmed)
        setSavingEmail(false)
        if (error) setErr(error.message)
        else {
            setMsg('Check your inbox to confirm the new email address. Until confirmed, your login email stays the same.')
        }
    }

    const savePassword = async () => {
        setMsg('')
        setErr('')
        if (newPassword.length < 8) {
            setErr('Password must be at least 8 characters.')
            return
        }
        if (newPassword !== confirmPassword) {
            setErr('New passwords do not match.')
            return
        }
        setSavingPassword(true)
        if (currentPassword && supabase) {
            const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            })
            if (signInErr) {
                setSavingPassword(false)
                setErr('Current password is incorrect.')
                return
            }
        }
        const { error } = await updateAccountPassword(supabase, newPassword)
        setSavingPassword(false)
        if (error) setErr(error.message)
        else {
            setMsg('Password updated.')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        }
    }

    const handleExport = async () => {
        if (!user) return
        setExporting(true)
        setErr('')
        const { data, error } = await exportPersonalData(supabase, user.id)
        setExporting(false)
        if (error) {
            setErr(error.message)
            return
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `researcha-data-export-${user.id.slice(0, 8)}.json`
        a.click()
        URL.revokeObjectURL(url)
        setMsg('Personal data export downloaded.')
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== DELETE_CONFIRM) return
        setDeleting(true)
        setErr('')
        const { error } = await deleteOwnAccount(supabase)
        if (error) {
            setDeleting(false)
            const hint =
                error.message?.includes('Could not find the function') || error.code === 'PGRST202'
                    ? ' Apply migration user_subscription_and_account_rls on Supabase first.'
                    : ''
            setErr((error.message || 'Could not delete account') + hint)
            return
        }
        await signOut()
        setDeleting(false)
        setDeleteOpen(false)
        navigate('/', { replace: true })
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                    Account settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Profile, login credentials, notifications, privacy export, and account deletion.
                </Typography>
            </Box>

            {msg && <Alert severity="success" onClose={() => setMsg('')}>{msg}</Alert>}
            {err && <Alert severity="error" onClose={() => setErr('')}>{err}</Alert>}

            <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Profile
                </Typography>
                <Stack spacing={2} sx={{ maxWidth: 520 }}>
                    <TextField label="Display name" value={fullName} onChange={e => setFullName(e.target.value)} size="small" fullWidth />
                    <TextField label="Locale" select value={locale} onChange={e => setLocale(e.target.value)} size="small" fullWidth>
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="fr">Français</MenuItem>
                    </TextField>
                    <TextField
                        label="Avatar image URL"
                        value={avatarUrl}
                        onChange={e => setAvatarUrl(e.target.value)}
                        size="small"
                        fullWidth
                        helperText="Optional public image URL for your avatar"
                    />
                    <TextField
                        label="Notification email"
                        type="email"
                        value={notificationEmail}
                        onChange={e => setNotificationEmail(e.target.value)}
                        size="small"
                        fullWidth
                        helperText="Optional; can differ from your login email"
                    />
                    <TextField label="Email digest" select value={digest} onChange={e => setDigest(e.target.value)} size="small" fullWidth>
                        <MenuItem value="off">Off</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                    </TextField>
                    {profile?.created_at && (
                        <Typography variant="caption" color="text.secondary">
                            Member since {new Date(profile.created_at).toLocaleDateString()}
                        </Typography>
                    )}
                    <Button variant="contained" color="secondary" onClick={saveProfile} disabled={savingProfile} sx={{ alignSelf: 'flex-start', fontWeight: 700 }}>
                        {savingProfile ? 'Saving…' : 'Save profile'}
                    </Button>
                </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Login & security
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Login email: <strong>{user?.email || '—'}</strong>
                </Typography>
                <Stack spacing={2} sx={{ maxWidth: 520 }}>
                    <TextField
                        label="New login email"
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        size="small"
                        fullWidth
                        helperText="Supabase sends a confirmation link to the new address"
                    />
                    <Button variant="outlined" onClick={saveEmail} disabled={savingEmail} sx={{ alignSelf: 'flex-start', fontWeight: 700 }}>
                        {savingEmail ? 'Sending…' : 'Update email'}
                    </Button>

                    <Divider />

                    <TextField
                        label="Current password"
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        size="small"
                        fullWidth
                        autoComplete="current-password"
                        helperText="Recommended when changing password on a shared device"
                    />
                    <TextField
                        label="New password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        size="small"
                        fullWidth
                        autoComplete="new-password"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end" aria-label="toggle password">
                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="Confirm new password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        size="small"
                        fullWidth
                        autoComplete="new-password"
                    />
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button variant="contained" color="secondary" onClick={savePassword} disabled={savingPassword} sx={{ fontWeight: 700 }}>
                            {savingPassword ? 'Updating…' : 'Change password'}
                        </Button>
                        <Button component={Link} to="/forgot-password" state={{ redirectTo: '/dashboard/settings' }} size="small">
                            Forgot password?
                        </Button>
                    </Stack>
                </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Privacy & personal data
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 560, lineHeight: 1.65 }}>
                    Download a copy of your profile, entitlements, payment requests, usage events, and search history. For how we process data, see our{' '}
                    <Box component={Link} to="/privacy" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                        Privacy policy
                    </Box>
                    .
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button variant="outlined" onClick={handleExport} disabled={exporting}>
                        {exporting ? 'Preparing…' : 'Download my data (JSON)'}
                    </Button>
                    <Button component={Link} to="/dashboard/billing" variant="outlined" size="small" color="secondary">
                        Billing & subscriptions
                    </Button>
                </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: 'error.light' }}>
                <Typography variant="subtitle1" fontWeight={700} color="error.main" sx={{ mb: 1 }}>
                    Delete account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 560, lineHeight: 1.65 }}>
                    Permanently removes your account, profile, entitlements, and activity data. This cannot be undone. Active sector access and pending payments will be lost.
                </Typography>
                <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
                    Delete my account
                </Button>
            </Card>

            <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete account permanently?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        All personal data tied to this account will be removed. Type <strong>{DELETE_CONFIRM}</strong> to confirm.
                    </DialogContentText>
                    <TextField
                        fullWidth
                        size="small"
                        label={`Type ${DELETE_CONFIRM}`}
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
                        autoComplete="off"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDeleteAccount} disabled={deleting || deleteConfirm !== DELETE_CONFIRM}>
                        {deleting ? 'Deleting…' : 'Delete forever'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}

import React from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

export default function AdminSettingsPage() {
    return (
        <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800}>
                Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Feature flags, API keys (masked), and integration endpoints for email and payments.
            </Typography>
            <Card variant="outlined" sx={{ p: 3, maxWidth: 560, borderRadius: 2 }}>
                <Stack spacing={2}>
                    <TextField label="Public site URL" fullWidth size="small" placeholder="https://…" disabled />
                    <TextField label="Stripe / CIB webhook" fullWidth size="small" disabled placeholder="Configure in env" />
                    <Button variant="contained" color="secondary" disableElevation disabled>
                        Save settings
                    </Button>
                </Stack>
            </Card>
        </Stack>
    )
}

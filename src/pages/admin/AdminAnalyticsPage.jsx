import React from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import EmptyState from '../../components/shell/EmptyState'

export default function AdminAnalyticsPage() {
    return (
        <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800}>
                Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Funnels, top reports, and search queries. Avoid placeholder charts; wire to your event pipeline first.
            </Typography>
            <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <EmptyState
                    title="Analytics not connected"
                    description="Send page views and conversions from the SPA or edge workers, then aggregate here."
                />
            </Card>
        </Stack>
    )
}

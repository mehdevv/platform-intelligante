import React from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import EmptyState from '../../components/shell/EmptyState'

export default function AdminImportPage() {
    return (
        <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800}>
                Import
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Bulk CSV or ZIP of PDFs + metadata. Pipeline should validate against schema before insert.
            </Typography>
            <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <EmptyState
                    title="No import jobs"
                    description="Drop a manifest here once the worker and storage bucket are configured."
                >
                    <Button variant="outlined" size="small" disabled>
                        Upload (soon)
                    </Button>
                </EmptyState>
            </Card>
        </Stack>
    )
}

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DataObjectIcon from '@mui/icons-material/DataObject'
import { cn } from '../../lib/cn'

/** Tool / function-call style status (shadcn AI Tool pattern, simplified). */
export function AIToolStatus({ name, status = 'running', runningLabel = 'Running…', completeLabel = 'Finished', className }) {
    const done = status === 'complete'

    return (
        <Box
            className={cn(
                'overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80',
                className,
            )}
        >
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ px: 2, py: 1.5 }}>
                <Box
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm"
                    sx={{ border: '1px solid #e2e8f0' }}
                >
                    <DataObjectIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                </Box>
                <Stack flex={1} minWidth={0}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: 'Ubuntu, sans-serif', fontStyle: 'normal', letterSpacing: '0.02em' }}>
                        {name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontFamily: 'Ubuntu, sans-serif', fontStyle: 'normal' }}>
                        {done ? 'Finished' : 'Running…'}
                    </Typography>
                </Stack>
                {done ? <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} /> : null}
            </Stack>
            {!done ? <LinearProgress color="secondary" sx={{ height: 2 }} /> : null}
        </Box>
    )
}

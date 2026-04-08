import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import { cn } from '../../lib/cn'

export function AIMessageUser({ children, timestamp, className }) {
    return (
        <Box className={cn('flex justify-end', className)}>
            <Stack alignItems="flex-end" gap={0.75} sx={{ maxWidth: 'min(100%, 640px)' }}>
                <Stack direction="row" alignItems="flex-end" gap={1}>
                    <Paper
                        elevation={0}
                        className="rounded-2xl rounded-br-md border border-slate-200/80 bg-gradient-to-br from-[#4B5B72] to-[#3d4a5e] text-white shadow-md"
                        sx={{ px: 2.25, py: 1.75 }}
                    >
                        <Typography component="div" variant="body2" sx={{ lineHeight: 1.65, fontSize: '0.9375rem' }}>
                            {children}
                        </Typography>
                    </Paper>
                    <Box
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/90 text-slate-600"
                        aria-hidden
                    >
                        <PersonIcon sx={{ fontSize: 20 }} />
                    </Box>
                </Stack>
                {timestamp ? (
                    <Typography variant="caption" color="text.secondary" sx={{ pr: 5, fontSize: '0.7rem' }}>
                        {timestamp}
                    </Typography>
                ) : null}
            </Stack>
        </Box>
    )
}

export function AIMessageAssistant({ children, timestamp, actions, className }) {
    return (
        <Box className={cn('flex gap-3', className)}>
            <Box
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#197F94] text-white shadow-sm"
                aria-hidden
            >
                <SmartToyIcon sx={{ fontSize: 20 }} />
            </Box>
            <Stack gap={1.25} sx={{ minWidth: 0, flex: 1, maxWidth: 'min(100%, 680px)' }}>
                <Paper
                    elevation={0}
                    className="rounded-2xl rounded-tl-md border border-slate-200/90 bg-white shadow-sm"
                    sx={{ p: { xs: 2, sm: 2.5 } }}
                >
                    <Typography component="div" variant="body2" color="text.primary" sx={{ lineHeight: 1.7, fontSize: '0.9375rem' }}>
                        {children}
                    </Typography>
                </Paper>
                {actions}
                {timestamp ? (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {timestamp}
                    </Typography>
                ) : null}
            </Stack>
        </Box>
    )
}

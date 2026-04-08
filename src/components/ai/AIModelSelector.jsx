import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Box from '@mui/material/Box'

/** Model / mode switcher (shadcn AI Model Selector–style, lightweight). */
export function AIModelSelector({ label, value, onChange, options }) {
    return (
        <Box sx={{ mb: 2 }}>
            {label ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'Ubuntu, sans-serif', fontStyle: 'normal' }}>
                    {label}
                </Typography>
            ) : null}
            <ToggleButtonGroup
                exclusive
                size="small"
                value={value}
                onChange={(_, v) => v != null && onChange?.(v)}
                sx={{
                    gap: 0.75,
                    flexWrap: 'wrap',
                    '& .MuiToggleButton-root': {
                        borderRadius: '10px !important',
                        px: 1.75,
                        py: 0.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        border: '1px solid #dde1e9 !important',
                    },
                }}
            >
                {options.map(opt => (
                    <ToggleButton key={opt.value} value={opt.value}>
                        {opt.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    )
}

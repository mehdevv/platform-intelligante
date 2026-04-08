import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'

export default function BrandLogo({ size = 'default', variant = 'default' }) {
    const { t } = useTranslation()
    const h = size === 'compact' ? 28 : 36
    const onDark = variant === 'onDark'
    return (
        <Box
            component={Link}
            to="/"
            sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.25s ease',
                '&:hover': { transform: 'translateY(-1px)' },
            }}
        >
            <Box
                component="img"
                src="/logo.png"
                alt={t('brand.logoAlt', { defaultValue: 'Home' })}
                sx={{
                    height: h,
                    width: 'auto',
                    display: 'block',
                    filter: onDark
                        ? 'drop-shadow(0 0 12px rgba(94, 212, 228, 0.35))'
                        : 'drop-shadow(0 2px 8px rgba(64, 130, 141, 0.25))',
                }}
            />
        </Box>
    )
}

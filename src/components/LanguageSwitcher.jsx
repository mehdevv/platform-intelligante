import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher({ size = 'small' }) {
    const { i18n } = useTranslation()
    const lang = i18n.language?.startsWith('fr') ? 'fr' : 'en'

    const handle = (_, next) => {
        if (next) {
            i18n.changeLanguage(next)
            try {
                localStorage.setItem('researcha-lang', next)
            } catch { /* ignore */ }
        }
    }

    return (
        <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={handle}
            size={size}
            sx={{
                '& .MuiToggleButton-root': {
                    px: 1.25,
                    py: 0.35,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    border: '1px solid #dde1e9',
                    '&.Mui-selected': {
                        bgcolor: 'secondary.main',
                        color: '#fff',
                        borderColor: 'secondary.main',
                        '&:hover': { bgcolor: 'secondary.dark' },
                    },
                },
            }}
        >
            <ToggleButton value="en" aria-label="English">EN</ToggleButton>
            <ToggleButton value="fr" aria-label="Français">FR</ToggleButton>
        </ToggleButtonGroup>
    )
}

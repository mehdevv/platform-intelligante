import { createTheme } from '@mui/material/styles'

/** AEM Consulting 2025 — bleu grisé + azur (fiche technique HTML). */
const AEM = {
    bleu: '#4B5B72',
    azur: '#197F94',
    azurSharp: '#0e7490',
    azurLight: '#e1f4f7',
    gris: '#A5ADBA',
    blanc: '#EBECF1',
    dark: '#1a2332',
    text: '#2c3748',
    textMuted: '#6b7a8d',
    border: '#dde1e9',
}

const theme = createTheme({
    palette: {
        primary: {
            main: AEM.bleu,
            light: '#6b7d96',
            dark: '#3a4759',
            contrastText: '#ffffff',
        },
        secondary: {
            main: AEM.azur,
            light: '#2a9aaa',
            dark: AEM.azurSharp,
            contrastText: '#ffffff',
        },
        warning: {
            main: '#d4a020',
        },
        success: {
            main: '#0d9488',
        },
        background: {
            default: AEM.blanc,
            paper: '#ffffff',
        },
        text: {
            primary: AEM.text,
            secondary: AEM.textMuted,
        },
        divider: AEM.border,
    },
    typography: {
        fontFamily: '"Ubuntu", system-ui, sans-serif',
        h1: { fontFamily: '"League Spartan", sans-serif', fontWeight: 800, letterSpacing: '-0.02em' },
        h2: { fontFamily: '"League Spartan", sans-serif', fontWeight: 800, letterSpacing: '-0.01em' },
        h3: { fontFamily: '"League Spartan", sans-serif', fontWeight: 700 },
        h4: { fontFamily: '"League Spartan", sans-serif', fontWeight: 700 },
        h5: { fontFamily: '"League Spartan", sans-serif', fontWeight: 700 },
        h6: { fontFamily: '"League Spartan", sans-serif', fontWeight: 700 },
        subtitle1: { fontFamily: '"Ubuntu", sans-serif', fontWeight: 600 },
        subtitle2: { fontFamily: '"Ubuntu", sans-serif', fontWeight: 600 },
        body1: { fontFamily: '"Ubuntu", sans-serif', fontWeight: 400 },
        body2: { fontFamily: '"Ubuntu", sans-serif', fontWeight: 400 },
        caption: {
            fontFamily: '"Libre Baskerville", "Times New Roman", serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '0.8125rem',
            letterSpacing: '0.02em',
            lineHeight: 1.5,
        },
        button: { fontFamily: '"Ubuntu", sans-serif', fontWeight: 700, textTransform: 'none' },
        overline: { fontFamily: '"Ubuntu", sans-serif', fontWeight: 700, letterSpacing: '0.12em' },
    },
    shape: {
        borderRadius: 10,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
                },
                containedSecondary: {
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 2px 8px rgba(14, 116, 144, 0.2)' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    border: `1px solid ${AEM.border}`,
                    boxShadow: '0 1px 3px 0 rgba(26, 35, 50, 0.06)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 4px 20px -4px rgba(26, 35, 50, 0.08)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    height: 24,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: '#f4f5f8',
                        fontFamily: '"Ubuntu", sans-serif',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: AEM.bleu,
                        },
                    },
                    '& .MuiInputLabel-root': { fontFamily: '"Ubuntu", sans-serif' },
                },
            },
        },
        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    fontFamily: '"Libre Baskerville", "Times New Roman", serif',
                    fontStyle: 'italic',
                    fontSize: '0.78rem',
                    letterSpacing: '0.02em',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    fontFamily: '"Ubuntu", sans-serif',
                },
                head: {
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: AEM.textMuted,
                    backgroundColor: AEM.blanc,
                    fontFamily: '"Ubuntu", sans-serif',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: `1px solid ${AEM.border}`,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontFamily: '"Ubuntu", sans-serif',
                },
            },
        },
        MuiPagination: {
            styleOverrides: {
                root: {
                    '& .MuiPaginationItem-root': {
                        fontWeight: 600,
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${AEM.border}`,
                },
            },
        },
    },
})

export default theme

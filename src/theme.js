import { createTheme } from '@mui/material/styles'

const theme = createTheme({
    palette: {
        primary: {
            main: '#003399',
            light: '#335ead',
            dark: '#00236b',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#FF6600',
            light: '#ff8533',
            dark: '#cc5200',
            contrastText: '#ffffff',
        },
        warning: {
            main: '#d4af37',
        },
        success: {
            main: '#10b981',
        },
        background: {
            default: '#f5f6f8',
            paper: '#ffffff',
        },
        text: {
            primary: '#0f172a',
            secondary: '#64748b',
        },
    },
    typography: {
        fontFamily: '"Public Sans", sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.02em' },
        h2: { fontWeight: 800, letterSpacing: '-0.01em' },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        subtitle1: { fontWeight: 600 },
        subtitle2: { fontWeight: 600 },
        button: { fontWeight: 700, textTransform: 'none' },
    },
    shape: {
        borderRadius: 12,
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
                    boxShadow: '0 4px 14px 0 rgba(255, 102, 0, 0.25)',
                    '&:hover': {
                        boxShadow: '0 6px 20px 0 rgba(255, 102, 0, 0.35)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 10px 40px -12px rgba(0,0,0,0.1)',
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
                        backgroundColor: '#f8fafc',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#003399',
                        },
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid #e2e8f0',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#64748b',
                    backgroundColor: '#f8fafc',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.875rem',
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
    },
})

export default theme

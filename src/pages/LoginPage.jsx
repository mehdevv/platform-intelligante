import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import LockIcon from '@mui/icons-material/Lock'
import StorageIcon from '@mui/icons-material/Storage'

export default function LoginPage() {
    const navigate = useNavigate()

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 3, py: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>Back</Button>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                <Paper elevation={4} sx={{ width: '100%', maxWidth: 440, overflow: 'hidden', borderRadius: 3 }}>
                    <Box sx={{ height: 128, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.2, background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent)' }} />
                        <Stack alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                                <StorageIcon sx={{ color: '#fff', fontSize: 40 }} />
                                <Typography sx={{ color: '#fff', fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700 }}>DataVault</Typography>
                            </Link>
                        </Stack>
                    </Box>
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography variant="h5" sx={{ mb: 1 }}>Welcome Back</Typography>
                            <Typography variant="body2" color="text.secondary">Enter your credentials to access your secure vault.</Typography>
                        </Box>
                        <Stack component="form" spacing={3} onSubmit={e => e.preventDefault()}>
                            <TextField fullWidth label="Email Address" placeholder="name@company.com" type="email" />
                            <TextField
                                fullWidth
                                label="Password"
                                placeholder="••••••••"
                                type="password"
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" size="small"><VisibilityIcon fontSize="small" /></IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                helperText={<Box component={Link} to="#" sx={{ fontSize: '0.75rem', color: 'primary.main', fontWeight: 700, textDecoration: 'none', float: 'right' }}>Forgot password?</Box>}
                            />
                            <Button fullWidth variant="contained" size="large" type="submit" sx={{ py: 1.5 }}>Sign In</Button>
                        </Stack>
                        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <Box component={Link} to="/signup" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}>Create an account</Box>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Stack direction="row" justifyContent="center" gap={3} sx={{ mb: 2 }}>
                    {['Privacy Policy', 'Terms of Service', 'Security'].map(l => (
                        <Typography key={l} variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{l}</Typography>
                    ))}
                </Stack>
                <Typography variant="caption" color="text.secondary">© 2024 DataVault Inc. All rights reserved.</Typography>
            </Box>
        </Box>
    )
}

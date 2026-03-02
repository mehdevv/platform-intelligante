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
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import StorageIcon from '@mui/icons-material/Storage'
import Grid from '@mui/material/Grid'

export default function SignupPage() {
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
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
                            <StorageIcon sx={{ color: '#fff', fontSize: 40 }} />
                            <Typography sx={{ color: '#fff', fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700 }}>DataVault</Typography>
                        </Link>
                    </Box>
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography variant="h5" sx={{ mb: 1 }}>Create Your Account</Typography>
                            <Typography variant="body2" color="text.secondary">Start your free trial. No credit card required.</Typography>
                        </Box>
                        <Stack component="form" spacing={2.5} onSubmit={e => e.preventDefault()}>
                            <Grid container spacing={2}>
                                <Grid size={6}><TextField fullWidth label="First Name" placeholder="John" /></Grid>
                                <Grid size={6}><TextField fullWidth label="Last Name" placeholder="Doe" /></Grid>
                            </Grid>
                            <TextField fullWidth label="Work Email" placeholder="name@company.com" type="email" />
                            <TextField fullWidth label="Company Name" placeholder="Acme Corp" />
                            <TextField
                                fullWidth
                                label="Password"
                                placeholder="Min 8 characters"
                                type="password"
                                helperText="Must contain at least 8 characters, 1 uppercase, 1 number"
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" size="small"><VisibilityIcon fontSize="small" /></IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            <FormControlLabel
                                control={<Checkbox size="small" />}
                                label={
                                    <Typography variant="caption" color="text.secondary">
                                        I agree to the <Box component="a" href="#" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}>Terms of Service</Box> and <Box component="a" href="#" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}>Privacy Policy</Box>
                                    </Typography>
                                }
                            />
                            <Button fullWidth variant="contained" size="large" type="submit" sx={{ py: 1.5 }}>Create Account</Button>
                        </Stack>
                        <Divider sx={{ my: 3 }}>
                            <Typography variant="caption" color="text.secondary">OR</Typography>
                        </Divider>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{ py: 1.5, color: 'text.primary', borderColor: '#e2e8f0', textTransform: 'none', '&:hover': { bgcolor: '#f8fafc' } }}
                            startIcon={
                                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            }
                        >
                            Continue with Google
                        </Button>
                        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Box component={Link} to="/login" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}>Sign in</Box>
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

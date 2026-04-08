import { Link, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function CheckoutPage() {
    const { t } = useTranslation()
    const [params] = useSearchParams()
    const plan = params.get('plan') || 'Professional'

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ pt: '72px', pb: 8 }}>
                <Container maxWidth="sm" className="section-fade-in">
                    <Typography variant="h4" sx={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 800, mb: 1 }}>{t('checkout.title')}</Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>{t('checkout.subtitle')}</Typography>
                    <Paper className="card-lift shimmer-border" sx={{ p: 3, mb: 2 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography color="text.secondary">{t('checkout.plan')}</Typography>
                                <Typography fontWeight={700}>{plan}</Typography>
                            </Stack>
                            <Divider />
                            <Stack direction="row" justifyContent="space-between">
                                <Typography fontWeight={700}>{t('checkout.total')}</Typography>
                                <Typography fontWeight={800} color="secondary.main">—</Typography>
                            </Stack>
                        </Stack>
                    </Paper>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>{t('checkout.mockNote')}</Typography>
                    <Button fullWidth variant="contained" color="secondary" size="large" sx={{ fontWeight: 700, mb: 2 }}>{t('checkout.pay')}</Button>
                    <Button component={Link} to="/pricing" fullWidth>{t('common.cancel')}</Button>
                </Container>
            </Box>
            <Footer />
        </Box>
    )
}

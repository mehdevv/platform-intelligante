import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Chip from '@mui/material/Chip'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Header from '../components/Header'
import Footer from '../components/Footer'

const plans = [
    { name: 'Basic', desc: 'Essential security for individuals', price: '$0', features: ['5GB Secure Storage', '1 User Access', 'AES-256 Encryption'], blocked: ['Priority Support'], cta: 'Get Started', ctaVariant: 'outlined' },
    { name: 'Professional', desc: 'Advanced features for growing teams', price: { monthly: '$29', annual: '$23' }, popular: true, features: ['500GB Secure Storage', 'Up to 10 Users', 'Priority 24/7 Support', 'Advanced Audit Logs', 'Team Sharing Permissions'], cta: 'Start 14-Day Free Trial', ctaVariant: 'contained' },
    { name: 'Enterprise', desc: 'Full control for large organizations', price: 'Custom', features: ['Unlimited Storage Capacity', 'SSO & SAML Integration', 'Dedicated Account Manager', 'Custom SLA Agreements'], cta: 'Contact Sales', ctaColor: 'inherit' },
]

const faqs = [
    { q: 'How secure is my data with DataVault?', a: 'We use industry-standard AES-256 bit encryption for all data at rest and TLS 1.3 for data in transit.' },
    { q: 'Can I change plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new features will be available immediately.' },
    { q: 'What happens if I lose access to my account?', a: 'We offer multi-factor authentication and secure recovery keys. Our support team can verify your identity through secondary protocols.' },
    { q: 'Is there a limit on file types?', a: 'No, DataVault supports any file type. Everything is encrypted and stored with the same level of rigorous security.' },
]

export default function PricingPage() {
    const [annual, setAnnual] = useState(true)

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ pt: '64px' }}>
                {/* Hero */}
                <Box sx={{ py: { xs: 8, md: 12 }, px: 2, background: 'linear-gradient(180deg, #fff 0%, #f5f6f8 100%)' }}>
                    <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ mb: 3, fontSize: { xs: '2rem', md: '3.5rem' } }}>Secure Your Data with DataVault</Typography>
                        <Typography color="text.secondary" sx={{ mb: 5, fontSize: '1.125rem', maxWidth: 640, mx: 'auto' }}>Simple, transparent pricing for teams of all sizes.</Typography>
                        <Stack direction="row" alignItems="center" justifyContent="center" gap={2} sx={{ mb: 6 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: annual ? 'text.secondary' : 'text.primary' }}>Monthly</Typography>
                            <Switch checked={annual} onChange={() => setAnnual(!annual)} color="primary" />
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: annual ? 'text.primary' : 'text.secondary' }}>Annual</Typography>
                                <Chip label="Save 20%" size="small" sx={{ bgcolor: 'rgba(255,102,0,0.1)', color: 'secondary.main' }} />
                            </Stack>
                        </Stack>
                    </Container>
                    <Container maxWidth="lg">
                        <Grid container spacing={4} alignItems="stretch">
                            {plans.map((plan, i) => (
                                <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
                                    <Card sx={{
                                        p: 4, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
                                        ...(plan.popular && { border: '2px solid', borderColor: 'primary.main', transform: { md: 'scale(1.05)' }, zIndex: 10, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' })
                                    }}>
                                        {plan.popular && (
                                            <Chip label="Most Popular" size="small" color="secondary" sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }} />
                                        )}
                                        <Box sx={{ mb: 4 }}>
                                            <Typography variant="h5" sx={{ mb: 1 }}>{plan.name}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{plan.desc}</Typography>
                                            <Typography variant="h3" sx={{ fontSize: '2.25rem' }}>
                                                {typeof plan.price === 'object' ? (annual ? plan.price.annual : plan.price.monthly) : plan.price}
                                                {plan.price !== 'Custom' && <Typography component="span" color="text.secondary" sx={{ fontSize: '1rem', ml: 1 }}>/month</Typography>}
                                            </Typography>
                                        </Box>
                                        <Stack spacing={2} sx={{ mb: 5, flexGrow: 1 }}>
                                            {plan.features.map(f => (
                                                <Stack key={f} direction="row" gap={1.5} alignItems="flex-start">
                                                    <CheckCircleIcon sx={{ fontSize: 18, color: 'primary.main', mt: 0.3 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: plan.popular ? 600 : 400 }}>{f}</Typography>
                                                </Stack>
                                            ))}
                                            {plan.blocked?.map(f => (
                                                <Stack key={f} direction="row" gap={1.5} alignItems="flex-start" sx={{ opacity: 0.5 }}>
                                                    <BlockIcon sx={{ fontSize: 18, mt: 0.3 }} />
                                                    <Typography variant="body2">{f}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                        <Button
                                            fullWidth
                                            variant={plan.ctaVariant || 'contained'}
                                            color={plan.ctaColor || 'primary'}
                                            sx={{ py: 1.5, ...(plan.ctaColor === 'inherit' && { bgcolor: '#0f172a', color: '#fff', '&:hover': { bgcolor: '#1e293b' } }) }}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                {/* FAQ */}
                <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
                    <Container maxWidth="sm">
                        <Typography variant="h4" textAlign="center" sx={{ mb: 6 }}>Frequently Asked Questions</Typography>
                        <Stack spacing={2}>
                            {faqs.map((faq, i) => (
                                <Accordion key={i} elevation={0} sx={{ border: '1px solid #e2e8f0', '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle2">{faq.q}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" color="text.secondary">{faq.a}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>
                    </Container>
                </Box>

                {/* CTA */}
                <Box sx={{ py: 10, px: 2 }}>
                    <Container maxWidth="md">
                        <Box sx={{ bgcolor: 'primary.main', borderRadius: 6, p: { xs: 4, md: 8 }, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: -48, right: -48, width: 256, height: 256, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(48px)' }} />
                            <Box sx={{ position: 'absolute', bottom: -48, left: -48, width: 256, height: 256, bgcolor: 'rgba(255,102,0,0.2)', borderRadius: '50%', filter: 'blur(48px)' }} />
                            <Typography variant="h3" sx={{ color: '#fff', mb: 3, position: 'relative', zIndex: 10, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>Ready to secure your business future?</Typography>
                            <Typography sx={{ color: 'rgba(191,219,254,1)', mb: 5, fontSize: '1.125rem', position: 'relative', zIndex: 10 }}>Join thousands of companies who trust DataVault.</Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" gap={2} sx={{ position: 'relative', zIndex: 10 }}>
                                <Button variant="contained" color="secondary" size="large" sx={{ px: 5 }}>Start Free Trial</Button>
                                <Button variant="outlined" size="large" sx={{ px: 5, color: '#fff', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>View Demo</Button>
                            </Stack>
                        </Box>
                    </Container>
                </Box>
            </Box>
            <Footer />
        </Box>
    )
}

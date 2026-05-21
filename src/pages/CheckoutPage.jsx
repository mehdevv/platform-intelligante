import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { formatPriceFromCents } from '../lib/moneyFormat'
import { getBankRib, isBankRibConfigured } from '../lib/platformSettings'
import { RECEIPT_ACCEPT, RECEIPT_MAX_BYTES, uploadPaymentReceipt } from '../lib/paymentReceiptUpload'

function CopyButton({ value }) {
    const [copied, setCopied] = useState(false)
    if (!value) return null
    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
        } catch {
            // clipboard unavailable; ignore
        }
    }
    return (
        <Tooltip title={copied ? 'Copied' : 'Copy'} placement="top">
            <IconButton size="small" onClick={onCopy} aria-label="Copy">
                {copied ? <CheckCircleOutlineIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
        </Tooltip>
    )
}

function RibField({ label, value }) {
    if (!value) return null
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} sx={{ py: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                    {value}
                </Typography>
            </Box>
            <CopyButton value={value} />
        </Stack>
    )
}

export default function CheckoutPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { supabase, user, loading: authLoading } = useAuth()
    const [params] = useSearchParams()
    const reportId = params.get('reportId')
    const sectorId = params.get('sectorId')

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [target, setTarget] = useState(null)
    const [rib, setRib] = useState(null)
    const [file, setFile] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase) {
                setLoading(false)
                return
            }
            setLoading(true)
            setError('')
            try {
                const ribPromise = getBankRib(supabase)
                if (reportId) {
                    const { data, error: e } = await supabase
                        .from('reports')
                        .select('id, slug, title, price_cents, currency, sector_id, sectors:sector_id ( id, name, slug )')
                        .eq('id', reportId)
                        .maybeSingle()
                    if (e) throw new Error(e.message)
                    if (!data) throw new Error(t('checkout.rib.notFoundReport'))
                    if (!cancelled) setTarget({ kind: 'report', report: data })
                } else if (sectorId) {
                    const { data, error: e } = await supabase
                        .from('sectors')
                        .select('id, slug, name, description, subscription_price_cents, currency, icon_image_url')
                        .eq('id', sectorId)
                        .maybeSingle()
                    if (e) throw new Error(e.message)
                    if (!data) throw new Error(t('checkout.rib.notFoundSector'))
                    if (!cancelled) setTarget({ kind: 'sector_subscription', sector: data })
                } else {
                    if (!cancelled) setTarget(null)
                }
                const ribValue = await ribPromise
                if (!cancelled) setRib(ribValue)
            } catch (ex) {
                if (!cancelled) setError(ex?.message || 'Could not load checkout')
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, reportId, sectorId, t])

    const amountCents = useMemo(() => {
        if (!target) return 0
        if (target.kind === 'report') return target.report?.price_cents ?? 0
        if (target.kind === 'sector_subscription') return target.sector?.subscription_price_cents ?? 0
        return 0
    }, [target])

    const currency = useMemo(() => {
        if (!target) return 'DZD'
        if (target.kind === 'report') return target.report?.currency || 'DZD'
        if (target.kind === 'sector_subscription') return target.sector?.currency || 'DZD'
        return 'DZD'
    }, [target])

    const ribConfigured = isBankRibConfigured(rib)

    const pickFile = () => fileInputRef.current?.click()
    const onPick = e => {
        const f = e.target.files?.[0] || null
        e.target.value = ''
        if (!f) {
            setFile(null)
            return
        }
        if (f.size > RECEIPT_MAX_BYTES) {
            setError(t('checkout.rib.fileTooLarge'))
            return
        }
        setError('')
        setFile(f)
    }

    const submit = async () => {
        if (!supabase || !user || !target || !file) return
        setSubmitting(true)
        setError('')
        try {
            const path = await uploadPaymentReceipt(supabase, user.id, file)
            const payload =
                target.kind === 'report'
                    ? {
                          user_id: user.id,
                          kind: 'report',
                          report_id: target.report.id,
                          sector_id: null,
                          amount_cents: target.report.price_cents,
                          currency: target.report.currency || 'DZD',
                          receipt_storage_path: path,
                      }
                    : {
                          user_id: user.id,
                          kind: 'sector_subscription',
                          sector_id: target.sector.id,
                          report_id: null,
                          amount_cents: target.sector.subscription_price_cents,
                          currency: target.sector.currency || 'DZD',
                          receipt_storage_path: path,
                      }
            const { data, error: insErr } = await supabase
                .from('payment_requests')
                .insert(payload)
                .select('id')
                .single()
            if (insErr) throw new Error(insErr.message)
            setSubmitted({ id: data.id })
        } catch (ex) {
            setError(ex?.message || 'Submission failed')
        } finally {
            setSubmitting(false)
        }
    }

    if (!authLoading && !user) {
        const next = `/checkout?${reportId ? `reportId=${reportId}` : sectorId ? `sectorId=${sectorId}` : ''}`
        return (
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                <Header />
                <Box component="main" sx={{ pt: '72px', pb: 8 }}>
                    <Container maxWidth="sm" sx={{ py: 4 }}>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            {t('checkout.rib.requireAuth')}
                        </Alert>
                        <Stack direction="row" spacing={1}>
                            <Button variant="contained" color="secondary" onClick={() => navigate('/login', { state: { redirectTo: next } })}>
                                {t('common.login')}
                            </Button>
                            <Button component={Link} to={next.replace('/checkout', '/pricing')}>
                                {t('common.cancel')}
                            </Button>
                        </Stack>
                    </Container>
                </Box>
                <Footer />
            </Box>
        )
    }

    const targetLabel =
        target?.kind === 'report'
            ? target.report?.title
            : target?.kind === 'sector_subscription'
              ? `${target.sector?.name} — ${t('checkout.rib.monthlyAccess')}`
              : ''

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ pt: '72px', pb: 8 }}>
                <Container maxWidth="md" className="section-fade-in" sx={{ py: 4 }}>
                    <Typography variant="h4" sx={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 800, mb: 1 }}>
                        {t('checkout.title')}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {t('checkout.rib.subtitle')}
                    </Typography>

                    {loading || authLoading ? (
                        <Stack alignItems="center" py={4}>
                            <CircularProgress />
                        </Stack>
                    ) : !target ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            {t('checkout.rib.noTarget')}{' '}
                            <Box component={Link} to="/pricing" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                                {t('checkout.rib.browsePlans')}
                            </Box>
                        </Alert>
                    ) : submitted ? (
                        <Paper variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
                            <Stack spacing={2} alignItems="flex-start">
                                <CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'success.main' }} />
                                <Typography variant="h5" fontWeight={800}>
                                    {t('checkout.rib.submittedTitle')}
                                </Typography>
                                <Typography color="text.secondary">{t('checkout.rib.submittedBody')}</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button component={Link} to="/dashboard/payments" variant="contained" color="secondary" disableElevation>
                                        {t('checkout.rib.viewMyRequests')}
                                    </Button>
                                    <Button component={Link} to="/">
                                        {t('checkout.rib.backHome')}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ) : (
                        <Stack spacing={3}>
                            {error && <Alert severity="error">{error}</Alert>}

                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} spacing={2}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            {target.kind === 'report' ? t('checkout.rib.payingFor') : t('checkout.rib.subscribingTo')}
                                        </Typography>
                                        <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                                            {targetLabel}
                                        </Typography>
                                        {target.kind === 'report' && target.report?.sectors?.name && (
                                            <Chip size="small" label={target.report.sectors.name} sx={{ mt: 1 }} />
                                        )}
                                    </Box>
                                    <Box sx={{ textAlign: { sm: 'right' } }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            {t('checkout.rib.amountDue')}
                                        </Typography>
                                        <Typography variant="h4" color="secondary.main" sx={{ mt: 0.5, fontFamily: '"League Spartan", sans-serif', fontWeight: 800 }}>
                                            {amountCents > 0 ? formatPriceFromCents(amountCents, currency) : '—'}
                                        </Typography>
                                        {target.kind === 'sector_subscription' && (
                                            <Typography variant="caption" color="text.secondary">{t('checkout.rib.thirtyDays')}</Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
                                    {t('checkout.rib.heading')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {t('checkout.rib.copy')}
                                </Typography>
                                {!ribConfigured ? (
                                    <Alert severity="warning">{t('checkout.rib.notConfigured')}</Alert>
                                ) : (
                                    <Stack>
                                        <RibField label={t('checkout.rib.bank')} value={rib.bank_name} />
                                        <RibField label={t('checkout.rib.holder')} value={rib.account_holder} />
                                        <RibField label={t('checkout.rib.rib')} value={rib.rib} />
                                        <RibField label={t('checkout.rib.iban')} value={rib.iban} />
                                        <RibField label={t('checkout.rib.swift')} value={rib.swift} />
                                        {rib.notes && (
                                            <Box sx={{ pt: 2 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
                                                    {t('checkout.rib.notes')}
                                                </Typography>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{rib.notes}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                )}
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
                                    {t('checkout.rib.uploadHeading')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {t('checkout.rib.uploadHint')}
                                </Typography>
                                <input ref={fileInputRef} type="file" accept={RECEIPT_ACCEPT} hidden onChange={onPick} />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                                    <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={pickFile} disabled={!ribConfigured || submitting}>
                                        {file ? t('checkout.rib.changeFile') : t('checkout.rib.chooseFile')}
                                    </Button>
                                    {file && (
                                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </Typography>
                                    )}
                                </Stack>
                                <Divider sx={{ my: 3 }} />
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Button component={Link} to={target.kind === 'sector_subscription' ? '/pricing' : `/reports/${target.report.slug || target.report.id}`}>
                                        {t('common.cancel')}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        disableElevation
                                        onClick={submit}
                                        disabled={!file || !ribConfigured || submitting || amountCents <= 0}
                                    >
                                        {submitting ? t('checkout.rib.submitting') : t('checkout.rib.submit')}
                                    </Button>
                                </Stack>
                            </Paper>
                        </Stack>
                    )}
                </Container>
            </Box>
            <Footer />
        </Box>
    )
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Document, Page } from 'react-pdf'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { setPdfjsWorkerSrc } from '../../lib/pdfjsWorker'
import { fitPageToBox, viewportSizeFromPdfPage } from '../../lib/pdfPageFit'
import { clonePdfBytes, loadSecureReportPdfBytes, logReportOpenEvent, pdfBytesToObjectUrl } from '../../lib/reportPdfAccess'
import { useAuth } from '../../context/AuthContext'

setPdfjsWorkerSrc()

const DOCUMENT_OPTIONS = Object.freeze({ withCredentials: false })

function WatermarkLayer({ label }) {
    const text = label || 'Licensed copy'
    return (
        <Box
            aria-hidden
            sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 4,
                overflow: 'hidden',
                opacity: 0.14,
            }}
        >
            {Array.from({ length: 12 }).map((_, i) => (
                <Typography
                    key={i}
                    component="span"
                    sx={{
                        position: 'absolute',
                        left: `${(i % 4) * 28}%`,
                        top: `${Math.floor(i / 4) * 32}%`,
                        transform: 'rotate(-24deg)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'secondary.dark',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                    }}
                >
                    {text} · View only
                </Typography>
            ))}
        </Box>
    )
}

/**
 * @param {{
 *   reportId: string
 *   watermark?: string
 *   onAccessDenied?: () => void
 *   fullscreen?: boolean
 *   backTo?: string
 *   backLabel?: string
 * }} props
 */
export default function SecureReportPdfViewer({
    reportId,
    watermark = '',
    onAccessDenied,
    fullscreen = false,
    backTo,
    backLabel = 'Back to report',
}) {
    const { supabase, user } = useAuth()
    const viewportRef = useRef(null)
    const [pageSize, setPageSize] = useState(null)
    const [renderWidth, setRenderWidth] = useState(720)
    const [pdfObjectUrl, setPdfObjectUrl] = useState(null)
    const [loadError, setLoadError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [numPages, setNumPages] = useState(0)
    const [page, setPage] = useState(1)

    const watermarkLabel = useMemo(() => {
        if (watermark) return watermark
        if (user?.email) return user.email
        return user?.id?.slice(0, 8) || 'Licensed'
    }, [watermark, user?.email, user?.id])

    useEffect(() => {
        const blockShortcuts = e => {
            if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'S', 'P'].includes(e.key)) {
                e.preventDefault()
            }
        }
        document.addEventListener('keydown', blockShortcuts, true)
        return () => document.removeEventListener('keydown', blockShortcuts, true)
    }, [])

    useEffect(() => {
        if (!fullscreen) return undefined
        const onKey = e => {
            if (e.key === 'ArrowLeft') setPage(p => Math.max(1, p - 1))
            if (e.key === 'ArrowRight') setPage(p => (numPages ? Math.min(numPages, p + 1) : p))
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [fullscreen, numPages])

    useEffect(() => {
        if (fullscreen) {
            const prev = document.body.style.overflow
            document.body.style.overflow = 'hidden'
            return () => {
                document.body.style.overflow = prev
            }
        }
        return undefined
    }, [fullscreen])

    useEffect(() => {
        let cancelled = false
        let createdUrl = null
        ;(async () => {
            if (!supabase || !reportId) {
                setLoading(false)
                setLoadError('Unable to load viewer.')
                return
            }
            setLoading(true)
            setLoadError(null)
            setPdfObjectUrl(prev => {
                if (prev) URL.revokeObjectURL(prev)
                return null
            })
            const result = await loadSecureReportPdfBytes(supabase, reportId)
            if (cancelled) return
            if (result.error) {
                setLoadError(result.error.message)
                setLoading(false)
                if (result.error.message.includes('access') || result.error.message.includes('Sign in')) {
                    onAccessDenied?.()
                }
                return
            }
            const bytes = clonePdfBytes(result.data)
            createdUrl = pdfBytesToObjectUrl(bytes)
            if (cancelled) {
                URL.revokeObjectURL(createdUrl)
                return
            }
            setPdfObjectUrl(createdUrl)
            setLoading(false)
            void logReportOpenEvent(supabase, reportId)
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, reportId, onAccessDenied])

    useEffect(() => {
        return () => {
            if (pdfObjectUrl) URL.revokeObjectURL(pdfObjectUrl)
        }
    }, [pdfObjectUrl])

    const updateRenderWidth = useCallback(() => {
        const el = viewportRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        if (rect.width <= 0) return
        const { width } = fitPageToBox(pageSize, rect.width, rect.height)
        if (width > 0) setRenderWidth(width)
    }, [pageSize])

    useEffect(() => {
        const el = viewportRef.current
        if (!el) return undefined
        updateRenderWidth()
        const ro = new ResizeObserver(() => updateRenderWidth())
        ro.observe(el)
        return () => ro.disconnect()
    }, [updateRenderWidth, pageSize, page, fullscreen])

    const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
        setNumPages(n)
        setPage(1)
        setLoadError(null)
    }, [])

    const onDocumentLoadError = useCallback(err => {
        console.error('secure pdf load', err)
        setLoadError(err?.message || 'Could not render PDF.')
    }, [])

    const onPageLoadSuccess = useCallback(
        pdfPage => {
            setPageSize(viewportSizeFromPdfPage(pdfPage))
        },
        [],
    )

    const preventContext = useCallback(e => {
        e.preventDefault()
    }, [])

    const pageBlock = pdfObjectUrl && !loading && (
        <Box
            ref={viewportRef}
            onContextMenu={preventContext}
            onCopy={preventContext}
            onCut={preventContext}
            onDragStart={preventContext}
            sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                flex: fullscreen ? 1 : undefined,
                minHeight: fullscreen ? 0 : 200,
                maxHeight: fullscreen ? 'none' : { xs: '72vh', md: '80vh' },
                overflow: fullscreen ? 'hidden' : 'auto',
                borderRadius: fullscreen ? 0 : 1,
                bgcolor: fullscreen ? 'transparent' : 'grey.100',
                border: fullscreen ? 'none' : '1px solid',
                borderColor: 'divider',
                userSelect: 'none',
                WebkitUserSelect: 'none',
            }}
        >
            <WatermarkLayer label={watermarkLabel} />
            <Box
                sx={{
                    position: 'relative',
                    width: renderWidth,
                    maxWidth: '100%',
                    mx: 'auto',
                    boxShadow: fullscreen ? '0 8px 40px rgba(0,0,0,0.45)' : '0 2px 12px rgba(0,0,0,0.08)',
                    bgcolor: '#fff',
                    lineHeight: 0,
                    ...(pageSize && {
                        aspectRatio: `${pageSize.width} / ${pageSize.height}`,
                    }),
                }}
            >
                <Document
                    key={pdfObjectUrl}
                    file={pdfObjectUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    options={DOCUMENT_OPTIONS}
                    loading={
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress size={28} color="secondary" />
                        </Box>
                    }
                >
                    <Page
                        pageNumber={page}
                        width={renderWidth}
                        onLoadSuccess={onPageLoadSuccess}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                </Document>
            </Box>
        </Box>
    )

    const pagination = pdfObjectUrl && !loading && (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            gap={1}
            sx={{
                py: fullscreen ? 1.5 : 1,
                px: 2,
                flexShrink: 0,
                bgcolor: fullscreen ? 'rgba(0,0,0,0.35)' : 'transparent',
            }}
        >
            <IconButton
                size="small"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                sx={fullscreen ? { color: '#fff' } : undefined}
            >
                <ChevronLeftIcon />
            </IconButton>
            <Typography variant="body2" fontWeight={600} sx={fullscreen ? { color: '#fff' } : undefined}>
                Page {page} of {numPages || '…'}
            </Typography>
            <IconButton
                size="small"
                aria-label="Next page"
                disabled={!numPages || page >= numPages}
                onClick={() => setPage(p => Math.min(numPages, p + 1))}
                sx={fullscreen ? { color: '#fff' } : undefined}
            >
                <ChevronRightIcon />
            </IconButton>
        </Stack>
    )

    if (fullscreen) {
        return (
            <Box
                className="secure-pdf-viewer secure-pdf-viewer--fullscreen"
                sx={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1400,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#2c3748',
                    '@media print': { display: 'none !important' },
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: { xs: 12, sm: 16 },
                        left: { xs: 12, sm: 16 },
                        zIndex: 10,
                    }}
                >
                    {backTo && (
                        <Button
                            component={Link}
                            to={backTo}
                            variant="contained"
                            color="secondary"
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                fontWeight: 700,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                            }}
                        >
                            {backLabel}
                        </Button>
                    )}
                </Box>

                {loading && (
                    <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
                        <CircularProgress sx={{ color: '#e1f4f7' }} />
                        <Typography variant="caption" sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}>
                            Loading report…
                        </Typography>
                    </Stack>
                )}

                {loadError && !loading && (
                    <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, px: 2 }}>
                        <Alert severity="warning" sx={{ maxWidth: 420 }}>
                            {loadError}
                        </Alert>
                        {backTo && (
                            <Button component={Link} to={backTo} variant="outlined" sx={{ mt: 2, color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
                                {backLabel}
                            </Button>
                        )}
                    </Stack>
                )}

                {!loading && !loadError && (
                    <>
                        {pageBlock}
                        {pagination}
                    </>
                )}
            </Box>
        )
    }

    return (
        <Card variant="outlined" className="secure-pdf-viewer" sx={{ overflow: 'hidden', borderRadius: 2, '@media print': { display: 'none !important' } }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                {loading && (
                    <Stack alignItems="center" py={6}>
                        <CircularProgress color="secondary" />
                    </Stack>
                )}
                {loadError && !loading && <Alert severity="warning">{loadError}</Alert>}
                {pageBlock}
                {pagination}
            </CardContent>
        </Card>
    )
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

// Vite’s optimizer can serve a stale bundled worker (e.g. 4.x) while react-pdf uses pdfjs 5.4.x.
// Pin worker to the same version as the API via jsdelivr (matches `pdfjs.version` at runtime).
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

/** Only these pages are rendered; page 1 sharp, 2–3 blurred, 4+ never shown. */
const MAX_VISIBLE_PAGE = 3

/** Stable reference — react-pdf warns if `options` identity changes each render. */
const DOCUMENT_OPTIONS = Object.freeze({ withCredentials: false })

export default function ReportFirstPagePdfPreview({ signedUrl, title = 'Report preview' }) {
    const containerRef = useRef(null)
    const [containerWidth, setContainerWidth] = useState(640)
    const [numPages, setNumPages] = useState(0)
    const [loadError, setLoadError] = useState(null)

    const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
        setLoadError(null)
        setNumPages(n)
    }, [])

    const onDocumentLoadError = useCallback(err => {
        console.error('react-pdf load error', err)
        setLoadError(err?.message || 'Could not load PDF preview.')
        setNumPages(0)
    }, [])

    useEffect(() => {
        const el = containerRef.current
        if (!el) return undefined
        const measure = () => {
            const w = el.getBoundingClientRect().width
            if (w > 0) setContainerWidth(Math.floor(w))
        }
        measure()
        const ro = new ResizeObserver(() => measure())
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const visiblePageNumbers = useMemo(() => {
        if (!numPages) return []
        const last = Math.min(MAX_VISIBLE_PAGE, numPages)
        return Array.from({ length: last }, (_, i) => i + 1)
    }, [numPages])

    if (!signedUrl) return null

    return (
        <Card variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
            <CardContent sx={{ pb: 1.5, pt: 2.5, px: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    Page 1 is readable; pages 2–3 are blurred; page 4+ are hidden. Purchase for the full PDF.
                </Typography>
                {loadError && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {loadError}
                    </Alert>
                )}
                <Box
                    ref={containerRef}
                    sx={{
                        width: '100%',
                        maxHeight: { xs: '70vh', sm: '75vh' },
                        overflow: 'auto',
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Document
                        file={signedUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                <CircularProgress color="secondary" />
                            </Box>
                        }
                        options={DOCUMENT_OPTIONS}
                    >
                        {visiblePageNumbers.map(pageNum => {
                            const isBlurred = pageNum >= 2
                            return (
                                <Box
                                    key={pageNum}
                                    sx={{
                                        position: 'relative',
                                        mb: pageNum < visiblePageNumbers.length ? 0.5 : 0,
                                        // Blur following pages; clip so blur does not paint outside card
                                        overflow: 'hidden',
                                        ...(isBlurred && {
                                            filter: 'blur(12px)',
                                            opacity: 0.92,
                                            userSelect: 'none',
                                            pointerEvents: 'none',
                                            transform: 'translateZ(0)',
                                        }),
                                    }}
                                    aria-hidden={isBlurred}
                                >
                                    {isBlurred && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
                                                zIndex: 2,
                                                bgcolor: 'rgba(255,255,255,0.85)',
                                                px: 1,
                                                py: 0.25,
                                                borderRadius: 1,
                                                fontWeight: 700,
                                                color: 'text.secondary',
                                            }}
                                        >
                                            Page {pageNum}
                                        </Typography>
                                    )}
                                    <Page
                                        pageNumber={pageNum}
                                        width={containerWidth}
                                        renderTextLayer={!isBlurred}
                                        renderAnnotationLayer={!isBlurred}
                                    />
                                </Box>
                            )
                        })}
                    </Document>
                </Box>
                {numPages > MAX_VISIBLE_PAGE && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
                        +{numPages - MAX_VISIBLE_PAGE} more {numPages - MAX_VISIBLE_PAGE === 1 ? 'page' : 'pages'} hidden — included with purchase.
                    </Typography>
                )}
            </CardContent>
        </Card>
    )
}

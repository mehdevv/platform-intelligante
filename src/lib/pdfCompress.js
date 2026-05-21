import { pdfjs, setPdfjsWorkerSrc } from './pdfjsWorker'

/** Lazy-load pdf-lib so Vite’s dev pre-bundle for it isn’t tied to the main graph (avoids stale 504s after dep changes). */
let pdfLibPromise
function getPdfLib() {
    if (!pdfLibPromise) pdfLibPromise = import('pdf-lib')
    return pdfLibPromise
}

/** Max size after compression (upload limit). */
export const MAX_ADMIN_PDF_BYTES = 30 * 1024 * 1024

function mb(n) {
    return (n / (1024 * 1024)).toFixed(2)
}

async function tryPdfLibRewrite(arrayBuffer) {
    const { PDFDocument } = await getPdfLib()
    const src = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
    const bytes = await src.save({ useObjectStreams: true })
    return new Uint8Array(bytes)
}

async function tryPdfLibCopyFresh(arrayBuffer) {
    const { PDFDocument } = await getPdfLib()
    const src = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
    const dst = await PDFDocument.create()
    const copied = await dst.copyPages(src, src.getPageIndices())
    copied.forEach(p => dst.addPage(p))
    const bytes = await dst.save({ useObjectStreams: true })
    return new Uint8Array(bytes)
}

const RASTER_TIERS = [
    { maxSide: 2000, quality: 0.88 },
    { maxSide: 1680, quality: 0.84 },
    { maxSide: 1440, quality: 0.8 },
    { maxSide: 1200, quality: 0.76 },
    { maxSide: 1024, quality: 0.72 },
]

/**
 * Re-render each page as JPEG in a new PDF (helps image-heavy PDFs).
 * Each tier rebuilds from the original bytes.
 */
async function tryRasterizeUnderLimit(originalBytes, maxBytes) {
    const { PDFDocument } = await getPdfLib()
    setPdfjsWorkerSrc()
    const data = originalBytes.byteOffset === 0 && originalBytes.byteLength === originalBytes.buffer.byteLength
        ? originalBytes
        : new Uint8Array(originalBytes)

    for (const { maxSide, quality } of RASTER_TIERS) {
        const loadingTask = pdfjs.getDocument({ data: data.slice(0) })
        let pdfDoc = null
        try {
            pdfDoc = await loadingTask.promise
            const out = await PDFDocument.create()
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i)
                const base = page.getViewport({ scale: 1 })
                const fit = Math.min(1, maxSide / Math.max(base.width, base.height))
                const viewport = page.getViewport({ scale: fit })
                const w = Math.max(1, Math.floor(viewport.width))
                const h = Math.max(1, Math.floor(viewport.height))
                const canvas = document.createElement('canvas')
                canvas.width = w
                canvas.height = h
                const ctx = canvas.getContext('2d', { alpha: false })
                if (!ctx) throw new Error('Canvas not available')
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, 0, w, h)
                const renderTask = page.render({ canvasContext: ctx, viewport })
                await renderTask.promise
                const blob = await new Promise((resolve, reject) => {
                    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('JPEG encode failed'))), 'image/jpeg', quality)
                })
                const jpgBuf = await blob.arrayBuffer()
                const jpgImage = await out.embedJpg(new Uint8Array(jpgBuf))
                const pageNode = out.addPage([jpgImage.width, jpgImage.height])
                pageNode.drawImage(jpgImage, {
                    x: 0,
                    y: 0,
                    width: jpgImage.width,
                    height: jpgImage.height,
                })
            }
            const saved = await out.save({ useObjectStreams: true })
            const u8 = new Uint8Array(saved)
            if (u8.byteLength <= maxBytes) return u8
        } finally {
            await pdfDoc?.cleanup?.()
            await loadingTask.destroy?.()
        }
    }
    return null
}

/**
 * If the file is over maxBytes, run structure optimization then optional JPEG re-encode tiers.
 * @returns {{ file: File, message: string | null }}
 */
export async function ensurePdfUnderMaxBytes(file, maxBytes = MAX_ADMIN_PDF_BYTES) {
    if (file.type !== 'application/pdf') {
        throw new Error('Please choose a PDF file.')
    }
    if (file.size <= maxBytes) {
        return { file, message: null }
    }

    const originalBuf = await file.arrayBuffer()
    let bestSize = file.size

    try {
        const u8 = await tryPdfLibRewrite(originalBuf)
        bestSize = Math.min(bestSize, u8.byteLength)
        if (u8.byteLength <= maxBytes) {
            return {
                file: new File([u8], file.name, { type: 'application/pdf' }),
                message: `Compressed from ${mb(file.size)} MB to ${mb(u8.byteLength)} MB (structure optimization) for the ${mb(maxBytes)} MB limit.`,
            }
        }
    } catch {
        // ignore — try next strategy
    }

    try {
        const u8 = await tryPdfLibCopyFresh(originalBuf)
        bestSize = Math.min(bestSize, u8.byteLength)
        if (u8.byteLength <= maxBytes) {
            return {
                file: new File([u8], file.name, { type: 'application/pdf' }),
                message: `Compressed from ${mb(file.size)} MB to ${mb(u8.byteLength)} MB (page rewrite) for the ${mb(maxBytes)} MB limit.`,
            }
        }
    } catch {
        // ignore
    }

    const raster = await tryRasterizeUnderLimit(new Uint8Array(originalBuf), maxBytes)
    if (raster) {
        bestSize = Math.min(bestSize, raster.byteLength)
        return {
            file: new File([raster], file.name, { type: 'application/pdf' }),
            message: `Compressed from ${mb(file.size)} MB to ${mb(raster.byteLength)} MB (page JPEG re-encode) for the ${mb(maxBytes)} MB limit.`,
        }
    }

    throw new Error(
        `Could not reduce this PDF below ${mb(maxBytes)} MB automatically (best attempt still about ${mb(bestSize)} MB). Try a smaller export or split the document.`,
    )
}

import * as pdfjs from 'pdfjs-dist'

/** Same-version worker as the pdfjs API (avoids Vite/react-pdf worker mismatch). */
export function setPdfjsWorkerSrc() {
    if (typeof window === 'undefined') return
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

export { pdfjs }

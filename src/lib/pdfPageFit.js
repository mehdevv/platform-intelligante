/**
 * Fit a PDF page viewport into a box while preserving aspect ratio.
 * @param {{ width: number, height: number }} page
 * @param {number} boxWidth
 * @param {number} [boxHeight]
 */
export function fitPageToBox(page, boxWidth, boxHeight) {
    if (!page?.width || !page?.height || !boxWidth) {
        return { width: Math.floor(boxWidth || 0), height: undefined }
    }
    const aspect = page.height / page.width
    let w = boxWidth
    let h = w * aspect
    if (boxHeight && h > boxHeight) {
        h = boxHeight
        w = h / aspect
    }
    return { width: Math.floor(w), height: Math.floor(h) }
}

/** @param {import('pdfjs-dist').PDFPageProxy} pdfPage */
export function viewportSizeFromPdfPage(pdfPage) {
    const vp = pdfPage.getViewport({ scale: 1 })
    return { width: vp.width, height: vp.height }
}

/** Must match `storage.buckets.id` in supabase/migrations/20260521100000_report_pdf_storage.sql */
export const REPORT_PDFS_BUCKET = 'report-pdfs'

/** Stable object key inside the bucket (staff upload / replace). */
export function fullPdfStoragePath(reportId) {
    return `${reportId}/full.pdf`
}

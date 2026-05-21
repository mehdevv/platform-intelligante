/**
 * Payment receipt storage helpers for the manual bank-transfer (RIB) flow.
 * Uses the private `payment-receipts` bucket — owners may upload to
 * `{auth.uid}/...` and staff may view any receipt.
 */

export const PAYMENT_RECEIPTS_BUCKET = 'payment-receipts'

export const RECEIPT_MAX_BYTES = 10 * 1024 * 1024

export const RECEIPT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,application/pdf'

const RECEIPT_ALLOWED_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
])

function safeFileName(name) {
    const fallback = 'receipt'
    if (!name) return fallback
    const cleaned = String(name).replace(/[^\w.\-]+/g, '_').slice(0, 120)
    return cleaned || fallback
}

/**
 * Upload a payment receipt file. Returns the storage path stored in
 * `payment_requests.receipt_storage_path`.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function uploadPaymentReceipt(supabase, userId, file) {
    if (!supabase) throw new Error('Supabase client unavailable')
    if (!userId) throw new Error('You must be signed in to upload a receipt.')
    if (!file) throw new Error('Please choose a file.')
    if (!RECEIPT_ALLOWED_MIME.has(file.type)) {
        throw new Error('Receipts must be an image (JPEG, PNG, WebP, GIF) or PDF.')
    }
    if (file.size > RECEIPT_MAX_BYTES) {
        throw new Error('Receipt must be 10 MB or smaller.')
    }
    const path = `${userId}/${crypto.randomUUID()}-${safeFileName(file.name)}`
    const { error } = await supabase.storage.from(PAYMENT_RECEIPTS_BUCKET).upload(path, file, {
        upsert: false,
        contentType: file.type,
    })
    if (error) throw new Error(error.message)
    return path
}

/**
 * Build a short-lived signed URL for previewing a receipt. Staff or owner.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} path
 * @param {number} [expiresIn] seconds (default 600)
 * @returns {Promise<string | null>}
 */
export async function getReceiptSignedUrl(supabase, path, expiresIn = 600) {
    if (!supabase || !path) return null
    const { data, error } = await supabase.storage.from(PAYMENT_RECEIPTS_BUCKET).createSignedUrl(path, expiresIn)
    if (error) return null
    return data?.signedUrl || null
}

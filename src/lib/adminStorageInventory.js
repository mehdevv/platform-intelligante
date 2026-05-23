import { formatBytes } from './storageQuota'

/** @typedef {'pdf'|'receipt'|'image'|'document'|'blog_source'} StorageFileCategory */
/** @typedef {'report'|'payment'|'blog'|'none'} StorageTiedType */

/**
 * @typedef {object} StorageInventoryItem
 * @property {string} bucket
 * @property {string} path
 * @property {number} bytes
 * @property {string} created_at
 * @property {string} mime_type
 * @property {StorageFileCategory} file_category
 * @property {StorageTiedType} tied_type
 * @property {string} tied_label
 * @property {string|null} tied_entity_id
 * @property {boolean} needed
 * @property {string|null} reason
 */

export const STORAGE_REASON_LABELS = {
    orphan_report_pdf: 'Orphan report PDF (no DB link)',
    archived_report_pdf: 'Archived report PDF',
    orphan_receipt: 'Orphan receipt (no payment row)',
    rejected_receipt: 'Rejected payment receipt',
    orphan_blog_source: 'Orphan blog attachment',
}

export const STORAGE_CATEGORY_LABELS = {
    pdf: 'PDF',
    receipt: 'Receipt',
    image: 'Image',
    document: 'Document',
}

export const STORAGE_TIED_LABELS = {
    report: 'Report',
    payment: 'Payment',
    blog: 'Blog',
    none: '—',
}

/** @param {unknown} raw */
export function parseStorageInventory(raw) {
    if (!Array.isArray(raw)) return []
    return raw
        .map(row => ({
            bucket: String(row.bucket ?? ''),
            path: String(row.path ?? ''),
            bytes: Number(row.bytes) || 0,
            created_at: row.created_at ?? null,
            mime_type: String(row.mime_type ?? ''),
            file_category: row.file_category || 'document',
            tied_type: row.tied_type || 'none',
            tied_label: String(row.tied_label ?? ''),
            tied_entity_id: row.tied_entity_id ?? null,
            needed: Boolean(row.needed),
            reason: row.reason ?? null,
        }))
        .filter(r => r.bucket && r.path)
}

export function formatStorageSize(bytes) {
    return formatBytes(Number(bytes) || 0)
}

export function reasonLabel(code) {
    if (!code) return '—'
    return STORAGE_REASON_LABELS[code] || code
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
export async function fetchStorageInventory(supabase) {
    const { data, error } = await supabase.rpc('admin_storage_inventory')
    if (error) throw error
    return parseStorageInventory(data)
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} bucket
 * @param {string} path
 */
export async function deleteNotNeededStorageFile(supabase, bucket, path) {
    const { data, error } = await supabase.rpc('admin_delete_storage_file', {
        p_bucket: bucket,
        p_path: path,
    })
    if (error) throw error
    return data
}

/** Default 1 GiB — adjust to your Supabase plan (Dashboard → Project Settings → Usage). */
const DEFAULT_QUOTA_BYTES = 1024 ** 3

export function getStorageQuotaBytes() {
    const raw = import.meta.env.VITE_SUPABASE_STORAGE_QUOTA_BYTES
    if (raw === undefined || raw === '') return DEFAULT_QUOTA_BYTES
    const n = Number.parseInt(String(raw), 10)
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_QUOTA_BYTES
}

export function formatBytes(n) {
    const v = Number(n)
    if (!Number.isFinite(v) || v < 0) return '—'
    if (v < 1024) return `${Math.round(v)} B`
    if (v < 1024 ** 2) return `${(v / 1024).toFixed(1)} KB`
    if (v < 1024 ** 3) return `${(v / 1024 ** 2).toFixed(1)} MB`
    return `${(v / 1024 ** 3).toFixed(2)} GB`
}

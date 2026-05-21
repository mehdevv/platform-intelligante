/**
 * imgBB image upload (API v1).
 * Set `VITE_IMGBB_API_KEY` in `.env` (never commit the real key).
 * In dev, Vite proxies `/__imgbb` → `https://api.imgbb.com` to avoid browser CORS issues.
 */

const IMGBB_PATH = '/1/upload'

function uploadEndpoint() {
    if (import.meta.env.DEV) {
        return `/__imgbb${IMGBB_PATH}`
    }
    return `https://api.imgbb.com${IMGBB_PATH}`
}

export function getImgbbApiKey() {
    const k = import.meta.env.VITE_IMGBB_API_KEY
    if (k === undefined || k === null || String(k).trim() === '') return null
    return String(k).trim()
}

function fileToBase64Data(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => {
            const s = r.result
            if (typeof s !== 'string') {
                reject(new Error('Could not read file'))
                return
            }
            const comma = s.indexOf(',')
            resolve(comma >= 0 ? s.slice(comma + 1) : s)
        }
        r.onerror = () => reject(new Error('Could not read file'))
        r.readAsDataURL(file)
    })
}

/**
 * @param {File} file
 * @returns {Promise<{ displayUrl: string, pageUrl: string }>}
 */
export async function uploadImageFileToImgbb(file) {
    const key = getImgbbApiKey()
    if (!key) {
        throw new Error('Missing VITE_IMGBB_API_KEY in .env — add your imgBB API key and restart the dev server.')
    }
    if (!file?.type?.startsWith('image/')) {
        throw new Error('Please choose an image file (JPEG, PNG, WebP, or GIF).')
    }
    const maxBytes = 28 * 1024 * 1024
    if (file.size > maxBytes) {
        throw new Error('Image must be under 28 MB (imgBB limit is 32 MB).')
    }

    const image = await fileToBase64Data(file)
    const body = new FormData()
    body.append('key', key)
    body.append('image', image)

    const res = await fetch(uploadEndpoint(), { method: 'POST', body })
    const json = await res.json().catch(() => ({}))
    if (!json.success) {
        const msg = json?.error?.message || json?.error || res.statusText || 'imgBB upload failed'
        throw new Error(typeof msg === 'string' ? msg : 'imgBB upload failed')
    }
    const d = json.data
    const displayUrl = d?.display_url || d?.url
    const pageUrl = d?.url_viewer || d?.url
    if (!displayUrl) {
        throw new Error('imgBB returned no image URL')
    }
    return { displayUrl, pageUrl: pageUrl || displayUrl }
}

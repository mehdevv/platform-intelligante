/**
 * Upload a blog source file (PDF, document, etc.) to Supabase Storage `blog-sources`.
 * Bucket must exist (see migration 20260526120000_blog_posts_cover_sources_storage.sql).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {File} file
 * @returns {Promise<string>} Public URL
 */
export async function uploadBlogSourceFileToStorage(supabase, userId, file) {
    if (!supabase || !userId || !file) {
        throw new Error('Missing upload parameters')
    }
    const rawName = file.name || 'file'
    const safe = rawName.replace(/[^\w.\-]+/g, '_').slice(0, 120) || 'file'
    const path = `${userId}/${crypto.randomUUID()}-${safe}`
    const { error } = await supabase.storage.from('blog-sources').upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
    })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('blog-sources').getPublicUrl(path)
    const url = data?.publicUrl
    if (!url) throw new Error('Storage returned no public URL')
    return url
}

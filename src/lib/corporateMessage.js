/**
 * @param {{ name: string, email: string, subject: string, body: string }} fields
 */
export function validateCorporateMessageFields(fields) {
    const name = String(fields?.name ?? '').trim()
    const email = String(fields?.email ?? '').trim()
    const subject = String(fields?.subject ?? '').trim()
    const body = String(fields?.body ?? '').trim()
    if (!name || !email || !subject || !body) {
        return { ok: false, error: 'missing' }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { ok: false, error: 'email' }
    }
    return { ok: true, payload: { name, email, subject, body, status: 'new' } }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
export async function submitCorporateMessage(supabase, fields) {
    const v = validateCorporateMessageFields(fields)
    if (!v.ok) {
        const err = new Error(v.error === 'email' ? 'invalid_email' : 'missing_fields')
        err.code = v.error
        throw err
    }
    const { error } = await supabase.from('corporate_messages').insert(v.payload)
    if (error) throw error
}

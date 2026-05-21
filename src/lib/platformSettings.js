/**
 * Helpers for `public.platform_settings` (key/value JSON store).
 *
 * The `bank_rib` row is the manual bank-transfer information shown on the
 * checkout page. It is readable by anyone (RLS policy `platform_settings_public_read`)
 * and writable only by admins (`platform_settings_admin`).
 */

const BANK_RIB_KEY = 'bank_rib'

export const BANK_RIB_FIELDS = ['bank_name', 'account_holder', 'rib', 'iban', 'swift', 'notes']

export function emptyBankRib() {
    return BANK_RIB_FIELDS.reduce((acc, k) => {
        acc[k] = ''
        return acc
    }, {})
}

function normalizeBankRib(value) {
    const base = emptyBankRib()
    if (!value || typeof value !== 'object') return base
    for (const k of BANK_RIB_FIELDS) {
        const v = value[k]
        base[k] = typeof v === 'string' ? v : v == null ? '' : String(v)
    }
    return base
}

export function isBankRibConfigured(value) {
    if (!value) return false
    return Boolean(value.bank_name?.trim() && (value.rib?.trim() || value.iban?.trim()))
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{ bank_name: string, account_holder: string, rib: string, iban: string, swift: string, notes: string }>}
 */
export async function getBankRib(supabase) {
    if (!supabase) return emptyBankRib()
    const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', BANK_RIB_KEY)
        .maybeSingle()
    if (error) throw new Error(error.message)
    return normalizeBankRib(data?.value)
}

/**
 * Upsert the `bank_rib` row. Admin only (enforced by RLS).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Partial<ReturnType<typeof emptyBankRib>>} value
 */
export async function saveBankRib(supabase, value) {
    if (!supabase) throw new Error('Supabase client unavailable')
    const payload = normalizeBankRib(value)
    const { error } = await supabase
        .from('platform_settings')
        .upsert({ key: BANK_RIB_KEY, value: payload, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw new Error(error.message)
    return payload
}

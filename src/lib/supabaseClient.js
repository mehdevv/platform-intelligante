import { createClient } from '@supabase/supabase-js'

/** Trim and strip optional quotes (common in .env files). */
function envStr(v) {
    if (v == null || v === '') return ''
    let s = String(v).trim()
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1).trim()
    }
    return s
}

/** One browser client only — multiple GoTrueClient instances share one storage key and deadlock (NavigatorLockAcquireTimeoutError). */
let cachedClient = null

/**
 * Browser client — anon key only. RLS enforces access per JWT.
 * Returns the same instance on every call. Returns null if env is missing.
 */
export function getSupabase() {
    const url = envStr(import.meta.env.VITE_SUPABASE_URL)
    const anonKey = envStr(import.meta.env.VITE_SUPABASE_ANON_KEY)
    if (!url || !anonKey) {
        cachedClient = null
        return null
    }
    if (!cachedClient) {
        cachedClient = createClient(url, anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                // Avoid Navigator Lock API deadlocks with React Strict Mode + async work in onAuthStateChange.
                // Must return fn()'s result — otherwise getSession() / token refresh resolve to undefined.
                lock: async (_name, _acquireTimeout, fn) => {
                    return await fn()
                },
            },
        })
    }
    return cachedClient
}

export const supabase = getSupabase()

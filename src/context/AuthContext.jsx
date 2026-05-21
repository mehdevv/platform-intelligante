import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getSupabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

/** getSession() should return { data: { session } } but can be undefined with some auth/lock edge cases — never destructure blindly. */
async function readSessionSafe(client) {
    try {
        const out = await client.auth.getSession()
        return out?.data?.session ?? null
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const supabase = useMemo(() => getSupabase(), [])
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(() => !!getSupabase())
    /** True while fetching profile for the current session user (avoids RequireAdmin seeing user before app_role is loaded). */
    const [profileLoading, setProfileLoading] = useState(false)
    const profileLoadGenRef = useRef(0)
    /** Avoid toggling profileLoading on TOKEN_REFRESHED / tab return — same user already has profile; RequireAdmin would unmount the whole admin tree and close dialogs. */
    const profileReadyForUserRef = useRef(null)

    const loadProfile = useCallback(
        async userId => {
            if (!supabase || !userId) {
                profileReadyForUserRef.current = null
                setProfile(null)
                setSubscription(null)
                setProfileLoading(false)
                return
            }
            const gen = ++profileLoadGenRef.current
            const sameUserAlreadyLoaded = profileReadyForUserRef.current === userId
            if (!sameUserAlreadyLoaded) {
                setProfileLoading(true)
            }
            try {
                const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single()
                if (gen !== profileLoadGenRef.current) return
                setProfile(prof ?? null)
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('status', 'active')
                    .maybeSingle()
                if (gen !== profileLoadGenRef.current) return
                setSubscription(sub ?? null)
                profileReadyForUserRef.current = userId
            } finally {
                if (gen === profileLoadGenRef.current) setProfileLoading(false)
            }
        },
        [supabase],
    )

    const refreshProfile = useCallback(
        explicitUserId => {
            const id = explicitUserId ?? session?.user?.id
            return id ? loadProfile(id) : Promise.resolve()
        },
        [session?.user?.id, loadProfile],
    )

    useEffect(() => {
        if (!supabase) {
            queueMicrotask(() => setLoading(false))
            return undefined
        }
        let cancelled = false
        ;(async () => {
            const s = await readSessionSafe(supabase)
            if (cancelled) return
            setSession(s)
            if (s?.user) await loadProfile(s.user.id)
            else {
                profileReadyForUserRef.current = null
                setProfile(null)
                setSubscription(null)
                setProfileLoading(false)
            }
            if (!cancelled) setLoading(false)
        })()

        const listener = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s)
            if (s?.user) {
                // Never await Supabase data calls inside this callback — it can deadlock GoTrue's storage lock.
                queueMicrotask(() => {
                    void loadProfile(s.user.id)
                })
            } else {
                profileLoadGenRef.current += 1
                profileReadyForUserRef.current = null
                setProfile(null)
                setSubscription(null)
                setProfileLoading(false)
            }
        })
        const sub = listener?.data?.subscription
        if (!sub) {
            if (!cancelled) setLoading(false)
            return () => {
                cancelled = true
            }
        }
        return () => {
            cancelled = true
            sub.unsubscribe()
        }
    }, [supabase, loadProfile])

    const isStaff = profile?.app_role === 'admin' || profile?.app_role === 'editor'
    const isAdmin = profile?.app_role === 'admin'

    const signOut = useCallback(async () => {
        if (!supabase) return false
        profileReadyForUserRef.current = null
        setSession(null)
        setProfile(null)
        setSubscription(null)
        setProfileLoading(false)
        const { error } = await supabase.auth.signOut({ scope: 'local' })
        if (error) {
            console.error('signOut', error)
            const s = await readSessionSafe(supabase)
            setSession(s)
            if (s?.user) await loadProfile(s.user.id)
            else {
                setProfile(null)
                setSubscription(null)
            }
            return false
        }
        return true
    }, [supabase, loadProfile])

    const value = useMemo(
        () => ({
            supabase,
            supabaseConfigured: !!supabase,
            session,
            user: session?.user ?? null,
            profile,
            subscription,
            loading,
            profileLoading,
            isStaff,
            isAdmin,
            refreshProfile,
            signOut,
        }),
        [supabase, session, profile, subscription, loading, profileLoading, isStaff, isAdmin, refreshProfile, signOut],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Fast refresh: hook colocated with provider for this app shell
// eslint-disable-next-line react-refresh/only-export-components -- useAuth is the public API
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

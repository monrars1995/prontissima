"use client"

// =============================================
// PRONTÍSSIMA — Supabase Sync Hook
// Progressive enhancement: syncs localStorage ↔ Supabase
// If Supabase is not configured, everything works via localStorage only
// =============================================

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { userStorage } from '@/lib/user-storage'

export function useSupabaseSync() {
    const [isOnline, setIsOnline] = useState(false)
    const [supabaseUser, setSupabaseUser] = useState(null)
    const [syncing, setSyncing] = useState(false)

    useEffect(() => {
        const supabase = getSupabase()
        if (!supabase) return

        // Check if user is authenticated
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setSupabaseUser(user)
                setIsOnline(true)
            }
        })

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    setSupabaseUser(session.user)
                    setIsOnline(true)
                } else {
                    setSupabaseUser(null)
                    setIsOnline(false)
                }
            }
        )

        return () => subscription?.unsubscribe()
    }, [])

    // Sync local user data to Supabase
    const syncUserToCloud = useCallback(async () => {
        if (!isOnline || syncing) return
        setSyncing(true)

        try {
            const localUser = userStorage.get()
            if (!localUser) return

            await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: localUser.name,
                    bodyInfo: localUser.bodyInfo || userStorage.getBodyInfo(),
                    credits: localUser.credits,
                    plan: localUser.plan,
                    isPremium: localUser.isPremium,
                    wardrobeLimit: localUser.wardrobeLimit,
                }),
            })
            console.log('[SYNC] ✅ Perfil sincronizado com Supabase')
        } catch (error) {
            console.error('[SYNC] Erro ao sincronizar:', error)
        } finally {
            setSyncing(false)
        }
    }, [isOnline, syncing])

    // Fetch user data from Supabase and update localStorage
    const syncUserFromCloud = useCallback(async () => {
        if (!isOnline) return null

        try {
            const res = await fetch('/api/user')
            if (!res.ok) return null

            const cloudUser = await res.json()

            // Update localStorage with cloud data
            const localUser = userStorage.get() || {}
            const mergedUser = {
                ...localUser,
                email: cloudUser.email,
                name: cloudUser.name,
                plan: cloudUser.plan,
                isPremium: cloudUser.isPremium,
                credits: cloudUser.credits,
                wardrobeLimit: cloudUser.wardrobeLimit,
                looksCreated: cloudUser.looksCreated,
            }
            userStorage.save(mergedUser)

            if (cloudUser.bodyInfo) {
                userStorage.setBodyInfo(cloudUser.bodyInfo)
            }

            console.log('[SYNC] ✅ Dados do cloud sincronizados para local')
            return cloudUser
        } catch (error) {
            console.error('[SYNC] Erro ao buscar dados do cloud:', error)
            return null
        }
    }, [isOnline])

    // Sign up via Supabase
    const signUp = useCallback(async (email, name) => {
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name }),
            })

            const data = await res.json()

            if (data.success && data.mode === 'supabase' && data.session) {
                // Set session in Supabase client
                const supabase = getSupabase()
                if (supabase && data.session) {
                    await supabase.auth.setSession(data.session)
                    setSupabaseUser(data.user)
                    setIsOnline(true)
                }
            }

            return data
        } catch (error) {
            console.error('[SYNC] Erro no signup:', error)
            return { success: false, error: error.message }
        }
    }, [])

    // Consume credit via API (server-side)
    const consumeCredit = useCallback(async () => {
        if (!isOnline) {
            // Fallback to localStorage
            return userStorage.consumeCredit()
        }

        try {
            const res = await fetch('/api/user/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'consume' }),
            })

            const data = await res.json()

            // Also update localStorage
            if (data.success) {
                const localUser = userStorage.get()
                if (localUser) {
                    if (localUser.credits.plan > 0) {
                        localUser.credits.plan -= 1
                    } else if (localUser.credits.packs > 0) {
                        localUser.credits.packs -= 1
                    }
                    userStorage.save(localUser)
                }
            }

            return data
        } catch (error) {
            // Fallback to localStorage
            return userStorage.consumeCredit()
        }
    }, [isOnline])

    return {
        isOnline,
        supabaseUser,
        syncing,
        signUp,
        syncUserToCloud,
        syncUserFromCloud,
        consumeCredit,
    }
}

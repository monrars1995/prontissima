// =============================================
// PRONTÍSSIMA — Supabase Client
// =============================================
import { createBrowserClient } from '@supabase/ssr'

// Browser client (used in components and client-side code)
export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    return createBrowserClient(url, key)
}

// Singleton for quick access
let _client = null
export function getSupabase() {
    if (typeof window === 'undefined') return null
    if (!_client) {
        _client = createClient()
    }
    return _client
}

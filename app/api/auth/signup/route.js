// =============================================
// PRONTÍSSIMA — Auth API: Signup
// =============================================
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
    try {
        const { email, name, password } = await request.json()

        if (!email || !name) {
            return NextResponse.json(
                { error: 'Email e nome são obrigatórios' },
                { status: 400 }
            )
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        // If Supabase is not configured, return success for localStorage-only mode
        if (!supabaseUrl || !supabaseAnonKey) {
            console.log('[AUTH] Supabase não configurado — modo localStorage')
            return NextResponse.json({
                success: true,
                mode: 'local',
                user: { email, name }
            })
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password: password || email, // Use email as default password for easy onboarding
            options: {
                data: { name },
                emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
            },
        })

        if (error) {
            console.error('[AUTH] Erro no signup:', error.message)

            // If user already exists, try to sign in
            if (error.message.includes('already registered')) {
                return NextResponse.json({
                    success: true,
                    mode: 'existing',
                    message: 'Usuário já existe'
                })
            }

            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            mode: 'supabase',
            user: {
                id: data.user?.id,
                email: data.user?.email,
                name,
            },
            session: data.session,
        })
    } catch (error) {
        console.error('[AUTH] Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

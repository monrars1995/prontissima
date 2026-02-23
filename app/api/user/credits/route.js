// =============================================
// PRONTÍSSIMA — User Credits API
// POST: consume credit | add pack credits
// =============================================
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(request) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const { action, amount } = await request.json()

        // Get current profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('credits_plan, credits_packs, dev_mode')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
        }

        if (action === 'consume') {
            // Dev mode = unlimited
            if (profile.dev_mode) {
                return NextResponse.json({
                    success: true,
                    credits: profile.credits_plan + profile.credits_packs,
                    devMode: true,
                })
            }

            let updates = {}
            if (profile.credits_plan > 0) {
                updates = { credits_plan: profile.credits_plan - 1 }
            } else if (profile.credits_packs > 0) {
                updates = { credits_packs: profile.credits_packs - 1 }
            } else {
                return NextResponse.json({
                    success: false,
                    credits: 0,
                    redirect: '/limit-reached'
                })
            }

            const { error } = await supabase
                .from('profiles')
                .update({ ...updates, looks_created: (profile.looks_created || 0) + 1 })
                .eq('id', user.id)

            if (error) {
                return NextResponse.json({ error: 'Erro ao consumir crédito' }, { status: 500 })
            }

            const remaining = (updates.credits_plan ?? profile.credits_plan) + (updates.credits_packs ?? profile.credits_packs)
            return NextResponse.json({ success: true, credits: remaining })
        }

        if (action === 'add_pack' && amount > 0) {
            const { error } = await supabase
                .from('profiles')
                .update({ credits_packs: profile.credits_packs + amount })
                .eq('id', user.id)

            if (error) {
                return NextResponse.json({ error: 'Erro ao adicionar créditos' }, { status: 500 })
            }

            return NextResponse.json({
                success: true,
                credits: profile.credits_plan + profile.credits_packs + amount,
            })
        }

        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    } catch (error) {
        console.error('[CREDITS] Erro interno:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

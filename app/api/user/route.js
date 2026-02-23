// =============================================
// PRONTÍSSIMA — User Profile API
// GET: fetch current user profile
// PATCH: update profile fields
// =============================================
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
    try {
        const supabase = await createServerSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error('[USER] Erro ao buscar perfil:', error)
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
        }

        return NextResponse.json({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            plan: profile.plan,
            isPremium: profile.is_premium,
            credits: {
                plan: profile.credits_plan,
                packs: profile.credits_packs,
            },
            wardrobeLimit: profile.wardrobe_limit,
            bodyInfo: profile.body_info,
            looksCreated: profile.looks_created,
            createdAt: profile.created_at,
        })
    } catch (error) {
        console.error('[USER] Erro interno:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function PATCH(request) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const updates = await request.json()

        // Map frontend field names to database column names
        const dbUpdates = {}
        if (updates.name !== undefined) dbUpdates.name = updates.name
        if (updates.plan !== undefined) dbUpdates.plan = updates.plan
        if (updates.isPremium !== undefined) dbUpdates.is_premium = updates.isPremium
        if (updates.bodyInfo !== undefined) dbUpdates.body_info = updates.bodyInfo
        if (updates.credits?.plan !== undefined) dbUpdates.credits_plan = updates.credits.plan
        if (updates.credits?.packs !== undefined) dbUpdates.credits_packs = updates.credits.packs
        if (updates.wardrobeLimit !== undefined) dbUpdates.wardrobe_limit = updates.wardrobeLimit
        if (updates.looksCreated !== undefined) dbUpdates.looks_created = updates.looksCreated

        dbUpdates.updated_at = new Date().toISOString()

        const { data, error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', user.id)
            .select()
            .single()

        if (error) {
            console.error('[USER] Erro ao atualizar perfil:', error)
            return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
        }

        return NextResponse.json({ success: true, profile: data })
    } catch (error) {
        console.error('[USER] Erro interno:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

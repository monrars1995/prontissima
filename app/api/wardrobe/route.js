// =============================================
// PRONTÍSSIMA — Wardrobe API
// GET: list user's pieces | POST: add piece | DELETE: remove piece
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

        const { data: pieces, error } = await supabase
            .from('wardrobe_pieces')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[WARDROBE] Erro ao buscar peças:', error)
            return NextResponse.json({ error: 'Erro ao buscar peças' }, { status: 500 })
        }

        // Map to frontend format
        const formattedPieces = (pieces || []).map(p => ({
            id: p.id,
            name: p.name,
            tipo: p.tipo,
            categoria: p.categoria,
            cor: p.cor,
            colorSlug: p.color_slug,
            colorRgb: p.color_rgb,
            image: p.image_url,
            manualVerified: p.manual_verified,
            createdAt: p.created_at,
        }))

        return NextResponse.json(formattedPieces)
    } catch (error) {
        console.error('[WARDROBE] Erro interno:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const { name, tipo, categoria, cor, colorSlug, colorRgb, imageBase64, manualVerified } = await request.json()

        if (!name || !tipo) {
            return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 })
        }

        // Check wardrobe limit
        const { count, error: countError } = await supabase
            .from('wardrobe_pieces')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        const { data: profile } = await supabase
            .from('profiles')
            .select('wardrobe_limit')
            .eq('id', user.id)
            .single()

        if (count >= (profile?.wardrobe_limit || 10)) {
            return NextResponse.json({ error: 'Limite do guarda-roupa atingido' }, { status: 403 })
        }

        // Upload image to Supabase Storage if provided
        let imageUrl = null
        if (imageBase64) {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
            const buffer = Buffer.from(base64Data, 'base64')
            const fileName = `${user.id}/${Date.now()}-${name.replace(/\s+/g, '_')}.jpg`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('wardrobe')
                .upload(fileName, buffer, {
                    contentType: 'image/jpeg',
                    upsert: false,
                })

            if (uploadError) {
                console.error('[WARDROBE] Erro no upload:', uploadError)
                // Continue without image — don't block the operation
            } else {
                const { data: urlData } = supabase.storage
                    .from('wardrobe')
                    .getPublicUrl(uploadData.path)
                imageUrl = urlData?.publicUrl
            }
        }

        // Insert piece metadata
        const { data: piece, error: insertError } = await supabase
            .from('wardrobe_pieces')
            .insert({
                user_id: user.id,
                name,
                tipo,
                categoria: categoria || '',
                cor: cor || 'Neutro',
                color_slug: colorSlug || '',
                color_rgb: colorRgb || null,
                image_url: imageUrl,
                manual_verified: manualVerified || false,
            })
            .select()
            .single()

        if (insertError) {
            console.error('[WARDROBE] Erro ao inserir peça:', insertError)
            return NextResponse.json({ error: 'Erro ao salvar peça' }, { status: 500 })
        }

        return NextResponse.json({
            id: piece.id,
            name: piece.name,
            tipo: piece.tipo,
            image: piece.image_url,
            cor: piece.cor,
            colorSlug: piece.color_slug,
            colorRgb: piece.color_rgb,
        })
    } catch (error) {
        console.error('[WARDROBE] Erro interno:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const pieceId = searchParams.get('id')

        if (!pieceId) {
            return NextResponse.json({ error: 'ID da peça é obrigatório' }, { status: 400 })
        }

        // Get piece to find image path for cleanup
        const { data: piece } = await supabase
            .from('wardrobe_pieces')
            .select('image_url')
            .eq('id', pieceId)
            .eq('user_id', user.id)
            .single()

        // Delete image from storage
        if (piece?.image_url) {
            const path = piece.image_url.split('/wardrobe/')[1]
            if (path) {
                await supabase.storage.from('wardrobe').remove([path])
            }
        }

        // Delete piece metadata
        const { error } = await supabase
            .from('wardrobe_pieces')
            .delete()
            .eq('id', pieceId)
            .eq('user_id', user.id)

        if (error) {
            console.error('[WARDROBE] Erro ao deletar:', error)
            return NextResponse.json({ error: 'Erro ao deletar peça' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[WARDROBE] Erro interno:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

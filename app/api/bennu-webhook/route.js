// =============================================
// PRONTÍSSIMA — Bennu Payment Webhook (v2)
// Now writes directly to Supabase database
// =============================================
import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

// Map Bennu product IDs to credit amounts
const PRODUCT_CREDITS = {
  'pack10': 10,
  'pack30': 30,
  'pack_10_looks': 10,
  'pack_30_looks': 30,
}

export async function POST(request) {
  try {
    const payload = await request.json()

    console.log('[BENNU] Webhook recebido:', JSON.stringify({
      status: payload.status,
      productId: payload.productId || payload.product_id,
      email: payload.email ? '***' : undefined,
    }))

    const status = payload.status?.toLowerCase()
    const productId = payload.productId || payload.product_id || ''
    const email = payload.email || payload.customer_email || ''
    const externalId = payload.transactionId || payload.transaction_id || payload.id || ''
    const amountCents = payload.amount || payload.value || 0

    // Determine credits from product
    const credits = PRODUCT_CREDITS[productId] || parseInt(productId) || 0

    if (status !== 'approved' && status !== 'paid' && status !== 'completed') {
      console.log('[BENNU] Status não aprovado:', status)

      // Still record the payment attempt
      const supabase = createAdminSupabase()
      if (supabase) {
        await supabase.from('payments').insert({
          external_id: externalId,
          product_id: productId,
          amount_cents: amountCents,
          credits_granted: 0,
          status: status || 'pending',
          raw_payload: payload,
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Pagamento registrado como pendente',
        credits: 0
      })
    }

    // Payment approved — apply credits
    const supabase = createAdminSupabase()

    if (!supabase) {
      // Fallback: return credits for frontend to apply
      console.log('[BENNU] Supabase não configurado — retornando créditos para frontend')
      return NextResponse.json({
        success: true,
        credits,
        mode: 'frontend',
        message: `${credits} créditos aprovados`,
      })
    }

    // Find user by email
    let userId = null
    if (email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, credits_packs')
        .eq('email', email)
        .single()

      if (profile) {
        userId = profile.id

        // Add credits to user
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits_packs: profile.credits_packs + credits })
          .eq('id', userId)

        if (updateError) {
          console.error('[BENNU] Erro ao atualizar créditos:', updateError)
        } else {
          console.log(`[BENNU] ✅ ${credits} créditos adicionados ao usuário ${email}`)
        }
      }
    }

    // Record payment
    await supabase.from('payments').insert({
      user_id: userId,
      external_id: externalId,
      product_id: productId,
      amount_cents: amountCents,
      credits_granted: credits,
      status: 'approved',
      raw_payload: payload,
    })

    return NextResponse.json({
      success: true,
      credits,
      mode: 'server',
      message: `${credits} créditos aplicados com sucesso`,
    })
  } catch (error) {
    console.error('[BENNU] Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno no webhook' },
      { status: 500 }
    )
  }
}

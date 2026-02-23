import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { userId, pack } = await request.json()

    // Log da requisição
    console.log("[v0] Processando créditos:", { userId, pack })

    // Validações básicas
    if (!userId || !pack) {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 })
    }

    // Determinar quantidade de créditos baseado no pack
    const credits = pack === "10" ? 10 : pack === "30" ? 30 : 0

    if (credits === 0) {
      return NextResponse.json({ success: false, error: "Pack inválido" }, { status: 400 })
    }

    // Em produção, aqui você salvaria no banco de dados
    // Por enquanto, retorna sucesso para o frontend processar via localStorage

    return NextResponse.json({
      success: true,
      credits: credits,
      message: `${credits} créditos processados com sucesso`,
    })
  } catch (error) {
    console.error("[v0] Erro ao processar créditos:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

import { styleEngine } from "@/lib/style-engine"

export async function POST(request) {
  try {
    const { analyzedPieces, mood, occasion, bodyInfo } = await request.json()

    const superiores = analyzedPieces.filter((p) => p.tipo === "SUPERIOR")
    const inferiores = analyzedPieces.filter((p) => p.tipo === "INFERIOR")
    const vestidos = analyzedPieces.filter((p) => p.tipo === "VESTIDO")

    console.log(`[VEST] Inventario: ${superiores.length} SUPERIOR, ${inferiores.length} INFERIOR, ${vestidos.length} VESTIDO`)
    console.log(`[VEST] Ocasiao: ${occasion}, Mood: ${mood}`)

    // Extrair perfil de cores do usuário (se disponível)
    const userProfile = bodyInfo ? {
      recommended_colors: bodyInfo.recommended_colors || [],
      avoid_colors: bodyInfo.avoid_colors || [],
      skin_tone: bodyInfo.skin_tone || null,
    } : null

    if (userProfile) {
      console.log(`[VEST] Perfil: pele=${userProfile.skin_tone}, cores_recomendadas=${userProfile.recommended_colors?.join(', ')}`)
    }

    // Gerar looks com style-engine inteligente (agora com harmonia de cor + perfil)
    const result = styleEngine.generate(analyzedPieces, mood, occasion, userProfile)

    // LOG dos looks gerados
    if (result.lookA) {
      const pecasA = result.lookA.pieces.map(p => p.name).join(" + ")
      console.log(`[VEST] Look A: ${result.lookA.tipo} - ${pecasA} (harmonia: ${result.lookA.harmonyScore})`)
    }
    if (result.lookB) {
      const pecasB = result.lookB.pieces.map(p => p.name).join(" + ")
      console.log(`[VEST] Look B: ${result.lookB.tipo} - ${pecasB} (harmonia: ${result.lookB.harmonyScore})`)
    }

    return Response.json(result)
  } catch (error) {
    console.error("[VEST] Erro:", error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

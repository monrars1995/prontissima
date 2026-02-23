import { styleEngine } from "@/lib/style-engine"

export async function POST(request) {
  try {
    const { analyzedPieces, mood, occasion } = await request.json()

    const superiores = analyzedPieces.filter((p) => p.tipo === "SUPERIOR")
    const inferiores = analyzedPieces.filter((p) => p.tipo === "INFERIOR")
    const vestidos = analyzedPieces.filter((p) => p.tipo === "VESTIDO")
    
    console.log(`[VEST] Inventario: ${superiores.length} SUPERIOR, ${inferiores.length} INFERIOR, ${vestidos.length} VESTIDO`)
    console.log(`[VEST] Ocasiao: ${occasion}, Mood: ${mood}`)

    // Gerar looks com style-engine SNIPER
    const result = styleEngine.generate(analyzedPieces, mood, occasion)
    
    // LOG dos looks gerados
    if (result.lookA) {
      const tipoA = result.lookA.tipo
      const pecasA = result.lookA.pieces.map(p => p.name).join(" + ")
      console.log(`[VEST] Look A: ${tipoA} - ${pecasA}`)
    }
    if (result.lookB) {
      const tipoB = result.lookB.tipo
      const pecasB = result.lookB.pieces.map(p => p.name).join(" + ")
      console.log(`[VEST] Look B: ${tipoB} - ${pecasB}`)
    }

    return Response.json(result)
  } catch (error) {
    console.error("[VEST] Erro:", error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// API de analise de peças — usa análise local + normalização de cores
import { normalizeColor } from "@/lib/color-engine"

// Função detectType com regex — ordem de prioridade: VESTIDO -> INFERIOR -> SUPERIOR
const detectType = (name = "", category = "") => {
  const text = (name + " " + category).toLowerCase()

  if (/vestido|macacao|body|macaquinho|terno|costume/.test(text)) {
    return { tipo: "VESTIDO", categoria: "vestido" }
  }
  if (/calca|saia|shorts|bermuda|jeans|legging|pantalona/.test(text)) {
    return { tipo: "INFERIOR", categoria: text.includes("saia") ? "saia" : "calca" }
  }
  if (/blusa|camisa|t-shirt|top|cropped|jaqueta|blazer|trico|regata|moletom|colete|cardigan/.test(text)) {
    return { tipo: "SUPERIOR", categoria: text.includes("jaqueta") || text.includes("blazer") ? "jaqueta" : "blusa" }
  }
  if (/sapato|tenis|sandalia|bota|sapatilha|scarpin/.test(text)) {
    return { tipo: "SAPATO", categoria: "sapato" }
  }

  return { tipo: "SUPERIOR", categoria: "blusa" }
}

export async function POST(request) {
  try {
    const { pieces } = await request.json()

    // RESPEITAR tipo que vem da peça — usuário já classificou nas pastas
    const analyzedPieces = pieces.map((piece) => {
      const corRaw = piece.cor || piece.color || "cinza"
      // NORMALIZAR cor para slug canônico (ex: "Navy" -> "azul-marinho")
      const corNormalizada = normalizeColor(corRaw)

      return {
        name: piece.name,
        image: piece.image,
        tipo: piece.tipo || "SUPERIOR",
        categoria: piece.categoria || "blusa",
        cor: corRaw,
        corNormalizada,
        colorSlug: piece.colorSlug || corNormalizada,
        colorRgb: piece.colorRgb || null,
        corSecundaria: null,
        estilo: "casual",
        tecido: "algodao",
        estacao: "meia-estacao",
        manualVerified: piece.manualVerified === true,
      }
    })

    // Log final
    const finalTypes = analyzedPieces.reduce((acc, p) => {
      acc[p.tipo] = (acc[p.tipo] || 0) + 1
      return acc
    }, {})

    const colorDistribution = analyzedPieces.reduce((acc, p) => {
      acc[p.corNormalizada] = (acc[p.corNormalizada] || 0) + 1
      return acc
    }, {})

    console.log("[v0] Tipos:", finalTypes)
    console.log("[v0] Cores normalizadas:", colorDistribution)

    return Response.json({ pieces: analyzedPieces })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

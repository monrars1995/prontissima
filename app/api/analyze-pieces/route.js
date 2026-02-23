// API de analise de pecas - usa apenas analise local (sem OpenAI)
// As cores sao detectadas no cliente pelo color-analyzer.js (Sniper version)

// Funcao detectType com regex - ordem de prioridade: VESTIDO -> INFERIOR -> SUPERIOR
const detectType = (name = "", category = "") => {
  const text = (name + " " + category).toLowerCase()
  
  // 1. Peca Unica (Vestidos/Macacoes)
  if (/vestido|macacao|body|macaquinho|terno|costume/.test(text)) {
    return { tipo: "VESTIDO", categoria: "vestido" }
  }
  
  // 2. Inferior (Calcas/Saias/Shorts)
  if (/calca|saia|shorts|bermuda|jeans|legging|pantalona/.test(text)) {
    return { tipo: "INFERIOR", categoria: text.includes("saia") ? "saia" : "calca" }
  }
  
  // 3. Superior (Blusas/Camisas/Jaquetas)
  if (/blusa|camisa|t-shirt|top|cropped|jaqueta|blazer|trico|regata|moletom|colete|cardigan/.test(text)) {
    return { tipo: "SUPERIOR", categoria: text.includes("jaqueta") || text.includes("blazer") ? "jaqueta" : "blusa" }
  }
  
  // 4. Sapatos
  if (/sapato|tenis|sandalia|bota|sapatilha|scarpin/.test(text)) {
    return { tipo: "SAPATO", categoria: "sapato" }
  }
  
  // Fallback: SUPERIOR (mais comum)
  return { tipo: "SUPERIOR", categoria: "blusa" }
}

export async function POST(request) {
  try {
    const { pieces } = await request.json()

    // VERIFICAR se tipos estao desbalanceados
    const existingTypes = pieces.reduce((acc, p) => {
      if (p.tipo) acc[p.tipo] = (acc[p.tipo] || 0) + 1
      return acc
    }, {})
    
    const hasInferior = (existingTypes.INFERIOR || 0) > 0
    const hasVestido = (existingTypes.VESTIDO || 0) > 0
    const isUnbalanced = !hasInferior && !hasVestido && pieces.length > 3

    // RESPEITAR tipo que vem da peca - usuario ja classificou nas pastas
    const analyzedPieces = pieces.map((piece) => {
      const cor = piece.cor || piece.color || "cinza"
      
      // SEMPRE respeitar o tipo que vem da peca - foi classificado pelo usuario nas pastas
      return {
        name: piece.name,
        image: piece.image,
        tipo: piece.tipo || "SUPERIOR",
        categoria: piece.categoria || "blusa",
        cor,
        colorSlug: piece.colorSlug || "",
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
    console.log("[v0] Distribuicao ciclica aplicada:", finalTypes)

    return Response.json({ pieces: analyzedPieces })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

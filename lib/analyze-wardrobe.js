// ===========================================================
// VEST.AI — ANALISADOR PROFISSIONAL DE GUARDA-ROUPA (FINAL)
// Inclui: paleta de pele, cabelo, score real, lista de compras.
// ===========================================================

const SKIN_PALETTES = {
  clara: ["Preto", "Azul Marinho", "Jeans", "Vermelho", "Rosa Quartzo", "Cinza Chumbo"],
  media: ["Azul Marinho", "Verde Militar", "Bege", "Marrom", "Vermelho Escuro"],
  escura: ["Branco", "Off-White", "Bege", "Jeans", "Verde Militar", "Mostarda"]
}

const HAIR_GUIDE = {
  loiro: ["Preto", "Azul Marinho", "Verde Militar", "Vermelho"],
  castanho: ["Off-White", "Bege", "Marrom", "Azul Jeans"],
  ruivo: ["Verde Militar", "Preto", "Branco", "Jeans"],
  preto: ["Branco", "Off-White", "Verde Militar", "Rosa Quartzo"]
}

export function analyzeWardrobe(pieces, profile) {
  // profile: { skinTone: 'clara'|'media'|'escura', hair: 'loiro'|'castanho'|'ruivo'|'preto' }

  const total = pieces.length

  // -------------------------------
  // 1) CONTAGEM POR CATEGORIA
  // -------------------------------
  const tops = pieces.filter(p => p.tipo === "SUPERIOR")
  const bottoms = pieces.filter(p => p.tipo === "INFERIOR")
  const dresses = pieces.filter(p => p.tipo === "VESTIDO")

  const hasBalance = tops.length >= 2 && bottoms.length >= 2

  // -------------------------------
  // 1.1) ANALISE ESTRUTURAL
  // -------------------------------
  const ideal = {
    SUPERIOR: 5,
    INFERIOR: 5,
    VESTIDO: 2
  }

  const estruturaMsgs = []

  // Verifica falta
  if (tops.length < ideal.SUPERIOR) {
    estruturaMsgs.push(`Faltam ${ideal.SUPERIOR - tops.length} blusas para equilibrar o armario.`)
  }
  if (bottoms.length < ideal.INFERIOR) {
    estruturaMsgs.push(`Faltam ${ideal.INFERIOR - bottoms.length} calcas/saias para formar mais combinacoes.`)
  }
  if (dresses.length < ideal.VESTIDO) {
    estruturaMsgs.push(`Adicione mais ${ideal.VESTIDO - dresses.length} vestido(s) para multiplicar looks elegantes.`)
  }

  // Verifica excesso
  if (tops.length > bottoms.length * 2) {
    estruturaMsgs.push("Voce tem muitas blusas e poucas partes de baixo — isso limita drasticamente seus looks.")
  }
  if (bottoms.length > tops.length * 2) {
    estruturaMsgs.push("Voce tem poucas blusas para o numero de calcas/saias — isso trava combinacoes.")
  }

  // Se nao encontrou nenhum problema
  if (estruturaMsgs.length === 0) {
    estruturaMsgs.push("Sua estrutura esta equilibrada — otimo ponto de partida!")
  }

  // -------------------------------
  // 2) PALETA — EXCESSOS E FALTAS
  // -------------------------------
  const colorCount = {}
  pieces.forEach(p => {
    // Detecta cor real independente de como o VO salvou
    const col =
      p.color?.trim() ||
      p.cor?.trim() ||
      p.colorName?.trim() ||
      null

    if (!col) return // Ignora pecas sem cor valida

    colorCount[col] = (colorCount[col] || 0) + 1
  })

  const overUsed = Object.entries(colorCount)
    .filter(([color, qty]) => qty >= 3)
    .map(([color]) => color)

  // -------------------------------
  // 3) PALETA *IDEAL* PARA A USUARIA
  // -------------------------------

  const idealSkin = SKIN_PALETTES[profile.skinTone] || []
  const idealHair = HAIR_GUIDE[profile.hair] || []

  const winningPalette = [...new Set([...idealSkin, ...idealHair])]

  // -------------------------------
  // 4) PECAS QUE TRAVAM LOOKS
  // -------------------------------
  const blocking = []
  for (const c of overUsed) {
    if (!winningPalette.includes(c)) blocking.push(c)
  }

  // -------------------------------
  // 5) SCORE PROFISSIONAL
  // -------------------------------
  let score = 100
  if (!hasBalance) score -= 25
  score -= overUsed.length * 5
  if (dresses.length === 0) score -= 5

  // -------------------------------
  // 6) POTENCIAL DE LOOKS
  // -------------------------------
  const currentLooks =
    Math.min(tops.length, bottoms.length) +
    dresses.length

  const potentialLooks = currentLooks + (blocking.length === 0 ? 4 : 2)

  // -------------------------------
  // 7) LISTA DE COMPRAS REAL
  // -------------------------------
  const suggestions = []

  if (bottoms.length < 2) suggestions.push("1 calca neutra (preto ou marinho)")
  if (tops.length < 2) suggestions.push("1 blusa lisa cor chave da sua paleta")
  if (dresses.length === 0) suggestions.push("1 vestido versatil (preto ou vinho)")

  if (blocking.length > 0)
    suggestions.push("Adicionar 1 peca em tom ideal da sua paleta para equilibrar o contraste")

  // -------------------------------
  // 8) TEXTO PROFISSIONAL FINAL
  // -------------------------------

  return {
    score,
    overUsed,
    blocking,
    currentLooks,
    potentialLooks,
    winningPalette,
    suggestions,
    estruturaMsgs,
    profileNotes: {
      skin: `Sua pele fica melhor com: ${idealSkin.join(", ")}`,
      hair: `Seu tom de cabelo valoriza: ${idealHair.join(", ")}`
    },
    summary: buildText({
      score,
      overUsed,
      blocking,
      currentLooks,
      potentialLooks,
      winningPalette,
      suggestions,
      estruturaMsgs
    })
  }
}


// ------------------------------------------------
//  TEXTO DE ALTO NIVEL - NAO IA — SOMENTE LOGICA
// ------------------------------------------------

function buildText(data) {
  let txt = `Seu Score de Estilo: ${data.score}/100\n\n`

  if (data.estruturaMsgs && data.estruturaMsgs.length > 0) {
    txt += `Estrutura do Guarda-Roupa:\n`
    data.estruturaMsgs.forEach(m => txt += `- ${m}\n`)
    txt += "\n"
  }

  if (data.overUsed.length > 0) {
    txt += `Problemas reais da sua paleta:\n`
    data.overUsed.forEach(c =>
      txt += `- Voce tem excesso de pecas em ${c} — isso trava novas combinacoes.\n`
    )
    txt += "\n"
  }

  if (data.blocking.length > 0) {
    txt += `Cores que estao prejudicando seus looks:\n`
    data.blocking.forEach(c =>
      txt += `- ${c} nao favorece sua paleta pessoal — substitua gradualmente.\n`
    )
    txt += "\n"
  }

  txt += `Potencial real dos seus looks:\n`
  txt += `- Hoje: ${data.currentLooks} looks possiveis\n`
  txt += `- Com pequenos ajustes: ${data.potentialLooks} looks\n\n`

  txt += "Lista profissional de compras (30 dias):\n"
  data.suggestions.forEach(s => txt += `- ${s}\n`)

  txt += "\nMelhorias imediatas conforme sua coloracao pessoal:\n"
  txt += `- Suas melhores cores: ${data.winningPalette.join(", ")}\n`

  return txt
}

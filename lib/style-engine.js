// =============================================
// PRONTÍSSIMA — MOTOR DE COMPOSIÇÃO INTELIGENTE
// Usa color-engine para harmonia real
// =============================================

import { getStylingParaLook } from './etiqueta-engine'
import { normalizeColor, isColorAllowed, getHarmonyScore, findBestColorMatch } from './color-engine'

// FILTRO DE ETIQUETA: peças proibidas por ocasião
const PECAS_PROIBIDAS = {
  Trabalho: ['cropped', 'crop', 'barriga', 'decote', 'transparente', 'curto', 'mini'],
  Reuniao: ['cropped', 'crop', 'barriga', 'decote', 'transparente', 'curto', 'mini'],
  Elegante: ['cropped', 'crop', 'barriga', 'transparente'],
  Formal: ['cropped', 'crop', 'barriga', 'decote', 'transparente', 'curto', 'mini', 'jeans'],
}

function filtrarPorEtiqueta(pecas, occasion) {
  const proibidas = PECAS_PROIBIDAS[occasion] || []
  if (proibidas.length === 0) return pecas

  return pecas.filter(p => {
    const texto = `${p.name || p.nome || ''} ${p.categoria || ''} ${p.descricao || ''}`.toLowerCase()
    return !proibidas.some(termo => texto.includes(termo))
  })
}

// ROTAÇÃO POR OCASIÃO
const ROTACAO_OCASIAO = {
  'Trabalho': 0, 'Reuniao': 1, 'Casual': 2, 'Encontro': 3,
  'Jantar': 4, 'Festa': 5, 'Social': 6, 'Lazer': 7, 'Viagem': 0, 'Dia a dia': 1,
}

function getRotationOffset(occasion, totalPecas) {
  let looksCreated = 0
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const user = JSON.parse(localStorage.getItem('prontissima_user') || '{}')
      looksCreated = user.looksCreated || 0
    } catch (e) { }
  }
  const baseOffset = ROTACAO_OCASIAO[occasion] || 0
  return (baseOffset + looksCreated) % Math.max(totalPecas, 1)
}

// ── Score de afinidade peça ↔ perfil do usuário ──
function getUserColorScore(peca, userProfile) {
  if (!userProfile) return 0
  const corNorm = normalizeColor(peca.cor)

  // Boost se a cor está nas recomendadas
  if (userProfile.recommended_colors?.some(c => normalizeColor(c) === corNorm)) return 15
  // Penalidade se a cor deve ser evitada
  if (userProfile.avoid_colors?.some(c => normalizeColor(c) === corNorm)) return -20

  return 0
}

// ── Ranquear pares top×bottom por harmonia + perfil ──
function rankPairs(tops, bottoms, userProfile) {
  const pairs = []

  for (const top of tops) {
    for (const bottom of bottoms) {
      const harmony = getHarmonyScore(top.cor, bottom.cor)
      const userBoost = getUserColorScore(top, userProfile) + getUserColorScore(bottom, userProfile)
      pairs.push({
        top,
        bottom,
        score: harmony + userBoost,
        harmonyScore: harmony,
      })
    }
  }

  // Ordena por score descrescente
  pairs.sort((a, b) => b.score - a.score)
  return pairs
}

// ── Justificativa contextual ──
function gerarJustificativa(top, bottom, harmonyScore, mood, occasion, regra) {
  const corTop = top?.cor || 'neutra'
  const corBottom = bottom?.cor || 'neutra'

  const efeitos = {
    100: 'cria um visual monocromático sofisticado',
    90: 'garante equilíbrio com neutros elegantes',
    80: 'forma uma combinação cromática harmoniosa',
    50: 'traz um contraste criativo e ousado',
  }

  const effectKey = harmonyScore >= 90 ? 100 : harmonyScore >= 80 ? 90 : harmonyScore >= 70 ? 80 : 50
  const efeito = efeitos[effectKey]

  if (top && bottom) {
    return `${corTop} com ${corBottom} ${efeito}. ${regra}.`
  }
  return `Peça única de impacto. ${regra}.`
}

export const styleEngine = {
  generate(wardrobe, mood, occasion, userProfile = null) {
    const wardrobeFiltrado = filtrarPorEtiqueta(wardrobe, occasion)

    const tops = wardrobeFiltrado.filter(p => p.tipo === 'SUPERIOR')
    const saias = wardrobeFiltrado.filter(p => p.tipo === 'SAIA')
    const calcas = wardrobeFiltrado.filter(p => p.tipo === 'CALCA' || p.tipo === 'INFERIOR')
    const vestidos = wardrobeFiltrado.filter(p => p.tipo === 'VESTIDO')

    if (wardrobe.length === 0) {
      throw new Error("EMPTY_WARDROBE")
    }

    const topsFinais = tops.length > 0 ? tops : wardrobe.filter(p => p.tipo === 'SUPERIOR')
    const calcasFinais = calcas.length > 0 ? calcas : wardrobe.filter(p => p.tipo === 'CALCA' || p.tipo === 'INFERIOR')

    const totalPecas = Math.max(topsFinais.length, calcasFinais.length, 1)
    const offset = getRotationOffset(occasion, totalPecas)

    // LOOK A: Melhor combinação de cor via ranking
    const lookA = this.montarConjuntoInteligente(topsFinais, saias, calcasFinais, mood, occasion, offset, userProfile)

    // LOOK B: Alternância inteligente (vestido se elegante, senão segunda melhor combinação)
    const lookB = this.definirLookB(topsFinais, saias, calcasFinais, vestidos, mood, occasion, offset, userProfile, lookA)

    return { lookA, lookB, mood, occasion }
  },

  montarConjuntoInteligente(tops, saias, calcas, mood, occasion, offset = 0, userProfile = null) {
    // Prioriza SAIA se mood for Sexy ou ocasião for Encontro
    const inferiores = (saias.length > 0 && (mood === 'Sexy' || occasion === 'Encontro'))
      ? saias
      : (calcas.length > 0 ? calcas : saias)

    if (!inferiores || inferiores.length === 0) return null
    if (!tops || tops.length === 0) return null

    // Ranquear TODOS os pares por harmonia de cor + perfil do usuário
    const rankedPairs = rankPairs(tops, inferiores, userProfile)

    if (rankedPairs.length === 0) return null

    // Pegar o melhor par com rotação (offset dentro dos top 3)
    const topN = Math.min(3, rankedPairs.length)
    const selectedIdx = offset % topN
    const best = rankedPairs[selectedIdx]

    return this.formatar(best.top, best.bottom, mood, occasion, 'A', best.harmonyScore)
  },

  definirLookB(tops, saias, calcas, vestidos, mood, occasion, offsetA = 0, userProfile = null, lookA = null) {
    const ocasioesElegantes = ['Jantar', 'Encontro', 'Festa', 'Social']
    const ehOcasiaoElegante = ocasioesElegantes.includes(occasion)
    const moodsElegantes = ['Sexy', 'Elegante', 'Romantica', 'Sofisticada', 'Feminina']
    const ehMoodElegante = moodsElegantes.includes(mood)

    const offsetB = (offsetA + 2) % Math.max(tops.length, calcas.length, 1)

    if (ehOcasiaoElegante && ehMoodElegante) {
      if (vestidos.length > 0) {
        // Score vestido vs perfil do usuário
        const vestidosScored = vestidos.map(v => ({
          vestido: v,
          score: getUserColorScore(v, userProfile),
        })).sort((a, b) => b.score - a.score)

        const vestidoIdx = offsetB % vestidosScored.length
        return this.formatar(null, vestidosScored[vestidoIdx].vestido, mood, occasion, 'B', 90)
      }
      if (saias.length > 0) {
        const saiaIdx = offsetB % saias.length
        const saia = saias[saiaIdx]
        const topIdx = (offsetB + 1) % tops.length
        const top = tops[topIdx] || tops[0]
        if (top) {
          const harmony = getHarmonyScore(top.cor, saia.cor)
          return this.formatar(top, saia, mood, occasion, 'B', harmony)
        }
      }
    }

    return this.montarConjuntoB(tops, saias, calcas, mood, occasion, offsetB, userProfile, lookA)
  },

  montarConjuntoB(tops, saias, calcas, mood, occasion, offset = 1, userProfile = null, lookA = null) {
    const inferiores = calcas.length > 0 ? calcas : saias
    if (!inferiores || inferiores.length === 0) return null
    if (!tops || tops.length === 0) return null

    // Ranquear e pegar SEGUNDA melhor combinação (evitando peças do Look A)
    const rankedPairs = rankPairs(tops, inferiores, userProfile)

    // Filtrar pares que usam peças do Look A
    const lookAPieceIds = lookA?.pieces?.map(p => p.name) || []
    const filteredPairs = rankedPairs.filter(pair =>
      !lookAPieceIds.includes(pair.top.name) || !lookAPieceIds.includes(pair.bottom.name)
    )

    const candidates = filteredPairs.length > 0 ? filteredPairs : rankedPairs
    if (candidates.length === 0) return null

    const topN = Math.min(3, candidates.length)
    const selectedIdx = offset % topN
    const best = candidates[selectedIdx]

    return this.formatar(best.top, best.bottom, mood, occasion, 'B', best.harmonyScore)
  },

  formatar(top, inferior, mood, occasion, lookVariant = 'A', harmonyScore = 50) {
    if (!inferior) return null

    const styling = getStylingParaLook(mood, occasion, lookVariant)

    const pieces = top ? [top, inferior] : [inferior]
    const tipo = top ? "COMBO" : "SINGLE"
    const composition = top
      ? `${top.nome || top.name} + ${inferior.nome || inferior.name}`
      : (inferior.nome || inferior.name)

    return {
      lookId: tipo === "COMBO" ? "COMBO" : "VESTIDO",
      title: `${mood} para ${occasion}`,
      composition,
      pieces,
      tipo,
      harmonyScore,
      styling: {
        sapato: styling.sapato,
        bolsa: styling.bolsa,
        acessorios: styling.acessorios,
        cabelo: styling.cabelo,
        maquiagem: styling.make,
      },
      porqueFunciona: gerarJustificativa(top, inferior, harmonyScore, mood, occasion, styling.regra),
      vibe: mood
    }
  }
}

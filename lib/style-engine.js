// =============================================
// VEST.AI - MOTOR DE COMPOSICAO DE ALTA PERFORMANCE
// =============================================

import { getStylingParaLook } from './etiqueta-engine'

// HARMONIAS DE COR - cores que combinam entre si
const HARMONIAS_COR = {
  'Preto': ['Branco', 'Vermelho', 'Rosa', 'Bege', 'Dourado', 'Coral', 'Neutro'],
  'Branco': ['Preto', 'Azul', 'Marinho', 'Rosa', 'Vermelho', 'Marrom', 'Neutro'],
  'Vermelho': ['Preto', 'Branco', 'Cinza', 'Bege', 'Neutro'],
  'Rosa Quartzo': ['Branco', 'Cinza', 'Bege', 'Marinho', 'Neutro', 'Preto'],
  'Coral': ['Branco', 'Bege', 'Marinho', 'Neutro', 'Cinza'],
  'Laranja': ['Branco', 'Bege', 'Marinho', 'Neutro', 'Marrom'],
  'Marinho': ['Branco', 'Bege', 'Rosa', 'Coral', 'Cinza', 'Neutro'],
  'Cinza': ['Branco', 'Preto', 'Rosa', 'Vermelho', 'Marinho', 'Neutro'],
  'Cinza Mescla': ['Branco', 'Preto', 'Rosa', 'Marinho', 'Neutro', 'Bege'],
  'Bege': ['Branco', 'Marrom', 'Marinho', 'Preto', 'Coral', 'Neutro'],
  'Neutro': ['Preto', 'Branco', 'Marinho', 'Rosa', 'Vermelho', 'Coral', 'Laranja'],
}

// Verifica se duas cores combinam
function coresCombina(cor1, cor2) {
  if (!cor1 || !cor2) return true // Se nao tem cor definida, aceita
  if (cor1 === cor2) return false // Mesma cor = nao combina (evita monotonia)

  const harmonias = HARMONIAS_COR[cor1] || []
  return harmonias.includes(cor2) || harmonias.includes('Neutro')
}

// Encontra a melhor peca que combina com a cor dada
function encontrarPecaCombinante(pecas, corReferencia, offset = 0) {
  // Primeiro tenta encontrar peca que combina cromaticamente
  for (let i = 0; i < pecas.length; i++) {
    const idx = (offset + i) % pecas.length
    const peca = pecas[idx]
    if (coresCombina(corReferencia, peca.cor)) {
      return peca
    }
  }
  // Fallback: retorna peca no offset
  return pecas[offset % pecas.length] || pecas[0]
}

// FILTRO DE ETIQUETA: pecas proibidas por ocasiao
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
    const nome = (p.name || p.nome || '').toLowerCase()
    const categoria = (p.categoria || '').toLowerCase()
    const descricao = (p.descricao || '').toLowerCase()
    const texto = `${nome} ${categoria} ${descricao}`

    // Se a peca contem termo proibido, remove
    return !proibidas.some(termo => texto.includes(termo))
  })
}

// ROTACAO POR OCASIAO - base inicial por ocasiao
const ROTACAO_OCASIAO = {
  'Trabalho': 0,
  'Reuniao': 1,
  'Casual': 2,
  'Encontro': 3,
  'Jantar': 4,
  'Festa': 5,
  'Social': 6,
  'Lazer': 7,
  'Viagem': 0,
  'Dia a dia': 1,
}

// Funcao para obter offset dinamico baseado no historico de uso
function getRotationOffset(occasion, totalPecas) {
  // Busca contador de looks criados do localStorage (se disponivel)
  let looksCreated = 0
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const user = JSON.parse(localStorage.getItem('prontissima_user') || '{}')
      looksCreated = user.looksCreated || 0
    } catch (e) { }
  }

  // Offset base da ocasiao + rotacao baseada em quantos looks ja foram criados
  const baseOffset = ROTACAO_OCASIAO[occasion] || 0
  const dynamicOffset = (baseOffset + looksCreated) % Math.max(totalPecas, 1)

  return dynamicOffset
}

export const styleEngine = {
  generate(wardrobe, mood, occasion) {
    // Filtra pecas inapropriadas para a ocasiao ANTES de selecionar
    const wardrobeFiltrado = filtrarPorEtiqueta(wardrobe, occasion)

    const tops = wardrobeFiltrado.filter(p => p.tipo === 'SUPERIOR')
    const saias = wardrobeFiltrado.filter(p => p.tipo === 'SAIA')
    const calcas = wardrobeFiltrado.filter(p => p.tipo === 'CALCA' || p.tipo === 'INFERIOR')
    const vestidos = wardrobeFiltrado.filter(p => p.tipo === 'VESTIDO')

    if (wardrobe.length === 0) {
      throw new Error("EMPTY_WARDROBE")
    }

    // Se filtro removeu todas as pecas de uma categoria, usa original como fallback
    const topsFinais = tops.length > 0 ? tops : wardrobe.filter(p => p.tipo === 'SUPERIOR')
    const calcasFinais = calcas.length > 0 ? calcas : wardrobe.filter(p => p.tipo === 'CALCA' || p.tipo === 'INFERIOR')

    // ROTACAO DINAMICA: baseada na ocasiao + quantidade de looks ja criados
    // Isso garante que a cada novo look, pecas diferentes sejam usadas
    const totalPecas = Math.max(topsFinais.length, calcasFinais.length, 1)
    const offset = getRotationOffset(occasion, totalPecas)

    // LOOK A: Usa offset dinamico para SEMPRE diversificar pecas
    const lookA = this.montarConjunto(topsFinais, saias, calcasFinais, mood, occasion, offset)

    // LOOK B: Alternancia Inteligente (So mostra vestido se for Jantar/Encontro)
    const lookB = this.definirLookB(topsFinais, saias, calcasFinais, vestidos, mood, occasion, offset)

    return { lookA, lookB, mood, occasion }
  },

  montarConjunto(tops, saias, calcas, mood, occasion, offset = 0) {
    // Prioriza SAIA se o mood for Sexy ou Encontro
    let inferior = null
    if (saias.length > 0 && (mood === 'Sexy' || occasion === 'Encontro')) {
      inferior = saias[offset % saias.length] || saias[0]
    } else {
      inferior = calcas[offset % Math.max(calcas.length, 1)] || saias[0]
    }

    if (!inferior) return null

    // USA HARMONIA DE COR: busca top que combina cromaticamente com o inferior
    const superior = encontrarPecaCombinante(tops, inferior.cor, offset)

    if (!superior) return null

    return this.formatar(superior, inferior, mood, occasion, 'A')
  },

  definirLookB(tops, saias, calcas, vestidos, mood, occasion, offsetA = 0) {
    // Ocasioes elegantes que aceitam vestido OU saia nobre
    const ocasioesElegantes = ['Jantar', 'Encontro', 'Festa', 'Social']
    const ehOcasiaoElegante = ocasioesElegantes.includes(occasion)

    // Moods que pedem visual mais feminino
    const moodsElegantes = ['Sexy', 'Elegante', 'Romantica', 'Sofisticada', 'Feminina']
    const ehMoodElegante = moodsElegantes.includes(mood)

    // Offset do Look B: sempre diferente do Look A (+2 para maior variacao)
    const offsetB = (offsetA + 2) % Math.max(tops.length, calcas.length, 1)

    // Se ocasiao E mood sao elegantes:
    // 1. Prioriza VESTIDO se tiver (usa offset para variar qual vestido)
    // 2. Se nao tiver vestido, usa SAIA (tecido nobre)
    if (ehOcasiaoElegante && ehMoodElegante) {
      if (vestidos.length > 0) {
        const vestidoIdx = offsetB % vestidos.length
        return this.formatar(null, vestidos[vestidoIdx], mood, occasion, 'B')
      }
      // Fallback: Saia com top diferente
      if (saias.length > 0) {
        const saiaIdx = offsetB % saias.length
        const saia = saias[saiaIdx]
        const topIdx = (offsetB + 1) % tops.length
        const top = tops[topIdx] || tops[0]
        if (top) {
          return this.formatar(top, saia, mood, occasion, 'B')
        }
      }
    }

    // Para ocasioes nao-elegantes, Look B e variacao de conjunto com pecas diferentes
    return this.montarConjuntoB(tops, saias, calcas, mood, occasion, offsetB)
  },

  montarConjuntoB(tops, saias, calcas, mood, occasion, offset = 1) {
    // Look B: usa offset para pegar pecas DIFERENTES do Look A
    const inferiorIdx = offset % Math.max(calcas.length, saias.length, 1)
    let inferior = calcas[inferiorIdx] || saias[inferiorIdx] || calcas[0] || saias[0]
    if (!inferior) return null

    // USA HARMONIA DE COR: busca top que combina com o inferior
    const superior = encontrarPecaCombinante(tops, inferior.cor, offset + 1)
    if (!superior) return null

    return this.formatar(superior, inferior, mood, occasion, 'B')
  },

  formatar(top, inferior, mood, occasion, lookVariant = 'A') {
    if (!inferior) return null

    // Busca styling da etiqueta-engine com variacao A ou B
    const styling = getStylingParaLook(mood, occasion, lookVariant)

    const pieces = top ? [top, inferior] : [inferior]
    const tipo = top ? "COMBO" : "SINGLE"
    const composition = top ? `${top.nome || top.name} + ${inferior.nome || inferior.name}` : (inferior.nome || inferior.name)

    return {
      lookId: tipo === "COMBO" ? "COMBO" : "VESTIDO",
      title: `${mood} para ${occasion}`,
      composition,
      pieces,
      tipo,
      styling: {
        sapato: styling.sapato,
        bolsa: styling.bolsa,
        acessorios: styling.acessorios,
        cabelo: styling.cabelo,
        maquiagem: styling.make,
      },
      porqueFunciona: tipo === "COMBO"
        ? `Equilibrio de proporcao. ${styling.regra}.`
        : `Peca unica de impacto. ${styling.regra}.`,
      vibe: mood
    }
  }
}

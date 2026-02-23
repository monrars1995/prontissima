/* =========================================================
   VEST.AI COLOR ENGINE - FINAL PRODUCTION VERSION
   - Deterministic
   - No AI
   - No Vision
   - Low cost
   - Error-proof
========================================================= */

/* ---------- PALETTE (12 cores oficiais) ---------- */
const PALETTE = [
  { name: 'Branco', r: 255, g: 255, b: 255 },
  { name: 'Off-White', r: 245, g: 245, b: 240 },
  { name: 'Preto', r: 0, g: 0, b: 0 },
  { name: 'Cinza Mescla', r: 150, g: 150, b: 150 },
  { name: 'Cinza Chumbo', r: 50, g: 50, b: 50 },
  { name: 'Bege', r: 210, g: 180, b: 140 },
  { name: 'Marrom', r: 101, g: 67, b: 33 },
  { name: 'Azul Marinho', r: 0, g: 0, b: 128 },
  { name: 'Azul Jeans', r: 95, g: 129, b: 174 },
  { name: 'Vermelho', r: 180, g: 0, b: 0 },
  { name: 'Verde Militar', r: 75, g: 83, b: 32 },
  { name: 'Rosa Quartzo', r: 247, g: 202, b: 201 },
  { name: 'Coral', r: 255, g: 127, b: 80 },
  { name: 'Laranja', r: 255, g: 165, b: 0 },
]

/* ---------- NEUTROS (supremacia estetica) ---------- */
const NEUTROS = [
  'Branco',
  'Off-White',
  'Preto',
  'Cinza Mescla',
  'Cinza Chumbo',
  'Bege',
  'Marrom'
]

/* ---------- TABELA DE HARMONIA (deterministica) ---------- */
const COLOR_HARMONY = {
  'Rosa Quartzo': {
    proibidas: ['Laranja', 'Vermelho', 'Verde Militar'],
    combinam: ['Branco', 'Cinza Mescla', 'Azul Jeans']
  },
  'Verde Militar': {
    proibidas: ['Rosa Quartzo', 'Azul Marinho'],
    combinam: ['Preto', 'Bege', 'Off-White']
  },
  'Azul Marinho': {
    proibidas: ['Verde Militar', 'Preto'],
    combinam: ['Branco', 'Cinza Mescla', 'Bege']
  },
  'Coral': {
    proibidas: ['Vermelho', 'Rosa Quartzo'],
    combinam: ['Branco', 'Azul Jeans', 'Bege']
  },
  'Laranja': {
    proibidas: ['Rosa Quartzo', 'Vermelho'],
    combinam: ['Branco', 'Azul Marinho', 'Preto']
  }
}

/* ---------- DISTANCIA REDMEAN ---------- */
const getDistance = (c1, c2) => {
  const rMean = (c1.r + c2.r) / 2
  const r = c1.r - c2.r
  const g = c1.g - c2.g
  const b = c1.b - c2.b
  return Math.sqrt(
    (2 + rMean / 256) * r * r +
    4 * g * g +
    (2 + (255 - rMean) / 256) * b * b
  )
}

/* ---------- FILTRO SNIPER: Ignora tons de pele/cabelo ---------- */
const isHumanTone = (r, g, b) => {
  const y = 0.299 * r + 0.587 * g + 0.114 * b
  const cr = r - y
  const cb = b - y
  const isSkin = (cr > -20 && cr < 50 && cb > -30 && cb < 20)
  const isHair = (r > 40 && r < 180 && g > 30 && g < 150 && b > 20 && b < 120 && Math.abs(r - g) < 40)
  return isSkin || isHair
}

/* ---------- ANALISADOR DE COR (SNIPER) ---------- */
export const analyzeColor = async (imageSrc) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve({ color: 'Neutro', confidence: 0 })
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageSrc

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      const size = 100
      canvas.width = size
      canvas.height = size

      // Foco central 40%
      ctx.drawImage(
        img,
        img.width * 0.3,
        img.height * 0.3,
        img.width * 0.4,
        img.height * 0.4,
        0,
        0,
        size,
        size
      )

      const data = ctx.getImageData(0, 0, size, size).data
      const buckets = {}

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]
        if (a < 128) continue

        // FILTRO SNIPER: pula tons de pele/cabelo
        if (isHumanTone(r, g, b)) continue

        const key = `${Math.round(r / 10) * 10},${Math.round(g / 10) * 10},${Math.round(b / 10) * 10}`
        buckets[key] = (buckets[key] || 0) + 1
      }

      const dominant = Object.entries(buckets)
        .sort((a, b) => b[1] - a[1])[0]?.[0]

      if (!dominant) {
        return resolve({ color: 'Neutro', confidence: 0 })
      }

      const [r, g, b] = dominant.split(',').map(Number)
      const colorObj = { r, g, b }

      const lum = (r * 0.299 + g * 0.587 + b * 0.114)
      if (lum < 35) return resolve({ color: 'Preto', confidence: 1 })
      if (lum > 240) return resolve({ color: 'Branco', confidence: 1 })

      let closest = PALETTE[0]
      let minDist = Infinity

      PALETTE.forEach(p => {
        const dist = getDistance(colorObj, p)
        if (dist < minDist) {
          minDist = dist
          closest = p
        }
      })

      const confidence = 1 - Math.min(minDist / 200, 1)

      // AIRBAG: confianca baixa vira neutro
      if (confidence < 0.5) {
        return resolve({ color: 'Neutro', confidence })
      }

      return resolve({ color: closest.name, confidence })
    }

    img.onerror = () => resolve({ color: 'Neutro', confidence: 0 })
  })
}

/* ---------- HARMONIA BIDIRECIONAL ---------- */
export const isColorAllowed = (c1, c2) => {
  if (c1 === 'Neutro' || c2 === 'Neutro') return true
  if (NEUTROS.includes(c1) || NEUTROS.includes(c2)) return true

  if (COLOR_HARMONY[c1]?.proibidas?.includes(c2)) return false
  if (COLOR_HARMONY[c2]?.proibidas?.includes(c1)) return false

  return true
}

/* ---------- ESCOLHA DE COR SEGURA ---------- */
export const normalizeColor = (color) => {
  if (!color) return 'Neutro'
  if (NEUTROS.includes(color)) return 'Neutro'
  return color
}

/* ---------- COMPATIBILIDADE COM CODIGO ANTIGO ---------- */
export const colorAnalyzer = {
  VEST_AI_COLORS: PALETTE,
  analyzeColor,
  isColorAllowed,
  normalizeColor,
  async analyzeImageColor(imageSrc) {
    const result = await analyzeColor(imageSrc)
    // Encontrar RGB da cor detectada na paleta
    const paletteEntry = PALETTE.find(p => p.name === result.color)
    const rgb = paletteEntry ? { r: paletteEntry.r, g: paletteEntry.g, b: paletteEntry.b } : null
    return {
      name: result.color,
      slug: result.color.toLowerCase().replace(/\s+/g, '-'),
      rgb,
      confidence: result.confidence
    }
  }
}

export default colorAnalyzer

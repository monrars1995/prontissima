// =============================================
// VEST.AI COLOR ENGINE - Harmonia de Cores
// =============================================

// Normaliza nome da cor para slug padrao
export function normalizeColor(color) {
  if (!color) return "neutro"
  
  const normalized = color
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .trim()
  
  // Mapeamento de sinonimos
  const synonyms = {
    "preto": "preto",
    "black": "preto",
    "branco": "branco",
    "white": "branco",
    "off-white": "branco",
    "cinza": "cinza",
    "gray": "cinza",
    "grey": "cinza",
    "cinza-mescla": "cinza",
    "azul": "azul",
    "blue": "azul",
    "azul-marinho": "azul-marinho",
    "navy": "azul-marinho",
    "azul-claro": "azul-claro",
    "azul-petroleo": "azul-petroleo",
    "vermelho": "vermelho",
    "red": "vermelho",
    "bordo": "bordo",
    "burgundy": "bordo",
    "vinho": "bordo",
    "verde": "verde",
    "green": "verde",
    "verde-oliva": "verde-oliva",
    "olive": "verde-oliva",
    "verde-escuro": "verde-escuro",
    "amarelo": "amarelo",
    "yellow": "amarelo",
    "mostarda": "mostarda",
    "laranja": "laranja",
    "orange": "laranja",
    "terracota": "terracota",
    "rosa": "rosa",
    "pink": "rosa",
    "rosa-claro": "rosa-claro",
    "rosa-bebe": "rosa-claro",
    "roxo": "roxo",
    "purple": "roxo",
    "lilas": "lilas",
    "bege": "bege",
    "beige": "bege",
    "nude": "bege",
    "caramelo": "caramelo",
    "marrom": "marrom",
    "brown": "marrom",
    "camel": "caramelo",
    "jeans": "azul",
    "denim": "azul",
  }
  
  return synonyms[normalized] || normalized
}

// Tabela de harmonia: quais cores combinam
const HARMONY_TABLE = {
  "preto": ["branco", "cinza", "vermelho", "rosa", "azul", "amarelo", "bege", "caramelo", "bordo"],
  "branco": ["preto", "azul", "azul-marinho", "vermelho", "verde", "rosa", "bege", "cinza", "marrom"],
  "cinza": ["preto", "branco", "rosa", "azul", "vermelho", "amarelo", "verde"],
  "azul": ["branco", "cinza", "bege", "caramelo", "marrom", "rosa-claro"],
  "azul-marinho": ["branco", "bege", "caramelo", "rosa-claro", "amarelo", "cinza"],
  "azul-claro": ["branco", "azul-marinho", "bege", "cinza", "rosa"],
  "vermelho": ["preto", "branco", "cinza", "azul-marinho", "bege"],
  "bordo": ["preto", "branco", "cinza", "bege", "caramelo", "rosa-claro"],
  "verde": ["branco", "bege", "marrom", "cinza", "preto"],
  "verde-oliva": ["branco", "bege", "caramelo", "marrom", "preto", "terracota"],
  "amarelo": ["preto", "azul-marinho", "branco", "cinza"],
  "mostarda": ["azul-marinho", "preto", "branco", "cinza", "marrom"],
  "laranja": ["azul-marinho", "preto", "branco", "bege"],
  "terracota": ["branco", "bege", "verde-oliva", "azul-petroleo", "preto"],
  "rosa": ["cinza", "branco", "azul-marinho", "preto", "bege"],
  "rosa-claro": ["cinza", "branco", "azul-marinho", "azul", "bege"],
  "roxo": ["branco", "cinza", "preto", "rosa-claro"],
  "lilas": ["branco", "cinza", "bege", "azul-claro"],
  "bege": ["preto", "branco", "marrom", "azul-marinho", "verde", "bordo", "terracota"],
  "caramelo": ["preto", "branco", "azul-marinho", "verde-oliva", "bordo"],
  "marrom": ["branco", "bege", "azul-claro", "rosa-claro", "verde-oliva"],
}

// Verifica se duas cores combinam
export function isColorAllowed(color1, color2) {
  const c1 = normalizeColor(color1)
  const c2 = normalizeColor(color2)
  
  // Mesma cor sempre combina
  if (c1 === c2) return true
  
  // Neutros combinam com tudo
  const neutrals = ["preto", "branco", "cinza", "bege", "neutro"]
  if (neutrals.includes(c1) || neutrals.includes(c2)) return true
  
  // Verifica tabela de harmonia
  const harmonies = HARMONY_TABLE[c1] || []
  return harmonies.includes(c2)
}

// Retorna score de harmonia (0-100)
export function getHarmonyScore(color1, color2) {
  const c1 = normalizeColor(color1)
  const c2 = normalizeColor(color2)
  
  // Mesma cor = 100
  if (c1 === c2) return 100
  
  // Neutros = 90
  const neutrals = ["preto", "branco", "cinza", "bege"]
  if (neutrals.includes(c1) || neutrals.includes(c2)) return 90
  
  // Harmonia direta = 80
  const harmonies = HARMONY_TABLE[c1] || []
  if (harmonies.includes(c2)) return 80
  
  // Sem harmonia conhecida = 50 (pode funcionar)
  return 50
}

// Encontra a melhor combinacao de cores em um array de pecas
export function findBestColorMatch(topPieces, bottomPieces) {
  let bestScore = 0
  let bestPair = null
  
  for (const top of topPieces) {
    for (const bottom of bottomPieces) {
      const score = getHarmonyScore(top.cor, bottom.cor)
      if (score > bestScore) {
        bestScore = score
        bestPair = { top, bottom, score }
      }
    }
  }
  
  return bestPair
}

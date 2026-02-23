// ===============================================
// VEST.AI — PROFILE COLOR ENGINE (FINAL)
// Sem IA. 100% baseado no onboarding da usuaria.
// ===============================================

export function getProfileColorAnalysis(profile) {
  if (!profile) return null

  const { skinTone, hairColor, contrast } = profile

  // -----------------------------
  // 1) PALETA IDEAL POR TOM DE PELE
  // -----------------------------
  const idealBySkin = {
    clara_fria: ["Azul Marinho", "Preto", "Cinza", "Rosa Quartzo", "Vinho"],
    clara_quente: ["Caramelo", "Bege Quente", "Mostarda", "Oliva", "Marinho"],
    media_quente: ["Terracota", "Marrom", "Mostarda", "Off-White Quente"],
    media_fria: ["Roxo", "Azul Royal", "Cinza Frio", "Preto"],
    escura_quente: ["Dourado", "Laranja Queimado", "Verde Militar"],
    escura_fria: ["Branco Puro", "Prata", "Azul Royal", "Vinho"]
  }

  // -----------------------------
  // 2) CORES A EVITAR POR TOM DE PELE
  // -----------------------------
  const avoidBySkin = {
    clara_fria: ["Amarelo Forte", "Laranja"],
    clara_quente: ["Cinza Gelo", "Rosa Frio"],
    media_quente: ["Cinza Frio", "Azul Muito Claro"],
    media_fria: ["Terracota", "Mostarda"],
    escura_quente: ["Cinza Apagado", "Bege Frio"],
    escura_fria: ["Mostarda", "Marrom Medio"]
  }

  // -----------------------------
  // 3) PADROES POR COR DO CABELO
  // -----------------------------
  const hairPatterns = {
    loiro: ["Floral Pequeno", "Listras Finas", "Poa", "Monocromatico Suave"],
    castanho_medio: ["Texturas Neutras", "Listras Medias", "Geometricos"],
    castanho_escuro: ["Contraste Forte", "Preto com Branco", "Minimalista"],
    ruivo: ["Tons Quentes", "Folhagens", "Terracota + Jeans"],
    preto: ["Monocromatico", "Metalizado", "Geometrico Grande"]
  }

  // -----------------------------
  // 4) TIPOS DE LOOK POR CONTRASTE
  // -----------------------------
  const looksByContrast = {
    alto: [
      "Preto + Branco",
      "Marinho + Branco",
      "Vinho + Off-White",
      "Look de impacto"
    ],
    medio: [
      "Tons complementares leves",
      "Blazer neutro + bottom colorido"
    ],
    baixo: [
      "Monocromatico",
      "Degrade da mesma familia de cor"
    ]
  }

  // -----------------------------
  // 5) MONTA A ANALISE FINAL
  // -----------------------------
  return {
    idealColors: idealBySkin[skinTone] || [],
    avoidColors: avoidBySkin[skinTone] || [],
    bestPatterns: hairPatterns[hairColor] || [],
    bestLookTypes: looksByContrast[contrast] || [],
    explanation: `Seu perfil visual combina com contrastes ${contrast} e tons ideais segundo seu tom de pele (${skinTone}) e cor de cabelo (${hairColor}).`
  }
}

// =============================================
// VEST.AI - MOTOR DE CORES REAIS (SEM VISION)
// =============================================

const COLOR_ENGINE = {
  PALETTE: {
    '#000000': { nome: 'Preto',   vibe: 'Poder',   combina: ['#FFFFFF', '#FF0000', '#D4AF37'] },
    '#FFFFFF': { nome: 'Branco',  vibe: 'Clean',   combina: ['#000080', '#000000', '#8B4513'] },
    '#000080': { nome: 'Marinho', vibe: 'Classico',combina: ['#FFFFFF', '#F5F5DC', '#C0C0C0'] },
    '#F5F5DC': { nome: 'Bege',    vibe: 'Chic',    combina: ['#FFFFFF', '#8B4513', '#000080'] },
    '#8B4513': { nome: 'Marrom',  vibe: 'Terra',   combina: ['#F5F5DC', '#FFFFFF', '#000080'] },
    '#FF0000': { nome: 'Vermelho',vibe: 'Paixao',  combina: ['#000000', '#FFFFFF', '#C0C0C0'] },
    '#C0C0C0': { nome: 'Cinza',   vibe: 'Neutro',  combina: ['#000000', '#FFFFFF', '#000080'] },
    '#D4AF37': { nome: 'Dourado', vibe: 'Luxo',    combina: ['#000000', '#FFFFFF', '#000080'] },
  },
  
  MOOD_LOGIC: {
    Sexy:      { destaque: "Alto Contraste", base: "#000000", comp: "#FF0000", acessorio: "Dourados" },
    Elegante:  { destaque: "Monocromatico",  base: "#F5F5DC", comp: "#FFFFFF", acessorio: "Perolas" },
    Casual:    { destaque: "Natural",        base: "#000080", comp: "#C0C0C0", acessorio: "Minimalistas" },
    Poderosa:  { destaque: "Estruturado",    base: "#000000", comp: "#D4AF37", acessorio: "Statement" },
    Romantica: { destaque: "Suave",          base: "#FF6B6B", comp: "#F5F5DC", acessorio: "Delicados" },
    Minimalista:{ destaque: "Clean",         base: "#FFFFFF", comp: "#C0C0C0", acessorio: "Discretos" },
    Confiante: { destaque: "Impacto",        base: "#FF0000", comp: "#000000", acessorio: "Marcantes" },
  }
}

// Descricoes variadas por mood para evitar repeticao
const DESCRICOES = {
  Sexy: [
    "Visual de impacto com contraste marcante",
    "Producao ousada que chama atencao",
    "Combinacao poderosa para arrasar",
  ],
  Elegante: [
    "Sofisticacao em tons harmonicos",
    "Visual refinado com proporcoes perfeitas",
    "Elegancia atemporal para qualquer ocasiao",
  ],
  Casual: [
    "Conforto sem abrir mao do estilo",
    "Look descomplicado e moderno",
    "Praticidade com personalidade",
  ],
  Poderosa: [
    "Presenca marcante e autoritaria",
    "Visual que transmite confianca",
    "Combinacao de poder e elegancia",
  ],
  Romantica: [
    "Delicadeza em cada detalhe",
    "Visual feminino e encantador",
    "Suavidade que conquista",
  ],
}

export function getColorMatch(mood) {
  const config = COLOR_ENGINE.MOOD_LOGIC[mood] || COLOR_ENGINE.MOOD_LOGIC.Casual
  const baseColor = COLOR_ENGINE.PALETTE[config.base]
  const compColor = COLOR_ENGINE.PALETTE[config.comp]
  
  // Pega descricao aleatoria para variar
  const descs = DESCRICOES[mood] || DESCRICOES.Casual
  const descricao = descs[Math.floor(Math.random() * descs.length)]
  
  return {
    mood,
    destaque: config.destaque,
    corBase: baseColor?.nome || 'Neutro',
    corComplementar: compColor?.nome || 'Neutro',
    acessorio: config.acessorio,
    vibe: baseColor?.vibe || 'Versatil',
    descricao,
  }
}

export { COLOR_ENGINE }

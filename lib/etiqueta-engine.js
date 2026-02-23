// =============================================
// VEST.AI - MATRIZ DE ETIQUETA E DESIGN (V3)
// =============================================

export const ETIQUETA_ENGINE = {
  // TRABALHO: Foco em autoridade e foco (Armani Vibe)
  Formal: {
    sapato: ["Scarpin bico fino", "Loafer de couro estruturado"],
    cabelo: ["Liso alinhado (polido)", "Rabo de cavalo baixo"],
    make: ["Make nude executiva", "Batom nude rosado"],
    acessorios: ["Relogio de metal", "Brincos de perola", "Ponto de luz"],
    bolsa: "Tote Bag estruturada",
    regra: "Linhas verticais e zero decote"
  },

  // VIAGEM: Luxo silencioso e funcionalidade (Loro Piana Vibe)
  Conforto: {
    sapato: ["Tenis de couro premium", "Mule flat"],
    cabelo: ["Coque despojado (messy bun)", "Tranca lateral"],
    make: ["Make fresh e natural", "Gloss labial"],
    acessorios: ["Oculos de sol grandes", "Lenco de seda"],
    bolsa: "Mochila de couro ou Shopper macia",
    regra: "Tecidos naturais e camadas"
  },

  // ENCONTRO: Atracao e vulnerabilidade estrategica (Tom Ford Vibe)
  Sexy: {
    sapato: ["Sandalia de tiras finas", "Bota de cano curto fina"],
    cabelo: ["Ondas largas (beach waves)", "Cabelo solto com volume"],
    make: ["Make com olho marcado", "Batom vermelho ou nude intenso"],
    acessorios: ["Colares longos no colo", "Argolas finas"],
    bolsa: "Clutch ou bolsa de ombro com corrente",
    regra: "Destaque silhueta e pele a mostra"
  },

  // PODEROSO: Impacto e visao nao convencional (Schiaparelli Vibe)
  Estiloso: {
    sapato: ["Salto geometrico", "Bota tratorada chic"],
    cabelo: ["Efeito molhado (slick back)", "Corte grafico definido"],
    make: ["Make grafica ou colorida", "Delineado marcante"],
    acessorios: ["Maxi colares", "Brincos esculturais"],
    bolsa: "Bolsa de cor vibrante ou formato inusitado",
    regra: "Um ponto de choque visual"
  },

  // ELEGANTE: Sofisticacao atemporal (Hermes Vibe)
  Classico: {
    sapato: ["Slingback salto medio", "Sapatilha de bico fino"],
    cabelo: ["Meio preso elegante", "Chanel escovado"],
    make: ["Make classica sofisticada", "Batom rosa medio"],
    acessorios: ["Conjunto ouro/prata minimalista", "Cinto fino"],
    bolsa: "Bolsa de mao classica em tons neutros",
    regra: "Harmonia monocromatica e caimento impecavel"
  },

  // CASUAL: Descontracao com estilo
  Casual: {
    sapato: ["Tenis branco limpo", "Rasteirinha de couro"],
    cabelo: ["Cabelo solto natural", "Rabo de cavalo alto"],
    make: ["Make leve e fresca", "Apenas gloss"],
    acessorios: ["Brincos discretos", "Pulseira fina"],
    bolsa: "Bolsa crossbody pratica",
    regra: "Conforto sem perder elegancia"
  }
}

// Mapeia ocasiao para estilo de etiqueta
const OCASIAO_MAP = {
  'Trabalho': 'Formal',
  'Reuniao': 'Formal',
  'Entrevista': 'Formal',
  'Viagem': 'Conforto',
  'Lazer': 'Conforto',
  'Dia a Dia': 'Casual',
  'Casual': 'Casual',
  'Encontro': 'Sexy',
  'Jantar': 'Sexy',
  'Festa': 'Estiloso',
  'Balada': 'Estiloso',
  'Evento': 'Classico',
  'Social': 'Classico',
  'Casamento': 'Classico',
}

// Mapeia mood para estilo de etiqueta (fallback)
const MOOD_MAP = {
  'Sexy': 'Sexy',
  'Poderosa': 'Estiloso',
  'Elegante': 'Classico',
  'Romantica': 'Sexy',
  'Confortavel': 'Conforto',
  'Casual': 'Casual',
  'Sofisticada': 'Classico',
  'Feminina': 'Classico',
}

export function getStylingParaLook(mood, occasion, lookVariant = 'A') {
  // Determina estilo base pela ocasiao, fallback pelo mood
  const estiloOcasiao = OCASIAO_MAP[occasion] || 'Casual'
  const estiloMood = MOOD_MAP[mood] || 'Casual'
  
  // Prioriza ocasiao para etiqueta
  const etiqueta = ETIQUETA_ENGINE[estiloOcasiao] || ETIQUETA_ENGINE[estiloMood] || ETIQUETA_ENGINE.Casual
  
  // Look A usa opcao 0, Look B usa opcao 1 (variacao)
  const idx = lookVariant === 'A' ? 0 : 1
  
  return {
    sapato: etiqueta.sapato[idx] || etiqueta.sapato[0],
    cabelo: etiqueta.cabelo[idx] || etiqueta.cabelo[0],
    make: etiqueta.make[idx] || etiqueta.make[0],
    acessorios: etiqueta.acessorios.slice(idx, idx + 2).join(' + ') || etiqueta.acessorios[0],
    bolsa: etiqueta.bolsa,
    regra: etiqueta.regra,
  }
}

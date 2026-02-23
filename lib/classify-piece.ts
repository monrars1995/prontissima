export type PieceCategory = "top" | "bottom" | "dress" | "outerwear"

export function classifyPiece(input: {
  description?: string
  name?: string
}): {
  category: PieceCategory
  subcategory: string
  tipo: "SUPERIOR" | "INFERIOR" | "VESTIDO"
} {
  const text = `${input.description ?? ""} ${input.name ?? ""}`.toLowerCase()

  // VESTIDOS
  if (/(vestido|dress|macac[aã]o|jumpsuit)/.test(text)) {
    return { category: "dress", subcategory: "dress", tipo: "VESTIDO" }
  }

  // INFERIORES (parte de baixo)
  if (/(saia|skirt|short)/.test(text)) {
    return { category: "bottom", subcategory: "skirt", tipo: "INFERIOR" }
  }

  if (/(cal[çc]a|pants|jeans|trousers|legging)/.test(text)) {
    return { category: "bottom", subcategory: "pants", tipo: "INFERIOR" }
  }

  // OUTERWEAR (casacos - contam como SUPERIOR)
  if (/(blazer|jacket|casaco|coat|jaqueta|cardigan)/.test(text)) {
    return { category: "outerwear", subcategory: "jacket", tipo: "SUPERIOR" }
  }

  // SUPERIORES (parte de cima)
  if (/(blusa|camisa|camiseta|top|regata|cropped|shirt|t-shirt|tshirt)/.test(text)) {
    return { category: "top", subcategory: "top", tipo: "SUPERIOR" }
  }

  // FALLBACK: sem keywords reconhecidas = SUPERIOR (mais comum)
  return { category: "top", subcategory: "top", tipo: "SUPERIOR" }
}

export function isValidLook(pieces: { category?: string; tipo?: string }[]): boolean {
  const hasDress = pieces.some(p => p.category === "dress" || p.tipo === "VESTIDO")
  const hasTop = pieces.some(p => p.category === "top" || p.category === "outerwear" || p.tipo === "SUPERIOR")
  const hasBottom = pieces.some(p => p.category === "bottom" || p.tipo === "INFERIOR")
  
  // Look valido: tem vestido OU (tem top E bottom)
  if (hasDress) return true
  return hasTop && hasBottom
}

export function categorizePieces(pieces: { tipo?: string; category?: string }[]) {
  return {
    tops: pieces.filter(p => p.tipo === "SUPERIOR" || p.category === "top" || p.category === "outerwear"),
    bottoms: pieces.filter(p => p.tipo === "INFERIOR" || p.category === "bottom"),
    dresses: pieces.filter(p => p.tipo === "VESTIDO" || p.category === "dress")
  }
}

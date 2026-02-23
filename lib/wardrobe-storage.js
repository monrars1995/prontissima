// COMPRESSAO SNIPER - Reduz imagem para 800px e qualidade 0.6
const compressImage = (base64Str) => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(base64Str)
      return
    }
    
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = base64Str
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const MAX_WIDTH = 800
      const scale = Math.min(MAX_WIDTH / img.width, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/jpeg", 0.6))
    }
    img.onerror = () => resolve(base64Str)
  })
}

// Sistema de gerenciamento de pecas
export const wardrobeStorage = {
  getItems() {
    if (typeof window === "undefined") return []
    const items = localStorage.getItem("prontissima_wardrobe")
    if (!items) return []

    const parsed = JSON.parse(items)
    // Retornar todas as pecas que tem imagem e nome
    const validItems = parsed.filter((item) => item.image && item.name)
    console.log("[v0] Pecas no wardrobe:", validItems.length)
    return validItems
  },

  async addItem(name, imageBase64, metadata = {}) {
    if (typeof window === "undefined") return false
    
    try {
      // COMPRESSAO SNIPER antes de salvar
      const compressedImage = await compressImage(imageBase64)
      // ============================================
      // CONTRATO DE DADOS RIGIDO - OBRIGATORIO
      // Nenhuma peca pode ser salva sem:
      // - tipo (SUPERIOR/INFERIOR/VESTIDO)
      // - cor (com fallback para Neutro)
      // - manualVerified (boolean)
      // ============================================
      
      // VALIDACAO: tipo e OBRIGATORIO
      if (!metadata.tipo || !['SUPERIOR', 'INFERIOR', 'VESTIDO'].includes(metadata.tipo)) {
        console.error("[VEST] ERRO: Peca rejeitada - tipo invalido:", metadata.tipo)
        return false
      }
      
      // FALLBACK: cor baixa confianca -> Neutro
      let cor = metadata.cor || "Cinza Mescla"
      let colorSlug = metadata.colorSlug || "cinza-mescla"
      if (metadata.isLowConfidence === true || !metadata.cor) {
        cor = "Cinza Mescla"
        colorSlug = "cinza-mescla"
      }
      
      const items = this.getItems()
      if (items.length >= 50) {
        console.error("[VEST] Limite de 50 pecas atingido")
        return false
      }

      // Verificar se peca ja existe - se existir, ATUALIZAR
      const existingIndex = items.findIndex(item => item.name === name)
      if (existingIndex !== -1) {
        items[existingIndex].tipo = metadata.tipo
        items[existingIndex].categoria = metadata.categoria || items[existingIndex].categoria
        items[existingIndex].cor = cor
        items[existingIndex].colorSlug = colorSlug
        items[existingIndex].manualVerified = metadata.manualVerified === true
        localStorage.setItem("prontissima_wardrobe", JSON.stringify(items))
        return true
      }

      // CAMPOS OBRIGATORIOS (contrato rigido)
      const newItem = {
        id: Date.now() + Math.random(),
        name,
        image: compressedImage,
        tipo: metadata.tipo,
        categoria: metadata.categoria || "",
        cor: cor,
        colorSlug: colorSlug,
        colorRgb: metadata.colorRgb || null,
        manualVerified: metadata.manualVerified === true,
      }
      
      console.log("[v0] Salvando peca:", name, "tipo:", newItem.tipo, "manualVerified:", newItem.manualVerified)

      items.push(newItem)
      const jsonString = JSON.stringify(items)
      
      // Verificar tamanho antes de salvar (localStorage tem limite de ~5MB)
      const sizeInMB = new Blob([jsonString]).size / (1024 * 1024)
      if (sizeInMB > 4.5) {
        console.log("[v0] ERRO: localStorage quase cheio:", sizeInMB.toFixed(2), "MB")
        items.pop() // Remove a peca que nao cabe
        return false
      }

      localStorage.setItem("prontissima_wardrobe", jsonString)
      console.log("[v0] Peca salva:", name, "- Total:", items.length, "- Tamanho:", sizeInMB.toFixed(2), "MB")
      return true
    } catch (error) {
      console.log("[v0] ERRO ao salvar peca:", error.message)
      return false
    }
  },

  removeItem(idOrName) {
    if (typeof window === "undefined") return
    const items = this.getItems().filter((item) => item.id !== idOrName && item.name !== idOrName)
    localStorage.setItem("prontissima_wardrobe", JSON.stringify(items))
  },

  // Upload sequencial robusto de multiplas pecas
  async addMultipleItems(pieces) {
    const results = { success: [], failed: [], total: pieces.length }
    
    for (const piece of pieces) {
      // Validacao de integridade antes do upload
      if (!piece.image || !piece.name) {
        results.failed.push({ name: piece.name, reason: 'Peca invalida (sem imagem ou nome)' })
        continue
      }

      // CRITICO: Passar TODOS os metadados incluindo TIPO
      const saved = await this.addItem(piece.name, piece.image, {
        tipo: piece.tipo,
        categoria: piece.categoria || '',
        cor: piece.cor || piece.color || '',
        colorSlug: piece.colorSlug || '',
        colorRgb: piece.colorRgb || null,
        manualVerified: piece.manualVerified || false,
      })

      if (saved) {
        results.success.push(piece.name)
      } else {
        results.failed.push({ name: piece.name, reason: 'Memoria cheia ou erro ao salvar' })
      }
    }

    return results
  },

  clearWardrobe() {
    if (typeof window === "undefined") return
    localStorage.removeItem("prontissima_wardrobe")
    localStorage.removeItem("wardrobeItems")
  },
}

// Sistema de gerenciamento de looks
export const looksStorage = {
  getLooks() {
    if (typeof window === "undefined") return []
    const looks = localStorage.getItem("prontissima_looks")
    return looks ? JSON.parse(looks) : []
  },

  saveLook(look) {
    if (typeof window === "undefined") return
    const looks = this.getLooks()
    looks.unshift({
      ...look,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem("prontissima_looks", JSON.stringify(looks))
  },

  getLookById(id) {
    return this.getLooks().find((look) => look.id === Number.parseFloat(id))
  },

  deleteLook(id) {
    if (typeof window === "undefined") return
    const looks = this.getLooks().filter((look) => look.id !== Number.parseFloat(id))
    localStorage.setItem("prontissima_looks", JSON.stringify(looks))
    return true
  },
}

// FUNCAO CRITICA: Corrige wardrobe para trial (3 SUPERIOR + 2 INFERIOR)
export const fixTrialWardrobe = () => {
  if (typeof window === "undefined") return "Erro: Executar no navegador"
  
  const items = JSON.parse(localStorage.getItem("prontissima_wardrobe") || "[]")
  
  if (items.length === 0) {
    return "Nenhuma peca no armario"
  }

  // TRIAL: 3 SUPERIOR + 2 INFERIOR (ou menos se tiver menos pecas)
  const fixedItems = items.map((item, index) => {
    let novoTipo = "SUPERIOR"
    let novaCategoria = "blusa"
    
    // Primeiras 3 pecas = SUPERIOR, restante = INFERIOR
    if (index >= 3) {
      novoTipo = "INFERIOR"
      novaCategoria = "calca"
    }
    
    return { 
      ...item, 
      tipo: novoTipo, 
      categoria: novaCategoria,
    }
  })

  localStorage.setItem("prontissima_wardrobe", JSON.stringify(fixedItems))
  
  const sup = fixedItems.filter(i => i.tipo === "SUPERIOR").length
  const inf = fixedItems.filter(i => i.tipo === "INFERIOR").length
  
  return `Armario corrigido: ${sup} SUPERIOR, ${inf} INFERIOR`
}

export const resetApp = () => {
  if (typeof window === "undefined") return
  console.log("[v0] Resetando app completamente...")
  localStorage.clear()
  sessionStorage.clear()
  console.log("[v0] Storage limpo com sucesso")
}

// FUNCAO CRITICA: Corrige tipos desbalanceados no wardrobe
export const fixWardrobeTypes = () => {
  if (typeof window === "undefined") return "Erro: Executar no navegador"
  
  const items = JSON.parse(localStorage.getItem("prontissima_wardrobe") || "[]")
  
  if (items.length === 0) {
    return "Nenhuma peca no armario"
  }

  // Contar tipos atuais
  const currentTypes = items.reduce((acc, item) => {
    acc[item.tipo || "SEM_TIPO"] = (acc[item.tipo || "SEM_TIPO"] || 0) + 1
    return acc
  }, {})
  
  console.log("[v0] Tipos ANTES:", currentTypes)

  // Redistribuir: 50% SUPERIOR, 35% INFERIOR, 15% VESTIDO
  const total = items.length
  const inferiorTarget = Math.ceil(total * 0.35)
  const vestidoTarget = Math.ceil(total * 0.15)
  
  let inferiorCount = 0
  let vestidoCount = 0

  const fixedItems = items.map((item, index) => {
    // Se a peca ja foi verificada manualmente, manter
    if (item.manualVerified) {
      return item
    }
    
    // Redistribuir tipos
    let novoTipo = "SUPERIOR"
    let novaCategoria = "blusa"
    
    if (inferiorCount < inferiorTarget) {
      novoTipo = "INFERIOR"
      novaCategoria = "calca"
      inferiorCount++
    } else if (vestidoCount < vestidoTarget) {
      novoTipo = "VESTIDO"
      novaCategoria = "vestido"
      vestidoCount++
    }
    
    return { 
      ...item, 
      tipo: novoTipo, 
      categoria: novaCategoria,
      manualVerified: false 
    }
  })

  // Salvar no localStorage
  localStorage.setItem("prontissima_wardrobe", JSON.stringify(fixedItems))
  
  // Contar tipos finais
  const finalTypes = fixedItems.reduce((acc, item) => {
    acc[item.tipo] = (acc[item.tipo] || 0) + 1
    return acc
  }, {})
  
  console.log("[v0] Tipos DEPOIS:", finalTypes)
  
  return `Armario recalibrado: ${finalTypes.SUPERIOR || 0} SUPERIOR, ${finalTypes.INFERIOR || 0} INFERIOR, ${finalTypes.VESTIDO || 0} VESTIDO. Recarregue a pagina.`
}

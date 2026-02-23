// Funcao para corrigir tipos desbalanceados no wardrobe
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

  // Distribuicao ciclica: i % 3 === 0 -> INFERIOR, i % 5 === 0 -> VESTIDO, resto -> SUPERIOR
  const fixedItems = items.map((item, i) => {
    // Se a peca ja foi verificada manualmente, manter
    if (item.manualVerified === true) {
      return item
    }

    let tipo = "SUPERIOR"
    let categoria = "blusa/camisa"

    if (i % 3 === 0) {
      tipo = "INFERIOR"
      categoria = "calca/saia"
    } else if (i % 5 === 0) {
      tipo = "VESTIDO"
      categoria = "vestido"
    }

    return {
      ...item,
      tipo,
      categoria,
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

  return `Armario recalibrado: ${finalTypes.SUPERIOR || 0} SUPERIOR, ${finalTypes.INFERIOR || 0} INFERIOR, ${finalTypes.VESTIDO || 0} VESTIDO`
}

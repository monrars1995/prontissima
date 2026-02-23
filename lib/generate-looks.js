function pickRandom(arr) {
  if (!arr || arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

function allowsDress(occasion) {
  return ["Encontro", "Festa", "Social"].includes(occasion)
}

function prefersCombo(occasion) {
  return ["Trabalho", "Casual", "Lazer"].includes(occasion)
}

export function generateLooks(wardrobe, mood, occasion) {
  // Filtra ESTRITAMENTE por tipo - vestido NUNCA combina com outra peca
  const dresses = wardrobe.filter(p => p.tipo === "VESTIDO")
  const tops = wardrobe.filter(p => p.tipo === "SUPERIOR")
  const bottoms = wardrobe.filter(p => p.tipo === "INFERIOR")
  
  console.log("[VEST] Inventario:", tops.length, "superiores,", bottoms.length, "inferiores,", dresses.length, "vestidos")

  const looks = []

  // ---------- LOOK A ----------
  let lookA

  const canUseDress = dresses.length > 0 && allowsDress(occasion)
  const canUseCombo = tops.length > 0 && bottoms.length > 0

  if (canUseDress && canUseCombo) {
    // decisao ponderada por ocasiao, nao roleta burra
    const useDress = prefersCombo(occasion)
      ? Math.random() < 0.3  // Trabalho/Casual/Lazer: 30% vestido
      : Math.random() < 0.6  // Encontro/Festa/Social: 60% vestido

    lookA = useDress
      ? { type: "SINGLE", pieces: [pickRandom(dresses)] }
      : { type: "COMBO", pieces: [pickRandom(tops), pickRandom(bottoms)] }
  } else if (canUseDress) {
    lookA = { type: "SINGLE", pieces: [pickRandom(dresses)] }
  } else if (canUseCombo) {
    lookA = { type: "COMBO", pieces: [pickRandom(tops), pickRandom(bottoms)] }
  } else {
    throw new Error("NO_VALID_LOOK")
  }

  looks.push(lookA)

  // ---------- LOOK B (DIVERSIDADE REAL) ----------
  let lookB

  if (lookA.type === "SINGLE" && canUseCombo) {
    // Look A e vestido -> Look B e combo
    lookB = { type: "COMBO", pieces: [pickRandom(tops), pickRandom(bottoms)] }
  } else if (lookA.type === "COMBO" && canUseDress) {
    // Look A e combo -> Look B e vestido
    lookB = { type: "SINGLE", pieces: [pickRandom(dresses)] }
  } else {
    // mesma estrutura, pecas diferentes
    if (lookA.type === "SINGLE") {
      const otherDresses = dresses.filter(d => d.id !== lookA.pieces[0]?.id)
      lookB = { 
        type: "SINGLE", 
        pieces: [otherDresses.length > 0 ? pickRandom(otherDresses) : pickRandom(dresses)] 
      }
    } else {
      const otherTops = tops.filter(t => t.id !== lookA.pieces[0]?.id)
      const otherBottoms = bottoms.filter(b => b.id !== lookA.pieces[1]?.id)
      lookB = {
        type: "COMBO",
        pieces: [
          otherTops.length > 0 ? pickRandom(otherTops) : pickRandom(tops),
          otherBottoms.length > 0 ? pickRandom(otherBottoms) : pickRandom(bottoms)
        ]
      }
    }
  }

  looks.push(lookB)

  return looks
}

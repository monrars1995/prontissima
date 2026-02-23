// ============================================
// ANALISADOR DE PELE E CABELO - 100% LOCAL
// Detecta tom de pele e cor de cabelo via canvas
// SEM IA, SEM API, 100% DETERMINISTICO
// ============================================

// Paleta de tons de pele (Fitzpatrick scale simplificada)
const SKIN_TONES = [
  { name: "muito-clara", label: "Muito Clara", rgb: [255, 224, 196], warmth: "cool" },
  { name: "clara", label: "Clara", rgb: [241, 194, 164], warmth: "neutral" },
  { name: "media", label: "Media", rgb: [224, 172, 134], warmth: "warm" },
  { name: "morena", label: "Morena", rgb: [198, 134, 89], warmth: "warm" },
  { name: "escura", label: "Escura", rgb: [141, 85, 54], warmth: "warm" },
  { name: "muito-escura", label: "Muito Escura", rgb: [86, 45, 29], warmth: "neutral" },
]

// Paleta de cores de cabelo
const HAIR_COLORS = [
  { name: "loiro-claro", label: "Loiro Claro", rgb: [230, 208, 160] },
  { name: "loiro-escuro", label: "Loiro Escuro", rgb: [180, 150, 100] },
  { name: "ruivo", label: "Ruivo", rgb: [180, 80, 40] },
  { name: "castanho-claro", label: "Castanho Claro", rgb: [140, 100, 70] },
  { name: "castanho", label: "Castanho", rgb: [100, 70, 50] },
  { name: "castanho-escuro", label: "Castanho Escuro", rgb: [60, 40, 30] },
  { name: "preto", label: "Preto", rgb: [30, 25, 20] },
  { name: "grisalho", label: "Grisalho", rgb: [150, 150, 150] },
]

// Calcula distancia entre duas cores RGB
function colorDistance(rgb1, rgb2) {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  )
}

// Encontra cor mais proxima na paleta
function findNearest(rgb, palette) {
  let nearest = palette[0]
  let minDistance = Infinity
  
  for (const color of palette) {
    const dist = colorDistance(rgb, color.rgb)
    if (dist < minDistance) {
      minDistance = dist
      nearest = color
    }
  }
  
  return { color: nearest, distance: minDistance }
}

// Analisa regiao central da imagem para extrair cor media
function analyzeRegion(imageData, startX, startY, width, height) {
  const data = imageData.data
  const imgWidth = imageData.width
  
  let r = 0, g = 0, b = 0, count = 0
  
  for (let y = startY; y < startY + height && y < imageData.height; y++) {
    for (let x = startX; x < startX + width && x < imgWidth; x++) {
      const idx = (y * imgWidth + x) * 4
      
      // Ignorar pixels muito escuros (sombras) ou muito claros (brilho)
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      if (brightness > 30 && brightness < 240) {
        r += data[idx]
        g += data[idx + 1]
        b += data[idx + 2]
        count++
      }
    }
  }
  
  if (count === 0) return [128, 128, 128]
  
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)]
}

// ============================================
// FUNCAO PRINCIPAL: Analisa foto do rosto
// ============================================
export async function analyzeFaceImage(facePhotoBase64) {
  return new Promise((resolve, reject) => {
    if (!facePhotoBase64) {
      resolve({
        skin_tone: "media",
        skin_label: "Media",
        skin_warmth: "neutral",
        hair_color: "castanho",
        hair_label: "Castanho",
        confidence: "fallback"
      })
      return
    }
    
    const img = new Image()
    img.crossOrigin = "anonymous"
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        
        // Redimensionar para analise (mais rapido)
        const maxSize = 200
        let width = img.width
        let height = img.height
        
        if (width > height) {
          height = (height / width) * maxSize
          width = maxSize
        } else {
          width = (width / height) * maxSize
          height = maxSize
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        const imageData = ctx.getImageData(0, 0, width, height)
        
        // Regiao do rosto (centro, parte inferior - evita cabelo)
        const faceX = Math.floor(width * 0.3)
        const faceY = Math.floor(height * 0.4)
        const faceW = Math.floor(width * 0.4)
        const faceH = Math.floor(height * 0.3)
        
        // Regiao do cabelo (topo da imagem)
        const hairX = Math.floor(width * 0.2)
        const hairY = Math.floor(height * 0.05)
        const hairW = Math.floor(width * 0.6)
        const hairH = Math.floor(height * 0.2)
        
        const skinRgb = analyzeRegion(imageData, faceX, faceY, faceW, faceH)
        const hairRgb = analyzeRegion(imageData, hairX, hairY, hairW, hairH)
        
        const skinResult = findNearest(skinRgb, SKIN_TONES)
        const hairResult = findNearest(hairRgb, HAIR_COLORS)
        
        resolve({
          skin_tone: skinResult.color.name,
          skin_label: skinResult.color.label,
          skin_warmth: skinResult.color.warmth,
          skin_rgb: skinRgb,
          hair_color: hairResult.color.name,
          hair_label: hairResult.color.label,
          hair_rgb: hairRgb,
          confidence: skinResult.distance < 80 && hairResult.distance < 80 ? "alta" : "media"
        })
      } catch (err) {
        console.error("[VEST] Erro ao analisar face:", err)
        resolve({
          skin_tone: "media",
          skin_label: "Media", 
          skin_warmth: "neutral",
          hair_color: "castanho",
          hair_label: "Castanho",
          confidence: "fallback"
        })
      }
    }
    
    img.onerror = () => {
      resolve({
        skin_tone: "media",
        skin_label: "Media",
        skin_warmth: "neutral", 
        hair_color: "castanho",
        hair_label: "Castanho",
        confidence: "fallback"
      })
    }
    
    img.src = facePhotoBase64
  })
}

// Recomendacoes de cores baseadas no tom de pele
export function getColorRecommendations(skinTone, hairColor) {
  const recommendations = {
    "muito-clara": {
      best: ["azul-marinho", "verde-esmeralda", "burgundy", "rosa-claro"],
      avoid: ["laranja", "amarelo-neon", "bege"]
    },
    "clara": {
      best: ["azul-royal", "verde", "rosa", "coral"],
      avoid: ["amarelo-mostarda", "marrom-claro"]
    },
    "media": {
      best: ["terracota", "verde-oliva", "azul-petroleo", "coral"],
      avoid: ["rosa-bebe", "cinza-claro"]
    },
    "morena": {
      best: ["branco", "amarelo", "laranja", "turquesa", "verde-lima"],
      avoid: ["marrom-escuro", "preto-total"]
    },
    "escura": {
      best: ["branco", "amarelo-ouro", "coral", "verde-esmeralda", "roxo"],
      avoid: ["marrom-escuro", "cinza-escuro"]
    },
    "muito-escura": {
      best: ["branco", "amarelo", "laranja", "verde-lima", "rosa-pink"],
      avoid: ["marrom", "azul-marinho-escuro"]
    }
  }
  
  return recommendations[skinTone] || recommendations["media"]
}

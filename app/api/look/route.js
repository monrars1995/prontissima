import { GoogleGenAI } from "@google/genai"

// Lazy init
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

// JSON Schema for look output
const lookSchema = {
  type: "object",
  properties: {
    lookA: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        pecasSelecionadas: { type: "array", items: { type: "string" } },
        sapato: { type: "string" },
        bolsa: { type: "string" },
        acessorios: { type: "array", items: { type: "string" } },
        cabelo: { type: "string" },
        maquiagem: { type: "string" },
        porqueFunciona: { type: "string" },
      },
      required: ["titulo", "pecasSelecionadas", "sapato", "bolsa", "acessorios", "cabelo", "maquiagem", "porqueFunciona"],
    },
    lookB: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        pecasSelecionadas: { type: "array", items: { type: "string" } },
        sapato: { type: "string" },
        bolsa: { type: "string" },
        acessorios: { type: "array", items: { type: "string" } },
        cabelo: { type: "string" },
        maquiagem: { type: "string" },
        porqueFunciona: { type: "string" },
      },
      required: ["titulo", "pecasSelecionadas", "sapato", "bolsa", "acessorios", "cabelo", "maquiagem", "porqueFunciona"],
    },
  },
  required: ["lookA", "lookB"],
}

// Extrai base64 puro de data URL
function extractBase64(dataUrl) {
  if (!dataUrl) return null
  const match = dataUrl.match(/^data:image\/([a-z]+);base64,(.+)$/i)
  return match ? { mimeType: `image/${match[1]}`, data: match[2] } : { mimeType: "image/jpeg", data: dataUrl }
}

export async function POST(request) {
  const { pieces, mood, occasion, bodyInfo } = await request.json()

  console.log("[GEMINI] Generating look with", pieces.length, "pieces for", mood, occasion)

  const client = getClient()

  // Se Gemini não disponível, fallback direto
  if (!client) {
    console.warn("[GEMINI] API key ausente — usando fallback local")
    return Response.json(buildFallback(pieces, mood, occasion, bodyInfo))
  }

  try {
    // Construir conteúdo multimodal: texto + imagens
    const contents = []

    // Instruções do sistema como primeiro item de texto
    contents.push({
      text: `Você é PRONTÍSSIMA, estilista sênior especialista em moda feminina brasileira.

DADOS DA CLIENTE:
- Altura: ${bodyInfo?.alturaCm || bodyInfo?.height || "165"} cm
- Biotipo: ${bodyInfo?.bodyType || bodyInfo?.body_type || "mixed"}
- Tom de pele: ${bodyInfo?.skinTone || bodyInfo?.skin_tone || "médio"}
- MOOD: ${mood}
- OCASIÃO: ${occasion}

REGRAS:
- Monte 2 looks completos usando APENAS as peças fotogradas
- Cada look DEVE ter: 1 superior + 1 inferior (ou 1 vestido)
- NUNCA calça + saia juntas
- pecasSelecionadas DEVE conter os nomes dos arquivos das peças usadas
- Responda em português brasileiro

PEÇAS DISPONÍVEIS:`,
    })

    // Adicionar cada peça como imagem inline
    pieces.forEach((piece, index) => {
      contents.push({ text: `\nPEÇA ${index + 1}: ${piece.name}` })
      const img = extractBase64(piece.image)
      if (img) {
        contents.push({
          inlineData: { mimeType: img.mimeType, data: img.data },
        })
      }
    })

    contents.push({
      text: "\n\nMonte 2 looks completos (lookA e lookB) com as peças acima.",
    })

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: lookSchema,
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    })

    const raw = response.text
    console.log("[GEMINI] Raw response:", raw?.substring(0, 200))

    if (raw) {
      const lookData = JSON.parse(raw)

      // Validação
      if (lookData.lookA?.pecasSelecionadas && lookData.lookB?.pecasSelecionadas) {
        console.log("[GEMINI] ✅ Looks válidos:", {
          lookA: lookData.lookA.pecasSelecionadas,
          lookB: lookData.lookB.pecasSelecionadas,
        })
        return Response.json(lookData)
      }
    }

    throw new Error("Resposta não contém looks válidos")
  } catch (error) {
    console.error("[GEMINI] Error:", error.message)
    console.log("[GEMINI] Usando fallback local...")
    return Response.json(buildFallback(pieces, mood, occasion, bodyInfo))
  }
}

// Fallback local (sem AI) — classifica peças por tipo e monta looks
function buildFallback(pieces, mood, occasion, bodyInfo) {
  const superiores = pieces.filter(p =>
    /blusa|camisa|top|cropped|blazer|jaqueta|body|regata|moletom|colete|cardigan/i.test(p.name) || p.tipo === "SUPERIOR"
  )
  const inferiores = pieces.filter(p =>
    /calca|saia|shorts|bermuda|jeans|legging|pantalona/i.test(p.name) || p.tipo === "INFERIOR"
  )
  const vestidos = pieces.filter(p =>
    /vestido|macacao|macaquinho/i.test(p.name) || p.tipo === "VESTIDO"
  )

  const allPieces = pieces.map(p => p.name)

  let lookAPieces = []
  let lookBPieces = []

  if (superiores.length > 0 && inferiores.length > 0) {
    lookAPieces = [superiores[0].name, inferiores[0].name]
  } else if (vestidos.length > 0) {
    lookAPieces = [vestidos[0].name]
    if (pieces.length > 1) {
      const outra = pieces.find(p => p.name !== vestidos[0].name)
      if (outra) lookAPieces.push(outra.name)
    }
  } else {
    lookAPieces = [allPieces[0], allPieces[1] || allPieces[0]]
  }

  if (superiores.length > 1 && inferiores.length > 1) {
    lookBPieces = [superiores[1].name, inferiores[1].name]
  } else if (superiores.length > 0 && inferiores.length > 1) {
    lookBPieces = [superiores[0].name, inferiores[1].name]
  } else {
    const restantes = pieces.filter(p => !lookAPieces.includes(p.name))
    lookBPieces = restantes.length >= 2
      ? [restantes[0].name, restantes[1].name]
      : lookAPieces.slice().reverse()
  }

  return {
    lookA: {
      titulo: `Look ${mood} Principal`,
      pecasSelecionadas: lookAPieces,
      sapato: "Sandália nude de salto médio ou scarpin clássico",
      bolsa: "Clutch estruturada ou bolsa de mão",
      acessorios: ["Brincos médios dourados", "Relógio fino"],
      cabelo: "Ondas naturais soltas ou preso baixo elegante",
      maquiagem: "Pele iluminada, batom nude rosado",
      porqueFunciona: `Combinação equilibrada para ${occasion.toLowerCase()} com elegância.`,
    },
    lookB: {
      titulo: `Look ${mood} Alternativo`,
      pecasSelecionadas: lookBPieces,
      sapato: "Mule de salto médio ou sandália de tiras",
      bolsa: "Bolsa crossbody minimalista",
      acessorios: ["Argola média", "Pulseiras delicadas"],
      cabelo: "Coque baixo despojado",
      maquiagem: "Natural com foco nos olhos",
      porqueFunciona: "Variação sofisticada e confortável.",
    },
  }
}

import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * FALLBACK OBRIGATÓRIO
 * Usado quando Vision falha, timeouta ou API está sem crédito
 */
const FALLBACK_VISION_DATA = {
  body_type: "mixed",
  height_estimate: "average",
  dominant_lines: "mixed",
  shoulder_width: "average",
  hip_width: "average",
}

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      bodyPhoto, // imagem do corpo (obrigatória)
      facePhoto, // imagem do rosto (obrigatória)
      height,
      weight,
      alreadyAnalyzed, // flag vinda do frontend
    } = body

    console.log("[v0] 📸 Recebido - Body:", bodyPhoto?.length || 0, "bytes | Face:", facePhoto?.length || 0, "bytes")
    console.log("[v0] 📏 Height:", height, "cm | Weight:", weight, "kg")

    // 🔒 KILL SWITCH — nunca chamar Vision duas vezes
    if (alreadyAnalyzed === true) {
      return Response.json({
        success: true,
        visionData: FALLBACK_VISION_DATA,
        source: "cached",
      })
    }

    let visionData = FALLBACK_VISION_DATA
    let visionSucceeded = false

    // 🔒 Se não houver API KEY, NÃO tenta Vision
    if (!process.env.OPENAI_API_KEY) {
      console.warn("[v0] ⚠️ OPENAI_API_KEY ausente — usando fallback")
      return Response.json({
        success: true,
        visionData: FALLBACK_VISION_DATA,
        visionSucceeded: false,
        stylistText:
          "Preparei um look versátil e equilibrado que funciona bem para diferentes tipos de corpo e ocasiões.",
        source: "no-api-key",
      })
    } else {
      try {
        // ===============================
        // ETAPA 1 — VISION (ULTRA LEVE)
        // ===============================
        console.log("[v0] 🔍 Chamando Vision API...")
        const visionResponse = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `
Analyze the person in the image.
Return ONLY a valid JSON with these fields:

{
 "body_type": "pear | hourglass | rectangle | inverted_triangle | mixed",
 "height_estimate": "short | average | tall",
 "dominant_lines": "curved | straight | mixed",
 "shoulder_width": "narrow | average | wide",
 "hip_width": "narrow | average | wide"
}

Return JSON only.
                  `,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: bodyPhoto,
                  },
                },
              ],
            },
          ],
          temperature: 0,
          max_tokens: 150,
        })

        const raw = visionResponse?.choices?.[0]?.message?.content
        console.log("[v0] 📄 Vision response:", raw)

        if (raw) {
          const parsed = JSON.parse(raw)

          // validação mínima
          if (
            parsed.body_type &&
            parsed.height_estimate &&
            parsed.dominant_lines &&
            parsed.shoulder_width &&
            parsed.hip_width
          ) {
            visionData = parsed
            visionSucceeded = true
            console.log("[v0] ✅ Vision succeeded:", visionData)
          }
        }
      } catch (visionError) {
        console.error("[v0] ❌ Vision falhou, usando fallback:", visionError)
      }
    }

    // ===============================
    // ETAPA 2 — GPT TEXTO (SEM IMAGEM)
    // ===============================
    console.log("[v0] 🎨 Chamando GPT Stylist...")
    const stylistResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional AI stylist. Be practical, specific and confident.",
        },
        {
          role: "user",
          content: `
User data:
Body analysis (JSON): ${JSON.stringify(visionData)}
Height: ${height}
Weight: ${weight}

Task:
1. Generate ONE complete outfit:
   - Top
   - Bottom
   - Shoes
   - Accessories (earrings type, bag style, shoes style)
2. Briefly explain why this look works.

Rules:
- Be specific in colors, fabrics and shapes
- Avoid generic words
- Do NOT mention AI, analysis or data sources
          `,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    })

    const stylistText = stylistResponse?.choices?.[0]?.message?.content || ""
    console.log("[v0] ✅ Stylist response:", stylistText?.substring(0, 100) + "...")

    return Response.json({
      success: true,
      visionData,
      visionSucceeded,
      stylistText,
      height,
      weight,
    })
  } catch (error) {
    // 🔥 ÚLTIMA LINHA DE DEFESA — NUNCA QUEBRA O APP
    console.error("[v0] ❌ Erro geral na análise:", error)

    return Response.json({
      success: true,
      visionData: FALLBACK_VISION_DATA,
      visionSucceeded: false,
      stylistText:
        "Preparei um look versátil e equilibrado que funciona bem para diferentes tipos de corpo e ocasiões.",
      source: "hard-fallback",
    })
  }
}

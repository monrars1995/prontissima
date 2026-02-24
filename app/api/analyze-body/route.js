import OpenAI from "openai"

// Lazy init — avoid crashing at build time when OPENAI_API_KEY is absent
function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

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

// Valida campos do resultado vision
function validateVisionData(data) {
  const validBodyTypes = ["pear", "hourglass", "rectangle", "inverted_triangle", "mixed"]
  const validEstimates = ["short", "average", "tall"]
  const validLines = ["curved", "straight", "mixed"]
  const validWidths = ["narrow", "average", "wide"]

  return (
    validBodyTypes.includes(data.body_type) &&
    validEstimates.includes(data.height_estimate) &&
    validLines.includes(data.dominant_lines) &&
    validWidths.includes(data.shoulder_width) &&
    validWidths.includes(data.hip_width)
  )
}

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      bodyPhoto,
      facePhoto,
      height,
      weight,
      alreadyAnalyzed,
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
        // ETAPA 1 — VISION (STRUCTURED OUTPUT)
        // ===============================
        console.log("[v0] 🔍 Chamando Vision API com structured output...")
        const visionResponse = await getClient().chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze the person in the image.
Return a JSON object with these exact fields:
- body_type: one of "pear", "hourglass", "rectangle", "inverted_triangle", "mixed"
- height_estimate: one of "short", "average", "tall"
- dominant_lines: one of "curved", "straight", "mixed"
- shoulder_width: one of "narrow", "average", "wide"
- hip_width: one of "narrow", "average", "wide"`,
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
          response_format: { type: "json_object" },
          temperature: 0,
          max_tokens: 150,
        })

        const raw = visionResponse?.choices?.[0]?.message?.content
        console.log("[v0] 📄 Vision response:", raw)

        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            if (validateVisionData(parsed)) {
              visionData = parsed
              visionSucceeded = true
              console.log("[v0] ✅ Vision succeeded:", visionData)
            } else {
              console.warn("[v0] ⚠️ Vision response failed validation, using fallback")
            }
          } catch (parseErr) {
            console.error("[v0] ⚠️ JSON parse failed:", parseErr.message)
          }
        }
      } catch (visionError) {
        console.error("[v0] ❌ Vision falhou, usando fallback:", visionError.message || visionError)
      }
    }

    // Retorna apenas dados da Vision — sem 2ª chamada OpenAI (stylist text nunca era exibido)
    return Response.json({
      success: true,
      visionData,
      visionSucceeded,
      height,
      weight,
    })
  } catch (error) {
    console.error("[v0] ❌ Erro geral na análise:", error)

    return Response.json({
      success: true,
      visionData: FALLBACK_VISION_DATA,
      visionSucceeded: false,
      source: "hard-fallback",
    })
  }
}

import { GoogleGenAI } from "@google/genai"

// Lazy init — avoid crashing at build time when GEMINI_API_KEY is absent
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
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

// JSON Schema for structured output
const bodyAnalysisSchema = {
  type: "object",
  properties: {
    body_type: {
      type: "string",
      enum: ["pear", "hourglass", "rectangle", "inverted_triangle", "mixed"],
      description: "Body type classification",
    },
    height_estimate: {
      type: "string",
      enum: ["short", "average", "tall"],
      description: "Height estimate based on proportions",
    },
    dominant_lines: {
      type: "string",
      enum: ["curved", "straight", "mixed"],
      description: "Dominant body lines",
    },
    shoulder_width: {
      type: "string",
      enum: ["narrow", "average", "wide"],
      description: "Shoulder width classification",
    },
    hip_width: {
      type: "string",
      enum: ["narrow", "average", "wide"],
      description: "Hip width classification",
    },
  },
  required: ["body_type", "height_estimate", "dominant_lines", "shoulder_width", "hip_width"],
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

// Extrai base64 puro de um data URL
function extractBase64(dataUrl) {
  if (!dataUrl) return null
  // Remove "data:image/jpeg;base64," prefix
  const match = dataUrl.match(/^data:image\/[a-z]+;base64,(.+)$/i)
  return match ? match[1] : dataUrl
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { bodyPhoto, facePhoto, height, weight, alreadyAnalyzed } = body

    console.log("[GEMINI] 📸 Recebido - Body:", bodyPhoto?.length || 0, "bytes | Face:", facePhoto?.length || 0, "bytes")
    console.log("[GEMINI] 📏 Height:", height, "cm | Weight:", weight, "kg")

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

    const client = getClient()

    // 🔒 Se não houver API KEY, NÃO tenta Vision
    if (!client) {
      console.warn("[GEMINI] ⚠️ GEMINI_API_KEY ausente — usando fallback")
      return Response.json({
        success: true,
        visionData: FALLBACK_VISION_DATA,
        visionSucceeded: false,
        source: "no-api-key",
      })
    }

    try {
      // ===============================
      // GEMINI 3 FLASH — VISION + STRUCTURED OUTPUT
      // ===============================
      console.log("[GEMINI] 🔍 Chamando Gemini 3 Flash Vision...")

      const base64Data = extractBase64(bodyPhoto)
      if (!base64Data) {
        console.error("[GEMINI] ❌ Foto sem dados base64 válidos")
        throw new Error("Invalid base64 data")
      }

      const response = await client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: `Analyze the person in this photo and classify their body type.
Return a JSON object with these fields:
- body_type: pear, hourglass, rectangle, inverted_triangle, or mixed
- height_estimate: short, average, or tall
- dominant_lines: curved, straight, or mixed
- shoulder_width: narrow, average, or wide
- hip_width: narrow, average, or wide`,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: bodyAnalysisSchema,
          temperature: 0,
        },
      })

      const raw = response.text
      console.log("[GEMINI] 📄 Vision response:", raw)

      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          if (validateVisionData(parsed)) {
            visionData = parsed
            visionSucceeded = true
            console.log("[GEMINI] ✅ Vision succeeded:", visionData)
          } else {
            console.warn("[GEMINI] ⚠️ Response failed validation, using fallback")
          }
        } catch (parseErr) {
          console.error("[GEMINI] ⚠️ JSON parse failed:", parseErr.message)
        }
      }
    } catch (visionError) {
      console.error("[GEMINI] ❌ Vision falhou:", visionError.message || visionError)
    }

    return Response.json({
      success: true,
      visionData,
      visionSucceeded,
      height,
      weight,
    })
  } catch (error) {
    console.error("[GEMINI] ❌ Erro geral:", error)

    return Response.json({
      success: true,
      visionData: FALLBACK_VISION_DATA,
      visionSucceeded: false,
      source: "hard-fallback",
    })
  }
}

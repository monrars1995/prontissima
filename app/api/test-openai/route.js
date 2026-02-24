import { GoogleGenAI } from "@google/genai"

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return Response.json({
        success: false,
        error: "GEMINI_API_KEY não configurada",
        message: "Adicione GEMINI_API_KEY no .env ou nas variáveis de ambiente",
      }, { status: 500 })
    }

    console.log("[GEMINI] Testing Gemini 3 Flash connection...")

    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Responda apenas com: OK",
      config: { maxOutputTokens: 10, temperature: 0 },
    })

    const text = response.text
    console.log("[GEMINI] Test successful:", text)

    return Response.json({
      success: true,
      message: "Gemini 3 Flash está funcionando!",
      model: "gemini-3-flash-preview",
      response: text,
    })
  } catch (error) {
    console.error("[GEMINI] Test failed:", error.message)

    return Response.json({
      success: false,
      error: error.message,
      message: "GEMINI_API_KEY inválida ou sem permissão. Verifique em https://aistudio.google.com/apikey",
    }, { status: 500 })
  }
}

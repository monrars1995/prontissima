import { generateText } from "ai"

export async function GET() {
  try {
    console.log("[v0] Testing OpenAI API connection...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: "Responda apenas com: OK",
        },
      ],
      maxTokens: 10,
    })

    console.log("[v0] OpenAI API test successful:", text)

    return Response.json({
      success: true,
      message: "OpenAI API está funcionando!",
      response: text,
    })
  } catch (error) {
    console.error("[v0] OpenAI API test failed:", error.message)

    return Response.json(
      {
        success: false,
        error: error.message,
        message: "OPENAI_API_KEY não está configurada ou é inválida. Adicione em Vars > OPENAI_API_KEY",
      },
      { status: 500 },
    )
  }
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { wardrobeStorage, looksStorage } from "@/lib/wardrobe-storage"
import { userStorage } from "@/lib/user-storage"
import AppLogo from "@/components/app-logo"
import SecurityBadge from "@/components/security-badge"
import { flowState } from "@/lib/flow-state" // Declare flowState variable

export default function LoadingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mood = searchParams.get("mood") || "Confiante"
  const occasion = searchParams.get("occasion") || "Trabalho"
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("Iniciando análise...")
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (hasError) return

    const user = userStorage.getUser()
    const devMode = userStorage.isDevMode()

    if (user && !devMode && !userStorage.hasCredits()) {
      console.log("[v0] ❌ Sem créditos disponíveis")
      router.push("/limit-reached")
      return
    }

    if (devMode) {
      console.log("[v0] 🔓 Modo DEV ativo - Ignorando verificação de créditos")
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + 10
      })
    }, 400)

    const generateLook = async () => {
      let items = wardrobeStorage.getItems()

      if (items.length < 3) {
        console.error("[VEST] Minimo de 3 pecas necessario!")
        router.push("/upload")
        return
      }

      // ============================================
      // AUTO-FIX SNIPER: Se todas as pecas sao SUPERIOR,
      // redistribuir automaticamente para 3 SUPERIOR + 2 INFERIOR
      // ============================================
      const tiposAtuais = items.reduce((acc, p) => {
        acc[p.tipo] = (acc[p.tipo] || 0) + 1
        return acc
      }, {})

      const temInferior = (tiposAtuais.INFERIOR || 0) > 0
      const temVestido = (tiposAtuais.VESTIDO || 0) > 0

      if (!temInferior && !temVestido && items.length >= 5) {
        console.log("[VEST] AUTO-FIX: Todas pecas sao SUPERIOR. Redistribuindo para 3S + 2I...")

        const fixedItems = items.map((item, index) => ({
          ...item,
          tipo: index < 3 ? "SUPERIOR" : "INFERIOR",
          categoria: index < 3 ? "blusa" : "calca",
        }))

        localStorage.setItem("prontissima_wardrobe", JSON.stringify(fixedItems))
        items = fixedItems

        const novosTipos = fixedItems.reduce((acc, p) => {
          acc[p.tipo] = (acc[p.tipo] || 0) + 1
          return acc
        }, {})
        console.log("[VEST] Pecas redistribuidas:", novosTipos)
      }

      const bodyInfo = typeof window !== "undefined" ? localStorage.getItem("prontissima_body_info") : null
      const bodyData = bodyInfo ? JSON.parse(bodyInfo) : {}

      console.log("[v0] 🔍 Body info raw:", bodyInfo)
      console.log("[v0] 📊 Body data parsed:", bodyData)

      // Se não tiver dados corporais, usar valores padrão
      if (!bodyData || Object.keys(bodyData).length === 0) {
        console.warn("[v0] ⚠️ Body info vazio, usando valores padrão")
        bodyData.body_type = "mixed"
        bodyData.height = 165
        bodyData.weight = 60
        bodyData.skin_tone = "medium"
        bodyData.hair_color = "dark"
      }

      console.log("[v0] Gerando look com", items.length, "peças")
      console.log("[v0] Dados corporais finais:", bodyData)

      // CRITICO: Passar TODOS os campos da peca, incluindo TIPO
      const compressedItems = items.map((item, idx) => {
        let image = item.image

        // Garantir prefixo data:image se nao existir
        if (!image.startsWith("data:image")) {
          const mimeType = image.startsWith("/9j/") ? "jpeg" : "png"
          image = `data:image/${mimeType};base64,${image}`
        }

        console.log(`[VEST] Peca ${idx + 1}: ${item.name} | tipo: ${item.tipo} | cor: ${item.cor}`)

        return {
          name: item.name,
          image,
          tipo: item.tipo,  // CRITICO: preservar tipo
          categoria: item.categoria,
          cor: item.cor,
          colorSlug: item.colorSlug,
          colorRgb: item.colorRgb,
          manualVerified: item.manualVerified,
        }
      })

      try {
        setStatusMessage("Analisando suas peças...")
        setProgress(20)

        const analyzeResponse = await fetch("/api/analyze-pieces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pieces: compressedItems }),
        })

        if (analyzeResponse.status === 422) {
          const error = await analyzeResponse.json()
          console.error("[v0] ❌ Análise falhou (422):", error)
          setHasError(true)
          setStatusMessage("Falha na análise de imagem")

          setTimeout(() => {
            alert(`Erro na análise: ${error.details || error.error}\n\nPor favor, tire fotos novas com melhor qualidade.`)
            router.push("/upload")
          }, 2000)
          return
        }

        if (!analyzeResponse.ok) {
          throw new Error("Erro ao analisar peças")
        }

        const { pieces: analyzedPieces } = await analyzeResponse.json()
        console.log("[v0] ✅ Peças analisadas:", analyzedPieces.length)
        console.log("[v0] 📦 Peças analisadas completas:", JSON.stringify(analyzedPieces, null, 2))

        // NAO LIMPAR O WARDROBE - as pecas ja estao salvas com tipos corretos
        // Apenas logar a analise
        const tiposCount = analyzedPieces.reduce((acc, p) => {
          acc[p.tipo] = (acc[p.tipo] || 0) + 1
          return acc
        }, {})
        console.log("[VEST] Pecas analisadas por tipo:", tiposCount)

        setProgress(50)
        setStatusMessage("Criando combinacoes perfeitas...")

        // USAR PECAS DO WARDROBE (com tipos corretos) - NAO analyzedPieces
        const wardrobePieces = wardrobeStorage.getItems()
        const tiposFinais = wardrobePieces.reduce((acc, p) => {
          acc[p.tipo] = (acc[p.tipo] || 0) + 1
          return acc
        }, {})
        console.log("[VEST] Chamando create-looks com pecas do wardrobe:", tiposFinais)

        const looksResponse = await fetch("/api/create-looks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analyzedPieces: wardrobePieces,  // USAR WARDROBE, NAO analyzedPieces
            mood,
            occasion,
            bodyInfo: bodyData,
          }),
        })

        console.log("[v0] 📥 Response status de create-looks:", looksResponse.status)
        console.log("[v0] 📥 Response ok?", looksResponse.ok)

        // INVALID_LOOK: faltam pecas corretas
        if (looksResponse.status === 400) {
          const error = await looksResponse.json()
          if (error.error === "INVALID_LOOK") {
            setHasError(true)
            setStatusMessage("Pecas insuficientes")
            setTimeout(() => {
              alert(error.message + "\n\nAdicione as pecas que faltam.")
              router.push("/upload")
            }, 1500)
            return
          }
        }

        if (looksResponse.status === 422) {
          const error = await looksResponse.json()
          setHasError(true)
          setStatusMessage("Falha ao criar looks")
          setTimeout(() => {
            alert(`Erro ao criar looks: ${error.error}\n\nTente novamente.`)
            router.push("/preferences")
          }, 2000)
          return
        }

        if (!looksResponse.ok) {
          throw new Error("Erro ao criar looks")
        }

        const data = await looksResponse.json()

        // ============================================
        // VALIDACAO CRITICA: Verificar se looks foram gerados
        // Credito so e consumido se lookA OU lookB existir
        // ============================================
        if (!data.lookA && !data.lookB) {
          console.error("[VEST] ERRO: Nenhum look gerado")
          setHasError(true)
          setStatusMessage("Nao foi possivel criar looks")
          setTimeout(() => router.push("/upload"), 2000)
          return
        }

        console.log("[VEST] Looks criados com sucesso")

        // CONSUMIR CREDITO APENAS APOS SUCESSO CONFIRMADO
        if (user) {
          const creditResult = userStorage.consumeCredit()
          if (creditResult.success) {
            console.log(`[VEST] Credito consumido. Restantes: ${creditResult.credits}`)
            // Se creditos zerados, vai para upsell apos mostrar resultado
            if (creditResult.redirect) {
              setTimeout(() => router.push(creditResult.redirect), 3000)
            }
          }
        }

        setProgress(100)
        setStatusMessage("Look pronto!")

        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              "prontissima_pending_look",
              JSON.stringify({
                mood,
                occasion,
                lookA: data.lookA,
                lookB: data.lookB,
                pieceNames: items.map((i) => i.name), // Apenas nomes
              }),
            )
          } catch (storageError) {
            console.warn("[v0] Erro no sessionStorage, usando memória:", storageError.message)
            // Continua mesmo se storage falhar
          }
        }

        setTimeout(() => {
          // Marcar fluxo como READY e ir para resultado
          flowState.set("READY")
          router.push("/result")
        }, 500)
      } catch (error) {
        console.error("[v0] Erro ao gerar look:", error.message)
        setHasError(true)
        setStatusMessage("Erro ao criar look. Redirecionando...")
        setTimeout(() => {
          router.push("/preferences")
        }, 2000)
      }
    }

    generateLook()

    return () => clearInterval(progressInterval)
  }, [mood, occasion, router, hasError])

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-rose-50/30 flex flex-col">
      <div className="absolute top-6 left-6 z-10">
        <AppLogo size="small" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
            <div
              className="absolute inset-0 border-4 rounded-full border-t-[#5C1F33] border-r-transparent border-b-transparent border-l-transparent animate-spin"
              style={{ animationDuration: "1s" }}
            ></div>
            <div
              className="absolute inset-2 border-4 rounded-full border-b-amber-400 border-t-transparent border-l-transparent border-r-transparent animate-spin"
              style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
            ></div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-light text-neutral-900">Seu look está quase pronto</h2>
            <p className="text-base text-neutral-600">{statusMessage}</p>

            <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-[#5C1F33] to-amber-600"
                style={{
                  width: `${progress}%`,
                }}
              ></div>
            </div>
            <p className="text-sm font-medium text-[#5C1F33]">{progress}%</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pb-6">
        <SecurityBadge />
      </div>
    </div>
  )
}

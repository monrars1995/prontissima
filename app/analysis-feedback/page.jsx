"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Sparkles, ArrowLeft, MessageCircle } from "lucide-react"
import { Suspense } from "react"
import Loading from "./loading"

function AnalysisFeedbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason") || "limited"

  const feedbackContent = {
    limited: {
      icon: AlertTriangle,
      title: "Guarda-roupa Limitado",
      description: "Identificamos poucas pecas ou pouca variedade no seu guarda-roupa para criar looks completos.",
      suggestion: "Para looks mais variados, recomendamos adicionar mais pecas ou consultar nossa estilista.",
    },
    failed: {
      icon: AlertTriangle,
      title: "Analise Incompleta",
      description: "Nao conseguimos analisar algumas pecas corretamente. Isso pode afetar a qualidade dos looks.",
      suggestion: "Fotos com boa iluminacao e fundo neutro ajudam na analise. Ou consulte nossa estilista para ajuda personalizada.",
    },
    few_colors: {
      icon: Sparkles,
      title: "Paleta de Cores Limitada",
      description: "Seu guarda-roupa tem poucas cores diferentes, o que limita as combinacoes possiveis.",
      suggestion: "Adicione pecas em cores complementares ou consulte nossa estilista para sugestoes.",
    },
  }

  const content = feedbackContent[reason] || feedbackContent.limited
  const IconComponent = content.icon

  const handleConsultoria = () => {
    router.push("/checkout?plan=consultoria&price=30")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      <header className="p-4">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <IconComponent className="w-10 h-10 text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-3">{content.title}</h1>
        <p className="text-neutral-600 mb-4">{content.description}</p>
        <p className="text-sm text-neutral-500 mb-8">{content.suggestion}</p>

        <div className="w-full max-w-sm space-y-4">
          <div className="bg-white border-2 border-[#5C1F33] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#5C1F33]/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#5C1F33]" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-neutral-900">Consultoria Express</h3>
                <p className="text-sm text-neutral-500">30 min com estilista virtual</p>
              </div>
            </div>

            <ul className="text-sm text-neutral-600 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-[#5C1F33] font-bold">•</span>
                Analise personalizada do seu guarda-roupa
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#5C1F33] font-bold">•</span>
                Sugestoes de pecas-chave para adicionar
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#5C1F33] font-bold">•</span>
                Dicas de combinacoes exclusivas
              </li>
            </ul>

            <div className="flex items-baseline gap-1 justify-center">
              <span className="text-3xl font-bold text-[#5C1F33]">R$ 30</span>
              <span className="text-neutral-500 text-sm">unico</span>
            </div>

            <Button
              onClick={handleConsultoria}
              className="w-full h-12 bg-[#5C1F33] hover:bg-[#7A2944] text-white rounded-xl"
            >
              Quero Consultoria
            </Button>
          </div>

          <Button
            onClick={() => router.push("/upload")}
            variant="outline"
            className="w-full h-12 rounded-xl bg-transparent"
          >
            Adicionar Mais Pecas
          </Button>

          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            Continuar mesmo assim
          </button>
        </div>
      </main>
    </div>
  )
}

export default function AnalysisFeedbackPage() {
  return (
    <Suspense fallback={null}>
      <AnalysisFeedbackContent />
    </Suspense>
  )
}

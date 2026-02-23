"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, Clock, Gift, ChevronRight } from "lucide-react"
import AppLogo from "@/components/app-logo"
import { flowState } from "@/lib/flow-state"
import { userStorage } from "@/lib/user-storage"

export default function TrialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    flowState.validate("TRIAL", router)
  }, [router])

  const handleStartTrial = () => {
    setLoading(true)
    
    // Usa o userStorage para ativar trial corretamente
    userStorage.activateTrial()
    
    flowState.set("UPLOAD")
    router.push("/upload")
  }

  const handleSkipTrial = () => {
    router.push("/paywall")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 flex flex-col">
      <div className="absolute top-6 left-6 z-20">
        <AppLogo size="small" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-sm w-full space-y-8 text-center">
          {/* Icone principal */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-200 to-rose-200 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
            <Gift className="w-12 h-12 text-[#5C1F33]" />
          </div>

          {/* Titulo */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-neutral-900">
              Experimente Gratis
            </h1>
            <p className="text-neutral-600">
              Teste o VestAI antes de decidir
            </p>
          </div>

          {/* Beneficios do Trial */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200 space-y-4">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">3 Looks Gratuitos</p>
                <p className="text-sm text-neutral-500">Cada look gera 2 versoes = 6 opcoes</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">3 Dias de Acesso</p>
                <p className="text-sm text-neutral-500">Tempo suficiente para testar</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-purple-600">5</span>
              </div>
              <div>
                <p className="font-semibold text-neutral-900">Ate 5 Pecas</p>
                <p className="text-sm text-neutral-500">Adicione suas pecas favoritas</p>
              </div>
            </div>
          </div>

          {/* Botao CTA */}
          <Button
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full h-16 font-bold text-lg text-white rounded-3xl shadow-xl"
            style={{ backgroundColor: "#5C1F33" }}
          >
            {loading ? (
              "Preparando..."
            ) : (
              <>
                COMECAR TRIAL GRATIS
                <ChevronRight className="w-6 h-6 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-neutral-500">
            Sem cartao de credito. Cancele quando quiser.
          </p>

          {/* Botao pular trial */}
          <button
            onClick={handleSkipTrial}
            className="text-sm text-[#5C1F33] underline hover:text-[#5C1F33]/80 transition-colors"
          >
            Pular trial e ir direto para os planos
          </button>
        </div>
      </div>
    </div>
  )
}

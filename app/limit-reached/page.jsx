"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft } from "lucide-react"

export default function LimitReached() {
  const router = useRouter()

  const buyPack = (packType) => {
    router.push(`/checkout?pack=${packType}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-rose-50/30 p-6">
      <div className="max-w-md mx-auto text-center space-y-8 pt-12">
        <div className="space-y-4">
          <Sparkles className="w-16 h-16 text-[#5C1F33] mx-auto" />
          <h1 className="text-3xl font-light text-neutral-900">Sem Creditos</h1>
          <p className="text-neutral-600">Escolha um pacote para continuar gerando looks.</p>
        </div>

        <div className="space-y-4">
          {/* Pack 10 */}
          <div className="border border-neutral-300 rounded-xl p-6 bg-white shadow-sm">
            <div className="text-2xl font-light text-neutral-900 mb-2">10 Looks</div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-lg text-neutral-400 line-through">R$ 19,90</span>
              <span className="text-3xl font-light text-[#5C1F33]">R$ 9,90</span>
            </div>
            <p className="text-xs text-neutral-500 mb-4">Creditos permanentes (nao expiram)</p>
            <Button onClick={() => buyPack("pack10")} className="w-full bg-[#5C1F33] text-white hover:bg-[#5C1F33]/90">
              Comprar 10 Looks
            </Button>
          </div>

          {/* Pack 30 */}
          <div className="border-2 border-[#5C1F33] rounded-xl p-6 bg-white shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5C1F33] text-white text-xs px-4 py-1 rounded-full">
              Melhor Valor
            </div>
            <div className="text-2xl font-light text-neutral-900 mb-2">30 Looks</div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-lg text-neutral-400 line-through">R$ 49,90</span>
              <span className="text-3xl font-light text-[#5C1F33]">R$ 24,90</span>
            </div>
            <p className="text-xs text-neutral-500 mb-2">Creditos permanentes (nao expiram)</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4">
              <p className="text-xs text-green-700 font-medium">50% OFF - Economia de R$ 25</p>
            </div>
            <Button onClick={() => buyPack("pack30")} className="w-full bg-[#5C1F33] text-white hover:bg-[#5C1F33]/90">
              Comprar 30 Looks
            </Button>
          </div>
        </div>

        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mx-auto">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  )
}

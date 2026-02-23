"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Check, Crown, Zap } from "lucide-react"
import { userStorage } from "@/lib/user-storage"

export default function PackUpsellPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [selectedPack, setSelectedPack] = useState("30")

  useEffect(() => {
    const userData = userStorage.get()
    if (userData) {
      setUser(userData)
      
      // Trial NAO pode comprar packs - redireciona para paywall
      if (userData.plan === "TRIAL") {
        alert("Assine um plano para poder comprar packs de looks extras!")
        router.push("/paywall")
        return
      }
    }
  }, [router])

  const packs = [
    {
      id: "10",
      name: "Pack Basico",
      looks: 10,
      price: 9.90,
      pricePerLook: 0.99,
      icon: Zap,
      popular: false,
      color: "neutral",
    },
    {
      id: "30",
      name: "Pack Premium",
      looks: 30,
      price: 24.90,
      pricePerLook: 0.83,
      icon: Crown,
      popular: true,
      color: "amber",
      savings: "17%",
    },
  ]

  const handleSelectPack = (packId) => {
    setSelectedPack(packId)
  }

  const handleContinue = () => {
    const pack = packs.find(p => p.id === selectedPack)
    router.push(`/checkout?plan=pack${selectedPack}&price=${pack.price}&looks=${pack.looks}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      <header className="p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <h1 className="font-semibold text-neutral-900">Recarregar Creditos</h1>
      </header>

      <main className="flex-1 px-6 py-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Parabens! Voce ja criou {user?.looksCreated || 30} looks!
          </h2>
          <p className="text-neutral-600">
            Continue descobrindo combinacoes incriveis com mais creditos.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {packs.map((pack) => {
            const isSelected = selectedPack === pack.id
            const IconComponent = pack.icon

            return (
              <button
                key={pack.id}
                onClick={() => handleSelectPack(pack.id)}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left relative ${
                  isSelected
                    ? "border-[#5C1F33] bg-[#5C1F33]/5"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isSelected ? "bg-[#5C1F33]" : "bg-neutral-100"
                  }`}>
                    <IconComponent className={`w-6 h-6 ${isSelected ? "text-white" : "text-neutral-600"}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral-900">{pack.name}</h3>
                      {pack.savings && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Economize {pack.savings}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">{pack.looks} looks para criar</p>
                    <p className="text-xs text-neutral-400 mt-0.5">R$ {pack.pricePerLook.toFixed(2)} por look</p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-neutral-900">
                      R$ {pack.price.toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-[#5C1F33] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="bg-neutral-50 rounded-xl p-4 mb-6">
          <h4 className="font-medium text-neutral-900 mb-2">O que voce ganha:</h4>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Looks ilimitados ate acabar os creditos
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Acesso a todas as combinacoes A e B
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Dicas de styling personalizadas
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Creditos nunca expiram
            </li>
          </ul>
        </div>
      </main>

      <footer className="p-6 border-t border-neutral-100 bg-white">
        <Button
          onClick={handleContinue}
          className="w-full h-14 bg-[#5C1F33] hover:bg-[#7A2944] text-white rounded-xl text-lg font-semibold"
        >
          Continuar com {packs.find(p => p.id === selectedPack)?.name}
        </Button>
        <p className="text-center text-xs text-neutral-400 mt-3">
          Pagamento seguro via PIX ou cartao
        </p>
      </footer>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react"
import AppLogo from "@/components/app-logo"
import SecurityBadge from "@/components/security-badge"
import { userStorage } from "@/lib/user-storage"

const PLANS = [
  {
    id: "basic",
    name: "Basico",
    price: 19.90,
    priceDisplay: "R$ 19,90",
    period: "/mes",
    looks: 10,
    wardrobeLimit: 50,
    icon: Zap,
    color: "neutral",
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 49.90,
    priceDisplay: "R$ 49,90",
    period: "/mes",
    looks: 30,
    wardrobeLimit: 50,
    icon: Crown,
    color: "amber",
    popular: true,
    savings: "Melhor custo por look",
  },
]

export default function PaywallPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState("premium")
  const [isTrialAvailable, setIsTrialAvailable] = useState(false)

  useEffect(() => {
    const currentUser = userStorage.get()
    setUser(currentUser)
    
    // Trial so disponivel se nunca usou
    const trialAvailable = currentUser?.plan === "TRIAL" && !currentUser?.hadTrialBefore
    setIsTrialAvailable(trialAvailable)
  }, [])

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId)
  }

  const handleContinue = () => {
    const plan = PLANS.find(p => p.id === selectedPlan)
    router.push(`/checkout?plan=${selectedPlan}&price=${plan.price}&looks=${plan.looks}`)
  }

  const benefits = [
    "Looks personalizados todo mes",
    "Acesso aos looks A e B sempre",
    "Ate 50 pecas no guarda-roupa",
    "Historico completo de looks",
    "Analise de imagem personalizada",
    "Suporte prioritario via WhatsApp",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F4EF] via-white to-[#E8DFD6] flex flex-col">
      <header className="p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <AppLogo size="small" />
      </header>

      <main className="flex-1 px-6 py-4 max-w-lg mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#5C1F33]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-[#5C1F33]" />
          </div>
          <h1 className="text-3xl font-bold text-[#5C1F33] mb-2">
            Escolha seu Plano
          </h1>
          <p className="text-neutral-600">
            Transforme seu guarda-roupa em infinitas possibilidades
          </p>
        </div>

        {/* Planos */}
        <div className="space-y-4 mb-8">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id
            const IconComponent = plan.icon

            return (
              <button
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full p-5 rounded-2xl border-2 transition-all text-left relative ${
                  isSelected
                    ? "border-[#5C1F33] bg-[#5C1F33]/5 shadow-lg"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {plan.popular && (
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
                      <h3 className="font-bold text-lg text-neutral-900">{plan.name}</h3>
                      {plan.savings && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {plan.savings}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 mt-1">
                      {plan.looks} looks/mes + 50 pecas
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-neutral-900">
                      {plan.priceDisplay}
                    </div>
                    <div className="text-xs text-neutral-500">{plan.period}</div>
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

        {/* Beneficios */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-neutral-200">
          <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            O que voce ganha:
          </h4>
          <ul className="space-y-3">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-neutral-700">
                <div className="w-5 h-5 rounded-full bg-[#5C1F33] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Comparacao Trial vs Pago */}
        <div className="bg-neutral-50 rounded-xl p-4 mb-6 text-sm">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div></div>
            <div className="font-semibold text-neutral-500">Trial</div>
            <div className="font-semibold text-[#5C1F33]">Pago</div>
            
            <div className="text-left text-neutral-600">Pecas</div>
            <div className="text-neutral-500">5</div>
            <div className="text-[#5C1F33] font-bold">50</div>
            
            <div className="text-left text-neutral-600">Looks</div>
            <div className="text-neutral-500">3</div>
            <div className="text-[#5C1F33] font-bold">10-30/mes</div>
            
            <div className="text-left text-neutral-600">Packs</div>
            <div className="text-red-500">Nao</div>
            <div className="text-green-600 font-bold">Sim</div>
          </div>
        </div>
      </main>

      <footer className="p-6 border-t border-neutral-100 bg-white">
        <Button
          onClick={handleContinue}
          className="w-full h-14 bg-[#5C1F33] hover:bg-[#7A2944] text-white rounded-xl text-lg font-semibold"
        >
          Continuar com Plano {PLANS.find(p => p.id === selectedPlan)?.name}
        </Button>
        <p className="text-center text-xs text-neutral-400 mt-3">
          Pagamento seguro via PIX ou cartao
        </p>
        <div className="flex justify-center mt-4">
          <SecurityBadge />
        </div>
      </footer>
    </div>
  )
}

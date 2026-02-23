"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { userStorage } from "@/lib/user-storage"
import { Check } from "lucide-react"

export default function PaymentSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packType = searchParams.get("pack") || "basic"
  const transactionId = searchParams.get("transaction_id")

  const PACKS = {
    basic: { credits: 10, name: "Pack Basico" },
    premium: { credits: 30, name: "Pack Premium" },
    pack10: { credits: 10, name: "Pack 10 Looks" },
    pack30: { credits: 30, name: "Pack 30 Looks" },
    upsell10: { credits: 10, name: "Pack Upsell 10" },
    upsell30: { credits: 30, name: "Pack Upsell 30" },
  }

  const selectedPack = PACKS[packType] || PACKS.basic

  useEffect(() => {
    // Creditos ja foram adicionados no payment-pending
    // Esta pagina e apenas confirmacao visual
    console.log("[VEST] Pagamento confirmado - pack:", packType, "credits:", selectedPack.credits)

    // Redireciona apos 2 segundos
    const timeout = setTimeout(() => {
      router.push("/dashboard")
    }, 2000)

    return () => clearTimeout(timeout)
  }, [packType, selectedPack.credits, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <Check className="w-10 h-10 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h1>
      <p className="text-gray-600 text-center mb-4">
        Seu {selectedPack.name} com {selectedPack.credits} looks foi liberado.
      </p>
      <p className="text-sm text-gray-500">Redirecionando para o dashboard...</p>
    </div>
  )
}

"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function PaymentFail() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 p-6">
      <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-10 h-10 text-rose-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops! Ocorreu um erro</h1>
      <p className="text-gray-600 text-center mb-8">Não conseguimos processar seu pagamento.</p>

      <Button onClick={() => router.push("/limit-reached")} className="w-full max-w-xs">
        Tentar Novamente
      </Button>
    </div>
  )
}

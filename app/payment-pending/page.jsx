"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { transactionStorage } from "@/lib/transaction-storage"
import { userStorage } from "@/lib/user-storage"

export default function PaymentPending() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pack = searchParams.get("p") // "10" ou "30"
  const [processing, setProcessing] = useState(true)
  const [countdown, setCountdown] = useState(12)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!pack) {
      setError("Parâmetro de pack inválido")
      setProcessing(false)
      return
    }

    const user = userStorage.getUser()
    if (!user) {
      setError("Usuário não encontrado")
      setProcessing(false)
      return
    }

    const alreadyProcessedToday = transactionStorage.checkIfProcessedToday(user.email, pack)

    if (alreadyProcessedToday) {
      setError("Detectamos uma liberação recente. Se o saldo não caiu, fale conosco.")
      setProcessing(false)
      return
    }

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

      const processTimer = setTimeout(async () => {
        try {
          let success = false
          
          // Verifica se e compra de analise profissional
          if (pack === "analise") {
            const u = userStorage.get()
            if (u) {
              if (!u.credits) u.credits = { plan: 0, packs: 0 }
              u.credits.analysis = 1
              userStorage.save(u)
              success = true
            }
          } else {
            // Pack de looks (10 ou 30)
            const credits = pack === "10" ? 10 : 30
            success = userStorage.addCredits(credits)
          }

          if (success) {
            // Registrar que processou hoje para anti-fraude
            transactionStorage.recordProcessedTransaction(user.email, pack, pack === "analise" ? 1 : (pack === "10" ? 10 : 30))

            // Redireciona para pagina de sucesso
            if (pack === "analise") {
              router.push("/wardrobe-pro-analysis")
            } else {
              router.push(`/payment-success?p=${pack}`)
            }
          } else {
            setError("Erro ao adicionar creditos. Tente novamente.")
            setProcessing(false)
          }
        } catch (err) {
          console.error("[VEST] Erro ao processar:", err)
          setError("Erro ao sincronizar. Tente novamente em instantes.")
          setProcessing(false)
        }
      }, 12000)

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(processTimer)
    }
  }, [pack, router])

  // Forca adicao de creditos (para casos onde o usuario ja pagou)
  const handleForceAddCredits = () => {
    if (pack === "analise") {
      const u = userStorage.get()
      if (u) {
        if (!u.credits) u.credits = { plan: 0, packs: 0 }
        u.credits.analysis = 1
        userStorage.save(u)
        localStorage.removeItem("prontissima_transactions")
        router.push("/wardrobe-pro-analysis")
      }
    } else {
      const credits = pack === "10" ? 10 : 30
      const success = userStorage.addCredits(credits)
      if (success) {
        localStorage.removeItem("prontissima_transactions")
        router.push(`/payment-success?p=${pack}`)
      } else {
        alert("Erro ao adicionar creditos")
      }
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-6 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>

          <div className="space-y-3">
            <Button onClick={handleForceAddCredits} className="w-full bg-green-600 hover:bg-green-700">
              Confirmar Pagamento Manualmente
            </Button>
            <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
              Voltar ao Dashboard
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">Se precisar de ajuda, entre em contato: suporte@vestai.com</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
          <div
            className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
            style={{ animationDuration: "1s" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-purple-600">{countdown}</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Validando sua Transação</h1>

        <p className="text-gray-600 mb-6">Estamos confirmando seu pagamento na rede bancária...</p>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-purple-800 font-medium mb-2">Processando {pack} créditos</p>
          <p className="text-xs text-purple-600">
            Isso dá {pack === "10" ? "20" : "60"} opções de looks personalizados para você!
          </p>
        </div>

        <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <span>Aguarde alguns instantes...</span>
        </div>
      </Card>
    </div>
  )
}

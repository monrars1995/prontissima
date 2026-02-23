"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { userStorage } from "@/lib/user-storage"
import { transactionStorage } from "@/lib/transaction-storage"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [pixCopyPaste, setPixCopyPaste] = useState("")
  const packType = searchParams.get("pack") || "basic"

  const PACKS = {
    basic: {
      name: "Pack Basico",
      price: 19.9,
      looks: 10,
      bennuProductId: process.env.NEXT_PUBLIC_BENNU_PACK_BASIC_ID || "BENNU_PACK_BASIC_ID",
    },
    premium: {
      name: "Pack Premium",
      price: 49.9,
      looks: 30,
      bennuProductId: process.env.NEXT_PUBLIC_BENNU_PACK_PREMIUM_ID || "BENNU_PACK_PREMIUM_ID",
    },
    pack10: {
      name: "Pack 10 Looks",
      price: 9.9,
      looks: 10,
      bennuProductId: process.env.NEXT_PUBLIC_BENNU_PACK_10_ID || "BENNU_PACK_10_ID",
    },
    pack30: {
      name: "Pack 30 Looks",
      price: 24.9,
      looks: 30,
      bennuProductId: process.env.NEXT_PUBLIC_BENNU_PACK_30_ID || "BENNU_PACK_30_ID",
    },
    // UPSELL PACKS - precos especiais para quem zerou creditos
    upsell10: {
      name: "Pack Upsell 10 Looks",
      price: 9.9,
      looks: 10,
      bennuProductId: process.env.NEXT_PUBLIC_BENNU_UPSELL_10_ID || "BENNU_UPSELL_10_ID",
    },
    upsell30: {
      name: "Pack Upsell 30 Looks",
      price: 24.9,
      looks: 30,
      bennuProductId: process.env.NEXT_PUBLIC_BENNU_UPSELL_30_ID || "BENNU_UPSELL_30_ID",
    },
    consultoria: {
      name: "Consultoria Express",
      price: 30,
      looks: 0,
      isConsultoria: true,
      bennuProductId: process.env.NEXT_PUBLIC_BENNU_CONSULTORIA_ID || "BENNU_CONSULTORIA_ID",
    },
    analise: {
      name: "Analise Profissional",
      price: 35,
      looks: 0,
      isAnalise: true,
      bennuProductId: process.env.NEXT_PUBLIC_BENNU_ANALISE_ID || "BENNU_ANALISE_ID",
    },
  }

  const selectedPack = PACKS[packType] || PACKS.basic

  useEffect(() => {
    if (!PACKS[packType]) {
      console.log("[v0] Pack invalido, usando basic como fallback")
    }
    // QR Code real da Bennu
    setQrCodeUrl("/images/bennu-qrcode.jpg")
  }, [packType])

  const handleBennuCheckout = async () => {
    setLoading(true)

    try {
      const user = userStorage.getUser()

      const transactionId = `${user.email}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Save pending transaction to localStorage
      const pendingTransaction = {
        transactionId,
        email: user.email,
        pack: packType,
        credits: selectedPack.looks,
        timestamp: Date.now(),
        status: "pending",
      }
      localStorage.setItem("prontissima_pending_transaction", JSON.stringify(pendingTransaction))
      console.log("[v0] Transaction created:", transactionId)

      // URL de retorno com sucesso incluindo transaction_id
      const successUrl = `${window.location.origin}/payment-success?pack=${packType}&transaction_id=${transactionId}`
      const cancelUrl = `${window.location.origin}/payment-fail?transaction_id=${transactionId}`

      // Integração Bennu com transaction_id como metadata
      const bennuCheckoutUrl = `https://bennu.com.br/checkout?product=${selectedPack.bennuProductId}&success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&customer_email=${user?.email || ""}&metadata=${encodeURIComponent(JSON.stringify({ transaction_id: transactionId }))}`

      console.log("[v0] Redirecionando para Bennu:", bennuCheckoutUrl)

      // Redireciona para Bennu
      window.location.href = bennuCheckoutUrl
    } catch (error) {
      console.error("[v0] Erro ao iniciar checkout:", error)
      alert("Erro ao processar pagamento. Tente novamente.")
      setLoading(false)
    }
  }

  const handlePaymentConfirmed = () => {
    transactionStorage.createPendingTransaction(packType, selectedPack.price)
    if (selectedPack.isAnalise) {
      router.push("/payment-pending?p=analise")
    } else {
      const credits = selectedPack.looks
      router.push(`/payment-pending?p=${credits}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-md mx-auto pt-12">
        <h1 className="text-3xl font-bold text-center mb-8">Finalizar Compra</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{selectedPack.name}</h2>
          <div className="space-y-3 mb-6">
            {selectedPack.isAnalise ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Produto:</span>
                  <span className="font-bold">Analise Profissional</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inclui:</span>
                  <span className="font-bold">Score, diagnostico, lista de compras</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Looks incluidos:</span>
                  <span className="font-bold">{selectedPack.looks} looks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Opcoes por look:</span>
                  <span className="font-bold">2 combinacoes (A e B)</span>
                </div>
              </>
            )}
            <div className="border-t pt-3 flex justify-between text-lg">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-purple-600">R$ {selectedPack.price.toFixed(2)}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg border mb-4 text-center">
            {qrCodeUrl ? (
              <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code PIX" className="w-64 h-64 mx-auto" />
            ) : (
              <div className="w-64 h-64 mx-auto bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">QR Code será exibido aqui</p>
              </div>
            )}
          </div>

          {/* Código copia e cola */}
          {pixCopyPaste && (
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-xs text-gray-600 mb-2">Código PIX Copia e Cola:</p>
              <p className="text-xs font-mono break-all">{pixCopyPaste}</p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(pixCopyPaste)
                  alert("Código copiado!")
                }}
                variant="outline"
                size="sm"
                className="w-full mt-2"
              >
                Copiar Código
              </Button>
            </div>
          )}

          <Button
            onClick={handleBennuCheckout}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
          >
            {loading ? "Processando..." : "Pagar com Bennu"}
          </Button>
          <Button
            onClick={handlePaymentConfirmed}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 mt-2"
          >
            Já Paguei
          </Button>
        </Card>

        <Button onClick={() => router.push("/limit-reached")} variant="ghost" className="w-full">
          Voltar
        </Button>
      </div>
    </div>
  )
}

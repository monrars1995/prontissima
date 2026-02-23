"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

const REASONS = [
  "Muito caro",
  "Não uso com frequência",
  "Resultados não atendem expectativas",
  "Problemas técnicos",
  "Prefiro outro app",
  "Outro motivo",
]

export default function CancelPage() {
  const router = useRouter()
  const [selectedReason, setSelectedReason] = useState("")
  const [feedback, setFeedback] = useState("")

  const handleCancel = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <div className="space-y-2">
          <h1 className="text-3xl font-serif tracking-tight">Cancelar Assinatura</h1>
          <p className="text-sm text-muted-foreground">Sentiremos sua falta. Nos conte o motivo?</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Por que está cancelando?</h3>
            <div className="space-y-2">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedReason === reason
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/50"
                  }`}
                >
                  <span className="text-sm">{reason}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Gostaria de compartilhar mais detalhes? (opcional)</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Seu feedback nos ajuda a melhorar..."
              className="w-full min-h-32 p-4 bg-muted rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-3 pt-4">
            <Button onClick={handleCancel} variant="destructive" className="w-full" size="lg">
              Confirmar Cancelamento
            </Button>
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              Manter Assinatura
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ao cancelar, você ainda terá acesso aos benefícios premium até o final do período de cobrança atual.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

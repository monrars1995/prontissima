"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function ConfirmationPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-foreground">Pagamento recebido</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sua assinatura será ativada após validarmos o comprovante. Você receberá uma confirmação por email em até 2
            horas.
          </p>
        </div>

        <div className="pt-4">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

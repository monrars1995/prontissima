"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-light tracking-tight text-foreground">Sobre o PRONTISSIMA</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-foreground">Seu stylist pessoal com IA</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O PRONTISSIMA e um aplicativo revolucionario que usa inteligencia artificial para criar looks perfeitos
              baseados nas pecas que voce ja possui. Nao precisa mais gastar horas decidindo o que vestir.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-medium text-foreground">Como funciona</h2>
            <ol className="space-y-2 text-sm text-muted-foreground leading-relaxed list-decimal list-inside">
              <li>Fotografe as peças do seu guarda-roupa</li>
              <li>Escolha seu mood e ocasião</li>
              <li>A IA cria looks personalizados para você</li>
              <li>Vista e arrasa!</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-medium text-foreground">Tecnologia</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Powered by GPT-4 e treinado com referências de alta moda das melhores marcas do mundo.
            </p>
          </div>

          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">PRONTISSIMA v1.0 • 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}

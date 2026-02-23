"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, BarChart3, CheckCircle2 } from "lucide-react"

export default function WardrobeAnalysisUpgrade() {
  const router = useRouter()

  const handleBuy = () => {
    // Redireciona para checkout com o pack de analise
    router.push("/checkout?pack=analise")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">
          Analise Profissional do Guarda-Roupa
        </h1>
      </div>

      {/* HERO */}
      <div className="bg-[#5C1F33] text-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <h2 className="text-2xl font-bold">Transforme Seu Estilo em 60 Segundos</h2>
        </div>

        <p className="text-sm opacity-90 leading-relaxed">
          Receba uma analise completa do seu guarda-roupa: 
          o que favorece seu corpo, o que esta faltando, quais cores funcionam
          para a sua pele e ate quantos looks reais voce consegue formar.
        </p>

        <p className="text-sm mt-3 font-semibold text-yellow-200">
          Sem IA. Sem erro. Algoritmo profissional exclusivo Vest.AI.
        </p>
      </div>

      {/* BENEFICIOS */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#5C1F33] mt-1 flex-shrink-0" />
          <p className="text-sm text-foreground leading-tight">
            Score de Estilo (0-100) baseado nas suas pecas e biotipo.
          </p>
        </div>

        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#5C1F33] mt-1 flex-shrink-0" />
          <p className="text-sm text-foreground leading-tight">
            Diagnostico completo do que funciona e do que esta te prejudicando visualmente.
          </p>
        </div>

        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#5C1F33] mt-1 flex-shrink-0" />
          <p className="text-sm text-foreground leading-tight">
            Analise real de combinacoes: quantos looks voce consegue gerar hoje.
          </p>
        </div>

        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#5C1F33] mt-1 flex-shrink-0" />
          <p className="text-sm text-foreground leading-tight">
            Recomendacao profissional: o que comprar (e o que NAO comprar).
          </p>
        </div>

        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#5C1F33] mt-1 flex-shrink-0" />
          <p className="text-sm text-foreground leading-tight">
            Compatibilidade com seu tom de pele, formato do corpo e altura.
          </p>
        </div>
      </div>

      {/* CARD DE PRECO */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-foreground">
            Analise Profissional
          </span>
          <span className="text-2xl font-extrabold text-[#5C1F33]">
            R$ 35
          </span>
        </div>

        <p className="text-sm text-neutral-600">
          Pagamento unico. A analise fica liberada imediatamente apos a compra.
        </p>
      </div>

      {/* CTA BUTTON */}
      <Button 
        onClick={handleBuy}
        className="h-14 text-lg font-bold bg-[#5C1F33] hover:bg-[#4A1828] text-white w-full active:scale-95 transition-all"
      >
        Liberar Minha Analise Profissional
      </Button>

      {/* SEGURANCA */}
      <div className="flex items-center justify-center gap-2 mt-6 text-neutral-500 text-xs">
        <BarChart3 className="w-4 h-4" />
        Algoritmo Vest.AI - sem IA, 100% deterministico.
      </div>
    </div>
  )
}

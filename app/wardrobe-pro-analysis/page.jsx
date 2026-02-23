"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Info, XCircle, CheckCircle2, TrendingUp } from "lucide-react"
import { wardrobeStorage } from "@/lib/wardrobe-storage"
import { userStorage } from "@/lib/user-storage"
import { analyzeWardrobe } from "@/lib/analyze-wardrobe"

export default function WardrobeProAnalysis() {
  const router = useRouter()
  const [report, setReport] = useState(null)

  useEffect(() => {
    const u = userStorage.get()
    
    // Verifica se tem credito OU se ja fez analise antes (analysisDone)
    const hasCredit = u?.credits?.analysis === 1
    const alreadyDone = u?.analysisDone === true
    
    if (!hasCredit && !alreadyDone) {
      router.push("/wardrobe-analysis-upgrade")
      return
    }

    // Busca pecas e perfil
    const items = wardrobeStorage.getItems() || []
    const bodyInfo = userStorage.getBodyInfo() || {}
    
    console.log("[v0] bodyInfo:", bodyInfo)
    console.log("[v0] items count:", items.length)
    console.log("[v0] items sample:", items.slice(0, 3).map(i => ({ tipo: i.tipo, cor: i.cor, color: i.color })))
    
    // Monta o profile para o analisador
    const profile = {
      skinTone: bodyInfo.skinTone || bodyInfo.skin || "media",
      hair: bodyInfo.hairColor || bodyInfo.hair || "castanho"
    }
    
    console.log("[v0] profile:", profile)
    
    // Executa analise do GPT
    const result = analyzeWardrobe(items, profile)
    console.log("[v0] result:", result)
    setReport(result)

    // Consome o credito da analise APENAS se ainda tem credito
    if (hasCredit) {
      u.credits.analysis = 0
      u.analysisDone = true
      userStorage.save(u)
    }
  }, [router])

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Gerando sua analise profissional...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Analise Premium do Seu Estilo</h1>
      </div>

      {/* SCORE */}
      <div className="bg-[#5C1F33] text-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-yellow-300" />
          <h2 className="text-4xl font-extrabold">{report.score}/100</h2>
        </div>
        <p className="mt-2 text-sm opacity-90">
          Avaliacao completa: estrutura, variedade, paleta e potencial de looks.
        </p>
      </div>

      {/* ESTRUTURA DO GUARDA-ROUPA */}
      <Section title="Estrutura do Guarda-Roupa" icon={<Info className="w-5 h-5 text-[#5C1F33]" />}>
        {report.estruturaMsgs?.map((msg, i) => (
          <p key={i} className="text-sm text-neutral-800">- {msg}</p>
        ))}
      </Section>

      {/* PROBLEMAS DE PALETA - EXCESSOS */}
      <Section title="Problemas Reais da Sua Paleta" icon={<Info className="w-5 h-5 text-[#5C1F33]" />}>
        {report.overUsed.length === 0 ? (
          <p className="text-sm text-neutral-700">Sua paleta nao tem repeticoes criticas.</p>
        ) : (
          report.overUsed.map((cor, i) => (
            <p key={i} className="text-sm text-neutral-800">
              Voce tem excesso de pecas em <strong>{cor}</strong> - isso trava novas combinacoes.
            </p>
          ))
        )}
      </Section>

      {/* CORES QUE TRAVAM - BLOCKING */}
      <Section title="Cores que Estao Prejudicando Seus Looks" icon={<XCircle className="w-5 h-5 text-red-600" />}>
        {report.blocking.length === 0 ? (
          <p className="text-sm text-neutral-700">Nenhuma cor esta travando combinacoes.</p>
        ) : (
          report.blocking.map((cor, i) => (
            <p key={i} className="text-sm text-neutral-800">
              <strong>{cor}</strong> nao favorece sua paleta pessoal - substitua gradualmente.
            </p>
          ))
        )}
      </Section>

      {/* LOOKS ATUAIS / FUTUROS */}
      <Section title="Potencial Real de Looks" icon={<TrendingUp className="w-5 h-5 text-[#5C1F33]" />}>
        <p className="text-3xl font-bold text-[#5C1F33]">{report.currentLooks} looks atuais</p>
        <p className="text-neutral-600 text-sm mb-2">Com o que voce ja tem.</p>

        <p className="text-xl font-semibold text-green-700">{report.potentialLooks} looks possiveis</p>
        <p className="text-sm text-neutral-600">Com pequenos ajustes na sua paleta.</p>
      </Section>

      {/* PALETA IDEAL */}
      <Section title="Suas Melhores Cores" icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}>
        <div className="flex flex-wrap gap-2">
          {report.winningPalette.map((cor, i) => (
            <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{cor}</span>
          ))}
        </div>
      </Section>

      {/* NOTAS DO PERFIL */}
      <Section title="Analise do Seu Perfil Visual" icon={<Sparkles className="w-5 h-5 text-[#5C1F33]" />}>
        <p className="text-sm text-neutral-800">{report.profileNotes.skin}</p>
        <p className="text-sm text-neutral-800">{report.profileNotes.hair}</p>
      </Section>

      {/* LISTA DE COMPRAS */}
      <Section title="Lista Profissional de Compras (30 dias)" icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}>
        {report.suggestions.length === 0 ? (
          <p className="text-sm text-neutral-700">Nenhuma compra essencial necessaria.</p>
        ) : (
          report.suggestions.map((s, i) => (
            <p key={i} className="text-sm text-neutral-800">- {s}</p>
          ))
        )}
      </Section>

      {/* VOLTAR */}
      <Button
        onClick={() => router.push("/dashboard")}
        className="h-14 text-lg font-bold bg-[#5C1F33] hover:bg-[#4A1828] text-white w-full active:scale-95"
      >
        Voltar ao Dashboard
      </Button>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-2">
      <h3 className="text-lg font-bold flex items-center gap-2">{icon} {title}</h3>
      {children}
    </div>
  )
}

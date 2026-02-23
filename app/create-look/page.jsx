"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const moods = [
  { id: "poderosa", label: "Poderosa" },
  { id: "elegante", label: "Elegante" },
  { id: "sexy", label: "Sexy" },
  { id: "casual", label: "Casual" },
  { id: "minimal", label: "Minimal" },
]

const occasions = [
  { id: "jantar", label: "Jantar" },
  { id: "trabalho", label: "Trabalho" },
  { id: "encontro", label: "Encontro" },
  { id: "viagem", label: "Viagem" },
  { id: "dia-a-dia", label: "Dia a dia" },
]

export default function CreateLookPage() {
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState("")
  const [selectedOccasion, setSelectedOccasion] = useState("")

  const canProceed = selectedMood && selectedOccasion

  const handleGenerate = () => {
    router.push(`/loading?mood=${selectedMood}&occasion=${selectedOccasion}`)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-foreground">Como você quer se sentir?</h1>
          <p className="text-sm text-muted-foreground">Escolha o mood e a ocasião para seu look</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">Mood</h2>
            <div className="grid grid-cols-2 gap-3">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedMood === mood.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/50"
                  }`}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">Ocasião</h2>
            <div className="grid grid-cols-2 gap-3">
              {occasions.map((occasion) => (
                <button
                  key={occasion.id}
                  onClick={() => setSelectedOccasion(occasion.id)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedOccasion === occasion.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/50"
                  }`}
                >
                  {occasion.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!canProceed}
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
        >
          Gerar Look
        </Button>
      </div>
    </div>
  )
}

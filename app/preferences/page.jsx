"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import AppHeader from "@/components/app-header"
import SecurityBadge from "@/components/security-badge"
import AppLogo from "@/components/app-logo"
import { flowState } from "@/lib/flow-state"

export default function PreferencesPage() {
  const router = useRouter()
  const [mood, setMood] = useState("")
  const [occasion, setOccasion] = useState("")

  useEffect(() => {
    flowState.validate("PREFERENCES", router)

    if (typeof window !== "undefined") {
      const savedPrefs = localStorage.getItem("prontissima_preferences")
      if (savedPrefs) {
        const data = JSON.parse(savedPrefs)
        if (data.mood) setMood(data.mood)
        if (data.occasion) setOccasion(data.occasion)
      }
    }
  }, [router])

  const moods = [
    { value: "Poderosa", label: "Poderosa", emoji: "👑" },
    { value: "Elegante", label: "Elegante", emoji: "💎" },
    { value: "Sexy", label: "Sexy", emoji: "💋" },
    { value: "Casual", label: "Casual", emoji: "☕" },
    { value: "Minimal", label: "Minimal", emoji: "🤍" },
  ]

  const occasions = [
    { value: "Jantar", label: "Jantar", emoji: "🍷" },
    { value: "Trabalho", label: "Trabalho", emoji: "💼" },
    { value: "Encontro", label: "Encontro", emoji: "💕" },
    { value: "Viagem", label: "Viagem", emoji: "✈️" },
    { value: "Dia a dia", label: "Dia a dia", emoji: "☀️" },
  ]

  const canProceed = mood && occasion

  const handleProceed = () => {
    localStorage.setItem("prontissima_preferences", JSON.stringify({ mood, occasion }))
    flowState.set("LOADING")
    router.push(`/loading?mood=${encodeURIComponent(mood)}&occasion=${encodeURIComponent(occasion)}`)
  }

  const OptionCard = ({ selected, onClick, emoji, label }) => (
    <button
      onClick={onClick}
      className={`relative p-5 rounded-2xl transition-all duration-300 border press group ${selected
          ? "border-[#5C1F33] bg-gradient-to-br from-[#5C1F33]/8 to-[#B8860B]/8 shadow-lg"
          : "border-[#E8DFD6] bg-white hover:border-[#C9B8A8] hover:shadow-md"
        }`}
      style={{ transform: selected ? "scale(1.04)" : "scale(1)" }}
    >
      <div className={`text-3xl mb-2 transition-transform duration-300 ${selected ? "scale-110" : "group-hover:scale-105"}`}>
        {emoji}
      </div>
      <p className={`text-xs font-semibold tracking-wide ${selected ? "text-[#5C1F33]" : "text-[#8C7865] group-hover:text-[#3E261E]"
        }`}>
        {label}
      </p>
      {selected && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center anim-scale-in"
          style={{ background: "linear-gradient(135deg, #5C1F33, #7A2944)" }}
        >
          <span className="text-white text-[10px]">✓</span>
        </div>
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#FDF9F5] flex flex-col items-center justify-between relative">
      {/* Subtle background */}
      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(92,31,51,0.03) 0%, transparent 100%)" }}
      />

      <div className="absolute top-6 left-6 z-20">
        <AppLogo size="small" />
      </div>

      <AppHeader step={4} totalSteps={6} />

      <div className="max-w-md w-full space-y-8 px-5 pb-8">
        {/* Title */}
        <div className="text-center space-y-3 anim-fade-up">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
            style={{ background: "linear-gradient(135deg, rgba(92,31,51,0.08), rgba(184,134,11,0.08))" }}
          >
            <Sparkles className="w-7 h-7 text-[#5C1F33]" />
          </div>
          <h1 className="text-3xl font-semibold text-[#3E261E]" style={{ lineHeight: "1.2" }}>
            Como você quer
            <br />
            <span className="text-brand-gradient">se sentir?</span>
          </h1>
        </div>

        <div className="space-y-8">
          {/* Mood */}
          <div className="space-y-4 anim-fade-up delay-2">
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9B8A8]">Mood</h3>
            <div className="grid grid-cols-3 gap-3">
              {moods.map((m, idx) => (
                <div key={m.value} className="anim-scale-in" style={{ animationDelay: `${200 + idx * 60}ms` }}>
                  <OptionCard
                    selected={mood === m.value}
                    onClick={() => setMood(m.value)}
                    emoji={m.emoji}
                    label={m.label}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Occasion */}
          <div className="space-y-4 anim-fade-up delay-4">
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9B8A8]">Ocasião</h3>
            <div className="grid grid-cols-3 gap-3">
              {occasions.map((occ, idx) => (
                <div key={occ.value} className="anim-scale-in" style={{ animationDelay: `${500 + idx * 60}ms` }}>
                  <OptionCard
                    selected={occasion === occ.value}
                    onClick={() => setOccasion(occ.value)}
                    emoji={occ.emoji}
                    label={occ.label}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        {canProceed && (
          <div className="anim-fade-up pt-2">
            <button
              onClick={handleProceed}
              className="w-full py-5 rounded-2xl font-bold text-base tracking-wide text-white press"
              style={{
                background: "linear-gradient(135deg, #5C1F33 0%, #7A2944 50%, #5C1F33 100%)",
                boxShadow: "0 8px 32px rgba(92, 31, 51, 0.3)",
                fontFamily: "var(--font-body)",
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                CRIAR MEU LOOK
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <SecurityBadge />
      </div>
    </div>
  )
}

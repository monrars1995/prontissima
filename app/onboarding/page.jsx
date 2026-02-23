"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { flowState } from "@/lib/flow-state"
import { ChevronDown } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    flowState.validate("ONBOARDING", router)
  }, [router])

  const handleProceed = () => {
    flowState.set("PERSONAL_ANALYSIS")
    router.push("/personal-analysis")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3D1A2A] via-[#5C1F33] to-[#3D1A2A] flex flex-col items-center justify-between px-6 py-10 relative overflow-hidden">
      {/* Sparkle effect overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,215,0,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,215,0,0.1) 0%, transparent 40%)"
        }}
      />

      {/* Logo - Usa a imagem oficial */}
      <div className="z-10">
        <Image
          src="/prontissima-logo.png"
          alt="PRONTISSIMA"
          width={260}
          height={260}
          className="object-contain"
          priority
        />
      </div>

      {/* Benefits Section */}
      <div className="w-full max-w-sm space-y-5 z-10">
        {/* Benefit 1 */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Transforme Seu Tempo</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Looks prontos em segundos. Zero estresse.
            </p>
          </div>
        </div>

        {/* Benefit 2 */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Economize Dinheiro</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Use melhor o que voce ja tem. Multiplique combinacoes.
            </p>
          </div>
        </div>

        {/* Benefit 3 */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Vista a Sua Melhor Versao</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Looks personalizados para cada ocasiao, evento e humor.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-sm space-y-4 z-10">
        <button
          onClick={handleProceed}
          className="w-full py-4 rounded-full font-bold text-lg tracking-wide transition-all duration-300 active:scale-95"
          style={{
            background: "linear-gradient(90deg, #B8860B, #FFD700, #B8860B)",
            color: "#3D1A2A",
            boxShadow: "0 4px 20px rgba(255, 215, 0, 0.3)"
          }}
        >
          Comecar
        </button>

        {/* Scroll hint */}
        <div className="flex justify-center">
          <ChevronDown className="w-6 h-6 text-white/40 animate-bounce" />
        </div>
      </div>

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 100px rgba(0,0,0,0.5)"
        }}
      />
    </div>
  )
}

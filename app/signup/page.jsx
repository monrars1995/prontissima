"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { userStorage } from "@/lib/user-storage"
import { useSupabaseSync } from "@/hooks/use-supabase-sync"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signUp } = useSupabaseSync()

  const handleBack = () => {
    router.push("/")
  }

  const handleContinue = async () => {
    setError("")

    if (!name.trim()) {
      setError("Digite seu nome")
      return
    }

    if (!email.trim()) {
      setError("Digite seu email")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Digite um email válido")
      return
    }

    setLoading(true)
    userStorage.create(email.trim(), name.trim())

    try {
      await signUp(email.trim(), name.trim())
    } catch (e) {
      console.log('[SIGNUP] Supabase signup skipped:', e.message)
    }

    localStorage.setItem("prontissima_flow_state", JSON.stringify({ step: "PERSONAL_ANALYSIS" }))
    router.push("/personal-analysis")
  }

  return (
    <div className="min-h-screen bg-wine-gradient flex flex-col px-6 py-8 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(184, 134, 11, 0.06) 0%, transparent 60%)"
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(30, 10, 18, 0.5) 100%)" }}
      />

      {/* Back button */}
      <div className="flex items-center mb-12 z-10 anim-fade-in">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 -ml-2 text-white/40 hover:text-white/80 transition-colors press cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full z-10">
        {/* Header */}
        <div className="anim-fade-up">
          <p className="text-xs tracking-[0.3em] uppercase text-[#B8860B] mb-3">
            Bem-vinda
          </p>
          <h1 className="text-4xl font-semibold text-white mb-2" style={{ lineHeight: "1.1" }}>
            Criar sua
            <br />
            <span className="text-brand-gradient">conta</span>
          </h1>
          <p className="text-white/40 text-sm mt-3 mb-10">
            Vamos começar sua jornada de estilo
          </p>
        </div>

        <div className="space-y-6">
          {/* Nome */}
          <div className="anim-fade-up delay-2">
            <label className="block text-white/50 text-xs tracking-[0.15em] uppercase font-medium mb-2">
              Seu nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como podemos te chamar?"
              className="w-full px-5 py-4 rounded-2xl bg-white/8 text-white placeholder-white/25 input-luxury text-base"
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="anim-fade-up delay-3">
            <label className="block text-white/50 text-xs tracking-[0.15em] uppercase font-medium mb-2">
              Seu email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-5 py-4 rounded-2xl bg-white/8 text-white placeholder-white/25 input-luxury text-base"
              autoComplete="email"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400/90 text-sm anim-fade-in px-1">{error}</p>
          )}

          {/* Submit */}
          <div className="anim-fade-up delay-4 pt-2">
            <button
              type="button"
              onClick={handleContinue}
              disabled={loading}
              className="w-full py-4 rounded-full font-bold text-base tracking-widest uppercase gold-shimmer btn-glow press cursor-pointer disabled:opacity-50 transition-opacity"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {loading ? "Criando..." : "Continuar"}
            </button>
          </div>
        </div>

        {/* Terms */}
        <p className="text-white/25 text-xs text-center mt-8 anim-fade-up delay-5">
          Ao continuar, você aceita nossos{" "}
          <span className="text-[#B8860B]/60 hover:text-[#B8860B] transition-colors cursor-pointer">Termos de Uso</span> e{" "}
          <span className="text-[#B8860B]/60 hover:text-[#B8860B] transition-colors cursor-pointer">Política de Privacidade</span>
        </p>
      </div>
    </div>
  )
}

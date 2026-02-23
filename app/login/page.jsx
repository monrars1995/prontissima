"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { userStorage } from "@/lib/user-storage"
import SecurityBadge from "@/components/security-badge"
import Image from "next/image"
import { flowState } from "@/lib/flow-state"

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    flowState.validate("LOGIN", router)

    // So redirecionar se usuario JA TEM email real (nao e trial@prontissima.com)
    const existingUser = userStorage.getUser()
    if (existingUser && existingUser.email && existingUser.email !== "trial@prontissima.com") {
      router.push("/dashboard")
    }
  }, [router])

  const handleSubmit = (e) => {
    e.preventDefault()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert("Por favor, insira um e-mail válido")
      return
    }

    if (password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)

    // PRESERVAR dados do trial antes de atualizar
    const existingUser = userStorage.getUser()
    const trialData = {
      credits: existingUser?.credits ?? 3,
      maxCredits: existingUser?.maxCredits ?? 3,
      totalCredits: existingUser?.totalCredits ?? 3,
      plan: existingUser?.plan || "trial",
      trialStartDate: existingUser?.trialStartDate || new Date().toISOString(),
      trialDays: existingUser?.trialDays ?? 3,
      looksCreated: existingUser?.looksCreated ?? 0,
    }

    // Atualizar usuario mantendo dados do trial
    const updatedUser = {
      ...trialData,
      email,
      password,
      name: email.split("@")[0],
      createdAt: existingUser?.createdAt || new Date().toISOString(),
    }
    
    localStorage.setItem("prontissima_user", JSON.stringify(updatedUser))

    flowState.set("READY")

    setTimeout(() => {
      router.push("/dashboard")
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#5C1F33] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C9A961] rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-neutral-200/50">
          <div className="text-center">
            <div className="font-bold text-4xl text-[#5C1F33] mx-auto mb-4">PRONTISSIMA</div>
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-3xl font-light tracking-tight text-neutral-900">Seu look está pronto!</h1>
            <p className="text-base text-neutral-600 font-light leading-relaxed">
              {isLogin ? "Entre para ver" : "Crie sua conta grátis"}
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-neutral-100 rounded-full">
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all active:scale-95 ${
                !isLogin ? "bg-white text-[#5C1F33] shadow-sm" : "text-neutral-600"
              }`}
            >
              Criar conta
            </button>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all active:scale-95 ${
                isLogin ? "bg-white text-[#5C1F33] shadow-sm" : "text-neutral-600"
              }`}
            >
              Já tenho conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 bg-white border-neutral-200 focus:border-[#5C1F33] focus:ring-[#5C1F33] rounded-2xl text-base"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-white border-neutral-200 focus:border-[#5C1F33] focus:ring-[#5C1F33] rounded-2xl text-base"
                  required
                  minLength={6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email || password.length < 6}
              className="w-full h-14 bg-[#5C1F33] text-white hover:bg-[#7A2944] font-bold text-base tracking-wide transition-all duration-200 shadow-lg hover:shadow-xl rounded-[28px] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "PROCESSANDO..." : "VER MEU LOOK AGORA"}
            </Button>
          </form>

          {!isLogin && (
            <p className="text-xs text-center text-neutral-500 leading-relaxed">
              3 dias grátis • 1 look por dia • Cancele quando quiser
            </p>
          )}
        </div>
      </div>

      <div className="relative z-10 pb-4">
        <SecurityBadge />
      </div>
    </div>
  )
}

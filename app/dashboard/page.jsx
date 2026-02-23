"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { userStorage } from "@/lib/user-storage"
import { wardrobeStorage } from "@/lib/wardrobe-storage"
import { Sparkles, Plus, Clock, CreditCard, Settings, Grid3X3, ChevronRight } from "lucide-react"
import AppLogo from "@/components/app-logo"
import DevButton from "@/components/dev-button"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [devMode, setDevMode] = useState(false)

  useEffect(() => {
    userStorage.checkRenewal()
    const u = userStorage.get()
    if (!u) {
      router.push("/")
      return
    }
    setUser(u)
    setItems(wardrobeStorage.getItems())
    setDevMode(userStorage.isDevMode())
  }, [router])

  if (!user) return null

  const totalCredits = (user.credits?.plan || 0) + (user.credits?.packs || 0)
  const planCredits = user.credits?.plan || 0
  const packCredits = user.credits?.packs || 0
  const isPremium = user.isPremium === true
  const daysUntilRenewal = userStorage.getDaysUntilRenewal()

  const hasCombo = items.some(p => p.tipo === "SUPERIOR") && items.some(p => p.tipo === "INFERIOR" || p.tipo === "CALCA" || p.tipo === "SAIA")
  const hasDress = items.some(p => p.tipo === "VESTIDO")
  const canCreateLook = hasCombo || hasDress

  const handleCreateLook = () => {
    if (!canCreateLook) {
      alert("Você precisa pelo menos 1 Superior + 1 Inferior ou 1 Vestido para gerar um look.")
      return
    }
    if (!devMode && !userStorage.hasCredits()) {
      router.push("/limit-reached")
      return
    }
    router.push("/preferences")
  }

  return (
    <div className="min-h-screen bg-[#FDF9F5] relative">
      {/* Subtle background gradient */}
      <div className="absolute top-0 left-0 right-0 h-72 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(92,31,51,0.04) 0%, transparent 100%)" }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-[#E8DFD6]/60 px-5 py-4"
        style={{ background: "rgba(253,249,245,0.85)" }}
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <AppLogo variant="wordmark" colorMode="dark" size="small" />
          <div className="flex items-center gap-1">
            <DevButton />
            <button onClick={() => router.push("/settings")} className="p-2 press">
              <Settings className="w-5 h-5 text-[#C9B8A8] hover:text-[#5C1F33] transition-colors" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8 space-y-6 relative">
        {/* DEV MODE */}
        {devMode && (
          <div className="bg-[#B8860B]/10 border border-[#B8860B]/30 rounded-2xl p-3 text-center anim-fade-in">
            <span className="text-[#B8860B] font-semibold text-sm tracking-wide">✦ MODO DESENVOLVIMENTO ✦</span>
          </div>
        )}

        {/* Credits Card */}
        <div className="luxury-card p-6 anim-fade-up hover-lift">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#C9B8A8] mb-1">Looks restantes</p>
              <p className="text-4xl font-bold text-[#3E261E]" style={{ fontFamily: "var(--font-display)" }}>
                {devMode ? "∞" : totalCredits}
              </p>
              <p className="text-xs text-[#C9B8A8] mt-1">
                {planCredits > 0 && `${planCredits} do plano`}
                {planCredits > 0 && packCredits > 0 && " · "}
                {packCredits > 0 && `${packCredits} extras`}
              </p>
            </div>
            <div className="text-right">
              <div className="w-12 h-12 rounded-2xl bg-[#5C1F33]/8 flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5 text-[#5C1F33]" />
              </div>
              <p className="text-xs text-[#C9B8A8]">2 opções / look</p>
            </div>
          </div>

          {isPremium && daysUntilRenewal !== null && (
            <div className="luxury-divider mt-4 mb-3" />
          )}
          {isPremium && daysUntilRenewal !== null && (
            <p className="text-xs text-center text-[#C9B8A8]">
              Renovação em <span className="font-semibold text-[#5C1F33]">{daysUntilRenewal} dias</span>
            </p>
          )}
        </div>

        {/* Trial Status */}
        {!isPremium && !devMode && (
          <div className="flex items-center gap-3 text-sm glass-card rounded-2xl p-4 anim-fade-up delay-1">
            <Clock className="w-4 h-4 text-[#C9B8A8]" />
            <span className="text-[#8C7865]">
              {totalCredits > 0 ? `${totalCredits} looks restantes no trial` : "Créditos esgotados"}
            </span>
          </div>
        )}

        {/* Create Look CTA */}
        <button
          onClick={handleCreateLook}
          disabled={!canCreateLook}
          className="w-full py-5 rounded-2xl font-bold text-lg tracking-wide text-white disabled:opacity-40 press anim-fade-up delay-2 transition-all"
          style={{
            background: canCreateLook
              ? "linear-gradient(135deg, #5C1F33 0%, #7A2944 50%, #5C1F33 100%)"
              : "#C9B8A8",
            boxShadow: canCreateLook ? "0 8px 32px rgba(92, 31, 51, 0.25)" : "none",
            fontFamily: "var(--font-body)",
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            {!canCreateLook ? "Adicione peças primeiro" : "Criar Look"}
          </span>
        </button>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3 anim-fade-up delay-3">
          <button
            onClick={() => router.push("/history")}
            className="glass-card rounded-2xl p-5 text-left hover-lift press group"
          >
            <Clock className="w-5 h-5 text-[#C9B8A8] mb-3 group-hover:text-[#5C1F33] transition-colors" />
            <p className="text-sm font-semibold text-[#3E261E]">Histórico</p>
            <p className="text-xs text-[#C9B8A8] mt-0.5">Looks salvos</p>
          </button>

          <button
            onClick={() => router.push("/wardrobe")}
            className="glass-card rounded-2xl p-5 text-left hover-lift press group"
          >
            <Grid3X3 className="w-5 h-5 text-[#C9B8A8] mb-3 group-hover:text-[#5C1F33] transition-colors" />
            <p className="text-sm font-semibold text-[#3E261E]">Gavetas</p>
            <p className="text-xs text-[#C9B8A8] mt-0.5">Organizar peças</p>
          </button>
        </div>

        {/* Upload Button */}
        {(isPremium || items.length < 10 || devMode) && (
          <button
            onClick={() => router.push("/upload")}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-[#E8DFD6] text-[#8C7865] hover:border-[#C9B8A8] hover:text-[#5C1F33] transition-all press anim-fade-up delay-4 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar Peças ({items.length}/{isPremium ? 50 : 10})
          </button>
        )}

        {/* Buy Credits */}
        {!devMode && (
          <button
            onClick={() => router.push("/limit-reached")}
            className="w-full py-4 rounded-2xl bg-[#B8860B]/8 border border-[#B8860B]/20 text-[#B8860B] hover:bg-[#B8860B]/12 transition-all press anim-fade-up delay-5 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <CreditCard className="w-4 h-4" />
            Comprar Mais Créditos
          </button>
        )}

        {/* Wardrobe Preview */}
        <div className="pt-2 anim-fade-up delay-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#3E261E]">Suas peças</h2>
            {items.length > 0 && (
              <button onClick={() => router.push("/wardrobe")} className="text-xs text-[#C9B8A8] hover:text-[#5C1F33] transition-colors flex items-center gap-1">
                Ver todas <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="luxury-card p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F1E9] flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-[#C9B8A8]" />
              </div>
              <p className="text-sm text-[#C9B8A8] mb-4">Nenhuma peça ainda</p>
              <button
                onClick={() => router.push("/upload")}
                className="text-sm font-medium text-[#5C1F33] hover:text-[#7A2944] transition-colors"
              >
                Adicionar primeira peça →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {items.slice(0, 6).map((item, idx) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-[#F7F1E9] hover-lift anim-scale-in"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <Image src={item.imageUrl || item.image} alt={item.name || "Peça"} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase"
                    style={{ background: "rgba(92,31,51,0.85)", color: "rgba(247,241,233,0.9)" }}
                  >
                    {item.tipo?.charAt(0) || "?"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

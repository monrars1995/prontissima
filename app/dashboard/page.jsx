"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { userStorage } from "@/lib/user-storage"
import { wardrobeStorage, looksStorage } from "@/lib/wardrobe-storage"
import {
  Sparkles, Plus, Clock, CreditCard, Settings,
  Grid3X3, ChevronRight, Shirt, Star, Info
} from "lucide-react"
import AppLogo from "@/components/app-logo"
import DevButton from "@/components/dev-button"

// ── Helpers ──────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}

const PLAN_STYLES = {
  TRIAL: { label: "Trial", bg: "bg-[#C9B8A8]/20", text: "text-[#8C7865]", border: "border-[#C9B8A8]/40" },
  BASIC: { label: "Basic", bg: "bg-[#5C1F33]/10", text: "text-[#5C1F33]", border: "border-[#5C1F33]/20" },
  PREMIUM: { label: "Premium", bg: "bg-[#B8860B]/10", text: "text-[#B8860B]", border: "border-[#B8860B]/30" },
}

// ── Component ────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [looksCount, setLooksCount] = useState(0)
  const [devMode, setDevMode] = useState(false)

  useEffect(() => {
    userStorage.checkRenewal()
    const u = userStorage.get()
    if (!u) { router.push("/"); return }
    setUser(u)
    setItems(wardrobeStorage.getItems())
    setLooksCount(looksStorage.getLooks().length)
    setDevMode(userStorage.isDevMode())
  }, [router])

  if (!user) return null

  const totalCredits = (user.credits?.plan || 0) + (user.credits?.packs || 0)
  const planCredits = user.credits?.plan || 0
  const packCredits = user.credits?.packs || 0
  const isPremium = user.isPremium === true
  const daysUntilRenewal = userStorage.getDaysUntilRenewal()
  const planKey = (user.plan || "TRIAL").toUpperCase()
  const planStyle = PLAN_STYLES[planKey] || PLAN_STYLES.TRIAL

  const hasCombo = items.some(p => p.tipo === "SUPERIOR") && items.some(p => ["INFERIOR", "CALCA", "SAIA"].includes(p.tipo))
  const hasDress = items.some(p => p.tipo === "VESTIDO")
  const canCreateLook = hasCombo || hasDress

  // Category counts for wardrobe summary
  const categoryCounts = items.reduce((acc, p) => {
    acc[p.tipo] = (acc[p.tipo] || 0) + 1
    return acc
  }, {})

  const handleCreateLook = () => {
    if (!canCreateLook) {
      alert("Você precisa pelo menos 1 Superior + 1 Inferior ou 1 Vestido para gerar um look.")
      return
    }
    if (!devMode && !userStorage.hasCredits()) { router.push("/limit-reached"); return }
    router.push("/preferences")
  }

  return (
    <div className="min-h-screen bg-[#FDF9F5] relative pb-20">
      {/* Ambient gradient */}
      <div className="absolute top-0 left-0 right-0 h-80 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(92,31,51,0.06) 0%, rgba(184,134,11,0.02) 40%, transparent 100%)" }}
      />

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-[#E8DFD6]/60 px-5 py-4"
        style={{ background: "rgba(253,249,245,0.88)" }}
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
        {/* ── Dev Mode Banner ── */}
        {devMode && (
          <div className="bg-[#B8860B]/10 border border-[#B8860B]/30 rounded-2xl p-3 text-center anim-fade-in">
            <span className="text-[#B8860B] font-semibold text-sm tracking-wide">✦ MODO DEV ✦</span>
          </div>
        )}

        {/* ── Greeting ── */}
        <div className="anim-fade-up">
          <p className="text-sm text-[#C9B8A8] tracking-wide">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-[#3E261E] mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
            {user.name || "Fashionista"} ✨
          </h1>
        </div>

        {/* ── Credits Card ── */}
        <div className="luxury-card p-6 anim-fade-up delay-1 hover-lift relative overflow-hidden">
          {/* Subtle shimmer accent */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #B8860B 0%, transparent 70%)" }}
          />

          <div className="flex items-start justify-between relative">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs tracking-[0.2em] uppercase text-[#C9B8A8]">Looks restantes</p>
                <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${planStyle.bg} ${planStyle.text} ${planStyle.border}`}>
                  {planStyle.label}
                </span>
              </div>
              <p className="text-5xl font-bold text-[#3E261E]" style={{ fontFamily: "var(--font-display)" }}>
                {devMode ? "∞" : totalCredits}
              </p>
              <p className="text-xs text-[#C9B8A8] mt-1.5">
                {planCredits > 0 && `${planCredits} do plano`}
                {planCredits > 0 && packCredits > 0 && " · "}
                {packCredits > 0 && `${packCredits} extras`}
              </p>
            </div>
            <div className="text-right">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5C1F33]/10 to-[#B8860B]/10 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-[#5C1F33]" />
              </div>
              <p className="text-[10px] text-[#C9B8A8] tracking-wide">2 opções / look</p>
            </div>
          </div>

          {isPremium && daysUntilRenewal !== null && (
            <>
              <div className="luxury-divider mt-4 mb-3" />
              <p className="text-xs text-center text-[#C9B8A8]">
                Renovação em <span className="font-semibold text-[#5C1F33]">{daysUntilRenewal} dias</span>
              </p>
            </>
          )}
        </div>

        {/* ── Trial Status ── */}
        {!isPremium && !devMode && (
          <div className="flex items-center gap-3 text-sm glass-card rounded-2xl p-4 anim-fade-up delay-2">
            <div className="w-8 h-8 rounded-xl bg-[#C9B8A8]/15 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-[#C9B8A8]" />
            </div>
            <span className="text-[#8C7865]">
              {totalCredits > 0 ? `${totalCredits} looks restantes no trial` : "Créditos esgotados"}
            </span>
          </div>
        )}

        {/* ── CTA: Criar Look ── */}
        <button
          onClick={handleCreateLook}
          disabled={!canCreateLook}
          className="w-full py-5 rounded-2xl font-bold text-lg tracking-wide text-white disabled:opacity-40 press anim-fade-up delay-2 transition-all group"
          style={{
            background: canCreateLook
              ? "linear-gradient(135deg, #5C1F33 0%, #7A2944 50%, #5C1F33 100%)"
              : "#C9B8A8",
            boxShadow: canCreateLook ? "0 8px 32px rgba(92, 31, 51, 0.25)" : "none",
            fontFamily: "var(--font-body)",
          }}
        >
          <span className="flex items-center justify-center gap-2.5">
            <Sparkles className="w-5 h-5 group-hover:animate-spin" style={{ animationDuration: "2s" }} />
            {!canCreateLook ? "Adicione peças primeiro" : "Criar Look"}
          </span>
        </button>

        {/* ── Quick Actions Grid ── */}
        <div className="grid grid-cols-2 gap-3 anim-fade-up delay-3">
          <ActionCard
            icon={<Clock className="w-5 h-5" />}
            label="Histórico"
            sublabel={looksCount > 0 ? `${looksCount} looks` : "Nenhum"}
            onClick={() => router.push("/history")}
          />
          <ActionCard
            icon={<Grid3X3 className="w-5 h-5" />}
            label="Gavetas"
            sublabel={items.length > 0 ? `${items.length} peças` : "Vazio"}
            onClick={() => router.push("/wardrobe")}
          />
          <ActionCard
            icon={<Star className="w-5 h-5" />}
            label="Análise PRO"
            sublabel="Guarda-roupa"
            onClick={() => router.push("/wardrobe-analysis-upgrade")}
          />
          <ActionCard
            icon={<Info className="w-5 h-5" />}
            label="Sobre"
            sublabel="Prontíssima"
            onClick={() => router.push("/about")}
          />
        </div>

        {/* ── Upload Button ── */}
        {(isPremium || items.length < 10 || devMode) && (
          <button
            onClick={() => router.push("/upload")}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-[#E8DFD6] text-[#8C7865] hover:border-[#C9B8A8] hover:text-[#5C1F33] transition-all press anim-fade-up delay-4 flex items-center justify-center gap-2 text-sm font-medium group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Adicionar Peças ({items.length}/{isPremium ? 50 : 10})
          </button>
        )}

        {/* ── Buy Credits ── */}
        {!devMode && totalCredits < 5 && (
          <button
            onClick={() => router.push("/limit-reached")}
            className="w-full py-4 rounded-2xl bg-[#B8860B]/8 border border-[#B8860B]/20 text-[#B8860B] hover:bg-[#B8860B]/12 transition-all press anim-fade-up delay-5 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <CreditCard className="w-4 h-4" />
            Comprar Mais Créditos
          </button>
        )}

        {/* ── Wardrobe Preview ── */}
        <div className="pt-2 anim-fade-up delay-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#3E261E]" style={{ fontFamily: "var(--font-display)" }}>
              Suas peças
            </h2>
            {items.length > 0 && (
              <button onClick={() => router.push("/wardrobe")}
                className="text-xs text-[#C9B8A8] hover:text-[#5C1F33] transition-colors flex items-center gap-1 press"
              >
                Ver todas <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category pills */}
          {items.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {categoryCounts.SUPERIOR > 0 && (
                <span className="text-[10px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-[#5C1F33]/8 text-[#5C1F33] border border-[#5C1F33]/15">
                  {categoryCounts.SUPERIOR} Superior
                </span>
              )}
              {categoryCounts.INFERIOR > 0 && (
                <span className="text-[10px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-[#B8860B]/8 text-[#B8860B] border border-[#B8860B]/15">
                  {categoryCounts.INFERIOR} Inferior
                </span>
              )}
              {categoryCounts.VESTIDO > 0 && (
                <span className="text-[10px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-[#7A2944]/8 text-[#7A2944] border border-[#7A2944]/15">
                  {categoryCounts.VESTIDO} Vestido
                </span>
              )}
            </div>
          )}

          {items.length === 0 ? (
            <div className="luxury-card p-10 text-center">
              {/* Empty state with hanger illustration */}
              <div className="w-20 h-20 mx-auto mb-5 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F7F1E9] to-[#E8DFD6]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shirt className="w-8 h-8 text-[#C9B8A8]" />
                </div>
              </div>
              <p className="text-base font-semibold text-[#3E261E] mb-1" style={{ fontFamily: "var(--font-display)" }}>
                Seu guarda-roupa está vazio
              </p>
              <p className="text-sm text-[#C9B8A8] mb-5">
                Adicione suas primeiras peças para começar a criar looks incríveis
              </p>
              <button
                onClick={() => router.push("/upload")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white press transition-all"
                style={{
                  background: "linear-gradient(135deg, #5C1F33, #7A2944)",
                  boxShadow: "0 4px 16px rgba(92,31,51,0.2)",
                }}
              >
                <Plus className="w-4 h-4" />
                Adicionar peças
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {items.slice(0, 6).map((item, idx) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-[#F7F1E9] hover-lift anim-scale-in cursor-pointer"
                  style={{ animationDelay: `${idx * 80}ms` }}
                  onClick={() => router.push("/wardrobe")}
                >
                  <Image
                    src={item.imageUrl || item.image}
                    alt={item.name || "Peça"}
                    fill
                    sizes="(max-width: 512px) 33vw, 170px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase"
                    style={{ background: "rgba(92,31,51,0.85)", color: "rgba(247,241,233,0.95)" }}
                  >
                    {item.tipo === "SUPERIOR" ? "S" : item.tipo === "INFERIOR" ? "I" : item.tipo === "VESTIDO" ? "V" : "?"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* "View more" hint */}
          {items.length > 6 && (
            <button onClick={() => router.push("/wardrobe")}
              className="w-full mt-3 py-2.5 text-center text-xs font-medium text-[#C9B8A8] hover:text-[#5C1F33] transition-colors press"
            >
              + {items.length - 6} peças no guarda-roupa
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

// ── ActionCard ───────────────────────────────────────
function ActionCard({ icon, label, sublabel, onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass-card rounded-2xl p-5 text-left hover-lift press group transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-[#F7F1E9] group-hover:bg-[#5C1F33]/10 flex items-center justify-center mb-3 transition-colors">
        <span className="text-[#C9B8A8] group-hover:text-[#5C1F33] transition-colors">
          {icon}
        </span>
      </div>
      <p className="text-sm font-semibold text-[#3E261E]">{label}</p>
      <p className="text-xs text-[#C9B8A8] mt-0.5">{sublabel}</p>
    </button>
  )
}

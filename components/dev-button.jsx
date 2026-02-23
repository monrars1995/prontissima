"use client"

import { useState } from "react"
import { flowState } from "@/lib/flow-state"
import { resetApp, fixTrialWardrobe } from "@/lib/wardrobe-storage"

export default function DevButton() {
  const [isOpen, setIsOpen] = useState(false)

  // LIMPAR STORAGE CORROMPIDO - remove TUDO prontissima_ e seta dados LIMPOS
  const handleCleanCorruptedStorage = () => {
    // Remove TODAS as chaves prontissima_
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("prontissima_")) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Seta usuario LIMPO com estrutura correta
    const subscriptionRenewsAt = Date.now() + 30 * 24 * 60 * 60 * 1000
    localStorage.setItem("prontissima_user", JSON.stringify({
      id: crypto.randomUUID(),
      isPremium: true,
      subscriptionRenewsAt: subscriptionRenewsAt,
      credits: {
        plan: 30,
        packs: 0,
      },
    }))
    
    alert("STORAGE LIMPO! Usuario: Premium 30 creditos (plano: 30, packs: 0)")
    window.location.href = "/dashboard"
  }

  // BOTAO PRINCIPAL - SETA PREMIUM 30 CREDITOS (estrutura credits.plan e credits.packs)
  const handleSet30Credits = () => {
    const subscriptionRenewsAt = Date.now() + 30 * 24 * 60 * 60 * 1000
    localStorage.setItem("prontissima_user", JSON.stringify({
      id: crypto.randomUUID(),
      isPremium: true,
      subscriptionRenewsAt: subscriptionRenewsAt,
      credits: {
        plan: 30,
        packs: 0,
      },
    }))
    localStorage.removeItem("prontissima_dev_mode")
    localStorage.removeItem("prontissima_look_history")
    localStorage.removeItem("prontissima_transactions")
    alert("PREMIUM: 30 creditos (plano: 30, packs: 0)")
    window.location.href = "/dashboard"
  }

  // 7. RESET SEGURO - nao apaga chaves internas do Next/V0
  const handleReset = () => {
    if (confirm("Resetar TUDO (inclusive fotos e pecas)?")) {
      localStorage.removeItem("prontissima_user")
      localStorage.removeItem("prontissima_wardrobe")
      localStorage.removeItem("prontissima_flow")
      localStorage.removeItem("prontissima_flow_state")
      localStorage.removeItem("prontissima_dev_mode")
      localStorage.removeItem("prontissima_look_history")
      localStorage.removeItem("prontissima_body_info")
      localStorage.removeItem("prontissima_strategy_seen")
      localStorage.removeItem("prontissima_preferences")
      localStorage.removeItem("prontissima_looks")
      localStorage.removeItem("prontissima_trial_active")
      sessionStorage.clear()
      window.location.href = "/"
    }
  }

  const handleSoftReset = () => {
    // Mantem fotos, pecas e body info - apenas reseta o fluxo e creditos
    const bodyInfo = localStorage.getItem("prontissima_body_info")
    const wardrobe = localStorage.getItem("prontissima_wardrobe")
    
    flowState.reset()
    localStorage.removeItem("prontissima_user")
    localStorage.removeItem("prontissima_trial_active")
    localStorage.removeItem("prontissima_preferences")
    localStorage.removeItem("prontissima_looks")
    
    // Restaurar dados importantes
    if (bodyInfo) localStorage.setItem("prontissima_body_info", bodyInfo)
    if (wardrobe) localStorage.setItem("prontissima_wardrobe", wardrobe)
    
    window.location.href = "/"
  }

  const handleGoToStart = () => {
    flowState.reset()
    window.location.href = "/"
  }

  const handleGoToDashboard = () => {
    flowState.set("READY")
    window.location.href = "/dashboard"
  }

  const handleShowStorage = () => {
    const user = localStorage.getItem("prontissima_user")
    const wardrobe = localStorage.getItem("prontissima_wardrobe")
    const flow = localStorage.getItem("prontissima_flow_state")
    const body = localStorage.getItem("prontissima_body_info")
    
    console.log("=== PRONTISSIMA STORAGE DEBUG ===")
    console.log("User:", user ? JSON.parse(user) : null)
    console.log("Flow:", flow ? JSON.parse(flow) : null)
    console.log("Body:", body ? JSON.parse(body) : null)
    console.log("Wardrobe:", wardrobe ? JSON.parse(wardrobe) : null)
    
    const u = user ? JSON.parse(user) : null
    const creditInfo = u?.credits ? `plano: ${u.credits.plan}, packs: ${u.credits.packs}` : "null"
    alert(`Credits: ${creditInfo}\nPremium: ${u?.isPremium}\nWardrobe: ${wardrobe ? JSON.parse(wardrobe).length + " pecas" : "0 pecas"}`)
  }

  const handleFixWardrobe = () => {
    const result = fixTrialWardrobe()
    alert(result + ". Recarregando...")
    window.location.reload()
  }

  // RESET PARA TRIAL (3 creditos - sem renovacao)
  const handleResetTrial = () => {
    localStorage.setItem("prontissima_user", JSON.stringify({
      id: crypto.randomUUID(),
      isPremium: false,
      subscriptionRenewsAt: null,
      credits: {
        plan: 3,    // Trial = 3 looks
        packs: 0,
      },
    }))
    localStorage.removeItem("prontissima_dev_mode")
    localStorage.removeItem("prontissima_look_history")
    alert("TRIAL: 3 creditos (sem renovacao)")
    window.location.href = "/dashboard"
  }

  // RESET PARA PREMIUM COM PACK EXTRA (30 plano + 10 pack = 40 total)
  const handleResetWithPack = () => {
    const subscriptionRenewsAt = Date.now() + 30 * 24 * 60 * 60 * 1000
    localStorage.setItem("prontissima_user", JSON.stringify({
      id: crypto.randomUUID(),
      isPremium: true,
      subscriptionRenewsAt: subscriptionRenewsAt,
      credits: {
        plan: 30,   // 30 do plano
        packs: 10,  // 10 de pack comprado
      },
    }))
    localStorage.removeItem("prontissima_dev_mode")
    localStorage.removeItem("prontissima_look_history")
    alert("PREMIUM + PACK: 40 creditos (30 plano + 10 pack)")
    window.location.href = "/dashboard"
  }

  // ZERAR CREDITOS (ir para upsell)
  const handleZeroCredits = () => {
    const u = JSON.parse(localStorage.getItem("prontissima_user") || "{}")
    if (!u.credits) u.credits = { plan: 0, packs: 0 }
    u.credits.plan = 0
    u.credits.packs = 0
    localStorage.setItem("prontissima_user", JSON.stringify(u))
    localStorage.removeItem("prontissima_transactions")
    window.location.href = "/limit-reached"
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white rounded-xl shadow-2xl border border-neutral-200 p-2 space-y-1 min-w-[200px] max-h-[70vh] overflow-y-auto">
          {/* NAVEGACAO RAPIDA - SEMPRE NO TOPO */}
          <div className="grid grid-cols-2 gap-1 mb-2">
            <button
              onClick={handleGoToDashboard}
              className="px-2 py-2 text-center text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg"
            >
              DASHBOARD
            </button>
            <button
              onClick={() => { window.location.href = "/settings" }}
              className="px-2 py-2 text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              CONFIG
            </button>
          </div>
          <div className="border-b border-neutral-200 mb-2" />
          {/* BOTAO LIMPAR STORAGE CORROMPIDO */}
          <button
            onClick={handleCleanCorruptedStorage}
            className="w-full px-4 py-3 text-center text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-lg mb-2"
          >
            LIMPAR STORAGE
          </button>
          {/* BOTAO SETAR 30 */}
          <button
            onClick={handleSet30Credits}
            className="w-full px-4 py-2 text-center text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg mb-2"
          >
            SETAR 30 CREDITOS
          </button>
          <div className="border-b border-neutral-200 mb-2" />
          <button
            onClick={handleSoftReset}
            className="w-full px-4 py-2 text-left text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg"
          >
            Resetar Fluxo (manter fotos)
          </button>
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
          >
            Resetar TUDO
          </button>
          <button
            onClick={handleGoToStart}
            className="w-full px-4 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            Ir para Inicio
          </button>
          <button
            onClick={handleShowStorage}
            className="w-full px-4 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            Ver Storage
          </button>
          <button
            onClick={handleFixWardrobe}
            className="w-full px-4 py-2 text-left text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg"
          >
            Corrigir Pecas (3S+2I)
          </button>
          <div className="border-t border-neutral-200 my-2 pt-2">
            <p className="text-xs text-neutral-500 px-2 mb-2">Testar Planos:</p>
          </div>
          <button
            onClick={handleResetTrial}
            className="w-full px-4 py-2 text-left text-sm font-bold text-white bg-gray-500 hover:bg-gray-600 rounded-lg"
          >
            TRIAL (3 sem renovar)
          </button>
          <button
            onClick={handleResetWithPack}
            className="w-full px-4 py-2 text-left text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            PREMIUM + PACK (30+10)
          </button>
          <button
            onClick={handleZeroCredits}
            className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mt-2"
          >
            Zerar (ir upsell)
          </button>
          <div className="border-t border-neutral-200 my-2 pt-2">
            <p className="text-xs text-neutral-500 px-2 mb-2">Telas Especiais:</p>
          </div>
          <button
            onClick={() => { window.location.href = "/wardrobe-analysis-upgrade" }}
            className="w-full px-4 py-2 text-left text-sm font-bold text-[#5C1F33] bg-[#5C1F33]/10 hover:bg-[#5C1F33]/20 rounded-lg"
          >
            Analise PRO (upsell R$35)
          </button>
          <button
            onClick={() => { window.location.href = "/wardrobe-pro-analysis" }}
            className="w-full px-4 py-2 text-left text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg"
          >
            Ver Analise PRO (paga)
          </button>
          <button
            onClick={() => {
              const u = JSON.parse(localStorage.getItem("prontissima_user") || "{}")
              if (u.credits) delete u.credits.analysis
              localStorage.setItem("prontissima_user", JSON.stringify(u))
              localStorage.removeItem("prontissima_transactions")
              alert("Credito de analise resetado!")
              window.location.href = "/wardrobe-analysis-upgrade"
            }}
            className="w-full px-4 py-2 text-left text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg"
          >
            Resetar Analise (testar compra)
          </button>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-neutral-900 text-white rounded-full shadow-xl flex items-center justify-center text-xs font-bold hover:bg-neutral-700 transition-all"
      >
        DEV
      </button>
    </div>
  )
}

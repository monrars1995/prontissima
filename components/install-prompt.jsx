"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const dismissed = sessionStorage.getItem("pwa_prompt_dismissed")
    if (dismissed) return
    if (window.matchMedia("(display-mode: standalone)").matches) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    console.log("[PWA] Install result:", result.outcome)
    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_prompt_dismissed", "true")
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 anim-fade-up max-w-lg mx-auto">
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-[#B8860B]/20"
        style={{ boxShadow: "0 8px 32px rgba(62,38,30,0.12)" }}
      >
        <div className="w-10 h-10 rounded-xl bg-[#5C1F33]/10 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-[#5C1F33]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#3E261E]">Instale o app</p>
          <p className="text-xs text-[#C9B8A8] truncate">Acesse direto da tela inicial</p>
        </div>
        <button onClick={handleInstall}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white press flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #5C1F33, #7A2944)" }}
        >
          Instalar
        </button>
        <button onClick={handleDismiss} className="p-1.5 text-[#C9B8A8] hover:text-[#5C1F33] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

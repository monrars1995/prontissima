"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)

      const hasSeenPrompt = localStorage.getItem("prontissima_install_prompt_seen")
      if (!hasSeenPrompt) {
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log(`[v0] User response to install prompt: ${outcome}`)

    setDeferredPrompt(null)
    setShowPrompt(false)
    localStorage.setItem("prontissima_install_prompt_seen", "true")
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("prontissima_install_prompt_seen", "true")
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-[#5C1F33] to-[#7A2944] text-white p-4 rounded-2xl shadow-2xl border border-white/10 max-w-md mx-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Instale o Prontíssima</h3>
            <p className="text-xs text-white/80 leading-relaxed mb-3">
              Acesso rápido direto na sua tela inicial. Sem precisar da loja de apps.
            </p>

            <Button
              onClick={handleInstall}
              className="w-full h-10 bg-white text-[#5C1F33] hover:bg-white/90 font-medium text-sm rounded-xl"
            >
              Instalar Agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

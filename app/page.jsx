"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppLogo from "@/components/app-logo"

export default function OnboardingPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const flowData = localStorage.getItem("prontissima_flow_state")
      const step = flowData ? JSON.parse(flowData).step : null
      const user = localStorage.getItem("prontissima_user")

      if (step === "READY" && user) {
        router.push("/dashboard")
        return
      } else if (step && step !== "ONBOARDING" && step !== "SPLASH") {
        const routes = {
          SIGNUP: "/signup",
          PERSONAL_ANALYSIS: "/personal-analysis",
          TRIAL: "/trial",
          UPLOAD: "/upload",
          ORGANIZE: "/organize",
          PREFERENCES: "/preferences",
          LOADING: "/loading",
        }
        if (routes[step]) {
          router.push(routes[step])
          return
        }
      }
    } catch (err) {
      // Continue to onboarding
    }
    setChecking(false)
    setTimeout(() => setReady(true), 100)
  }, [router])

  const handleProceed = () => {
    localStorage.setItem("prontissima_flow_state", JSON.stringify({ step: "SIGNUP" }))
    router.push("/signup")
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-wine-gradient flex items-center justify-center">
        <div className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-[#B8860B] animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-[#DAA520] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full relative bg-wine-gradient overflow-hidden">
      {/* Ambient light effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(184, 134, 11, 0.08) 0%, transparent 60%)"
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 70% 80%, rgba(122, 41, 68, 0.2) 0%, transparent 60%)"
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(30, 10, 18, 0.6) 100%)"
        }}
      />

      {/* Logo — centered with entrance animation */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out ${ready ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <AppLogo variant="full" colorMode="gold" size="hero" showTagline className="drop-shadow-lg" />
      </div>

      {/* Bottom CTA area */}
      <div className={`absolute bottom-0 left-0 right-0 pb-16 px-8 flex flex-col items-center gap-5 z-10 transition-all duration-700 delay-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Decorative line */}
        <div className="luxury-divider w-24 mb-2" />

        {/* Gold CTA button */}
        <button
          type="button"
          onClick={handleProceed}
          className="w-full max-w-xs py-4 rounded-full font-bold text-lg tracking-widest uppercase gold-shimmer btn-glow press cursor-pointer"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Começar
        </button>

        {/* Scroll arrow */}
        <button
          onClick={handleProceed}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center cursor-pointer anim-float"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(247,241,233,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

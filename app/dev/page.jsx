"use client"

import { Button } from "@/components/ui/button"
import { userStorage } from "@/lib/user-storage"

export default function DevPage() {
  
  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">PAINEL DEV - CLIQUE AZUL</h1>

      {/* CORRIGIR CREDITOS - Pack de 10 */}
      <Button 
        onClick={() => {
          const u = JSON.parse(localStorage.getItem("prontissima_user") || "{}")
          u.credits = 10
          u.totalCredits = 10
          u.looksCreated = 0
          localStorage.setItem("prontissima_user", JSON.stringify(u))
          // Limpar historico de looks
          localStorage.removeItem("prontissima_look_history")
          alert("CORRIGIDO: 10 creditos. Historico limpo.")
          window.location.href = "/dashboard"
        }} 
        className="w-full max-w-xs h-20 bg-blue-600 hover:bg-blue-700 text-xl font-bold"
      >
        CORRIGIR: 10 CREDITOS
      </Button>

      <Button 
        onClick={() => {
          const u = JSON.parse(localStorage.getItem("prontissima_user") || "{}")
          u.credits = 0
          u.totalCredits = 10
          u.looksCreated = 10
          localStorage.setItem("prontissima_user", JSON.stringify(u))
          window.location.href = "/limit-reached"
        }} 
        className="w-full max-w-xs h-16 bg-red-600 hover:bg-red-700 text-xl font-bold"
      >
        ZERAR CREDITOS
      </Button>

      <Button 
        onClick={() => window.location.href = "/limit-reached"}
        className="w-full max-w-xs h-12 bg-green-600 hover:bg-green-700"
      >
        IR PARA UPSELL
      </Button>

      <Button 
        onClick={() => window.location.href = "/dashboard"}
        variant="outline"
        className="w-full max-w-xs h-12 border-white text-white bg-transparent"
      >
        Dashboard
      </Button>

      <Button 
        onClick={() => {
          localStorage.clear()
          sessionStorage.clear()
          window.location.href = "/"
        }}
        variant="outline"
        className="w-full max-w-xs h-12 border-red-500 text-red-500 bg-transparent"
      >
        Resetar TUDO
      </Button>
    </div>
  )
}

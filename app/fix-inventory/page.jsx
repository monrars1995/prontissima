"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { wardrobeStorage } from "@/lib/wardrobe-storage"
import { Shirt, CircleDot, Sparkles, Check } from "lucide-react"

export default function FixInventoryPage() {
  const router = useRouter()
  const [pieces, setPieces] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [saved, setSaved] = useState(0)

  useEffect(() => {
    const wardrobe = wardrobeStorage.getItems()
    // Filtra pecas que NAO foram verificadas manualmente
    const unverified = wardrobe.filter(p => !p.manualVerified)
    setPieces(unverified)
  }, [])

  const updatePiece = (tipo) => {
    const currentPiece = pieces[currentIndex]
    
    // Atualiza no localStorage
    const wardrobe = JSON.parse(localStorage.getItem("prontissima_wardrobe") || "[]")
    const updated = wardrobe.map(p => 
      p.id === currentPiece.id || p.name === currentPiece.name
        ? { ...p, tipo, manualVerified: true, categoria: tipo === "VESTIDO" ? "vestido" : tipo === "INFERIOR" ? "calca" : "blusa" }
        : p
    )
    localStorage.setItem("prontissima_wardrobe", JSON.stringify(updated))
    
    setSaved(s => s + 1)
    
    // Proxima peca
    if (currentIndex < pieces.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Terminou
      router.push("/dashboard")
    }
  }

  // Se nao tem pecas para classificar
  if (pieces.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Check className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Tudo Classificado!</h1>
        <p className="text-muted-foreground mb-6">Seu armario esta pronto para criar looks.</p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-[#5C1F33] text-white rounded-full font-medium"
        >
          Ir para Dashboard
        </button>
      </div>
    )
  }

  const currentPiece = pieces[currentIndex]
  const remaining = pieces.length - currentIndex

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-background flex flex-col">
      {/* Header */}
      <div className="p-4 text-center border-b bg-amber-100">
        <h1 className="text-lg font-bold text-amber-900">Classificacao Expressa</h1>
        <p className="text-sm text-amber-700">
          {remaining} peca{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} | {saved} salva{saved > 1 ? 's' : ''}
        </p>
      </div>

      {/* Imagem da peca */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white">
            <img 
              src={currentPiece.image || "/placeholder.svg"} 
              alt={currentPiece.name}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center mt-3 text-sm text-muted-foreground truncate">
            {currentPiece.name}
          </p>
        </div>
      </div>

      {/* Botoes de classificacao */}
      <div className="p-6 pb-10 space-y-3">
        <p className="text-center text-sm font-medium mb-4">O que e essa peca?</p>
        
        <button
          onClick={() => updatePiece("SUPERIOR")}
          className="w-full p-5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          <Shirt className="w-7 h-7" />
          SUPERIOR (Blusa, Camisa, Top)
        </button>

        <button
          onClick={() => updatePiece("INFERIOR")}
          className="w-full p-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          <CircleDot className="w-7 h-7" />
          INFERIOR (Calca, Saia, Short)
        </button>

        <button
          onClick={() => updatePiece("VESTIDO")}
          className="w-full p-5 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          <Sparkles className="w-7 h-7" />
          VESTIDO (Peca Unica)
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-neutral-200">
        <div 
          className="h-full bg-[#5C1F33] transition-all"
          style={{ width: `${((currentIndex + 1) / pieces.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

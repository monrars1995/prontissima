"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check } from "lucide-react"

export default function OrganizePage() {
  const router = useRouter()
  const [pieces, setPieces] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem("prontissima_wardrobe")
    if (raw) {
      setPieces(JSON.parse(raw))
    }
  }, [])

  function handleSelect(p) {
    console.log("[v0] Selecionando:", p.name, p.tipo)
    setSelected(p)
  }

  function moveTo(tipo) {
    console.log("[v0] Movendo para:", tipo, "peca:", selected?.name)
    if (!selected) return
    
    const updated = pieces.map(p => {
      if (p.name === selected.name) {
        return { ...p, tipo: tipo }
      }
      return p
    })
    
    localStorage.setItem("prontissima_wardrobe", JSON.stringify(updated))
    setPieces(updated)
    setSelected(null)
  }

  const blusas = pieces.filter(p => p.tipo === "SUPERIOR")
  const calcas = pieces.filter(p => p.tipo === "INFERIOR")
  const vestidos = pieces.filter(p => p.tipo === "VESTIDO")

  return (
    <div className="min-h-screen bg-neutral-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Organizar ({pieces.length} pecas)</h1>
        </div>

        {!selected && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-center text-blue-800">
            Toque em uma peca para mover
          </div>
        )}

        {selected && (
          <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src={selected.image || "/placeholder.svg"} 
                alt="" 
                className="w-16 h-16 object-cover rounded-lg border-2 border-amber-500"
              />
              <div>
                <p className="font-bold text-amber-900">SELECIONADA</p>
                <p className="text-sm text-amber-700">{selected.name}</p>
              </div>
            </div>
            
            <p className="text-center font-bold text-amber-800">Mover para:</p>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                type="button"
                onClick={() => moveTo("SUPERIOR")}
                className="h-16 bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg"
              >
                BLUSA
              </Button>
              <Button 
                type="button"
                onClick={() => moveTo("INFERIOR")}
                className="h-16 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg"
              >
                CALCA
              </Button>
              <Button 
                type="button"
                onClick={() => moveTo("VESTIDO")}
                className="h-16 bg-purple-500 hover:bg-purple-600 text-white font-bold text-lg"
              >
                VESTIDO
              </Button>
            </div>
            
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setSelected(null)}
              className="w-full bg-white"
            >
              Cancelar
            </Button>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 border">
          <h2 className="font-bold text-rose-600 mb-3 text-lg">Blusas ({blusas.length})</h2>
          {blusas.length === 0 ? (
            <p className="text-neutral-400 text-center py-4">Nenhuma blusa</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {blusas.map((p, i) => (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  onPointerDown={() => handleSelect(p)}
                  style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                  className={`aspect-square rounded-lg overflow-hidden border-4 transition-transform ${
                    selected?.name === p.name 
                      ? "border-amber-500 scale-105" 
                      : "border-rose-200"
                  }`}
                >
                  <img src={p.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <h2 className="font-bold text-blue-600 mb-3 text-lg">Calcas ({calcas.length})</h2>
          {calcas.length === 0 ? (
            <p className="text-neutral-400 text-center py-4">Nenhuma calca</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {calcas.map((p, i) => (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  onPointerDown={() => handleSelect(p)}
                  style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                  className={`aspect-square rounded-lg overflow-hidden border-4 transition-transform ${
                    selected?.name === p.name 
                      ? "border-amber-500 scale-105" 
                      : "border-blue-200"
                  }`}
                >
                  <img src={p.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <h2 className="font-bold text-purple-600 mb-3 text-lg">Vestidos ({vestidos.length})</h2>
          {vestidos.length === 0 ? (
            <p className="text-neutral-400 text-center py-4">Nenhum vestido</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {vestidos.map((p, i) => (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  onPointerDown={() => handleSelect(p)}
                  style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                  className={`aspect-square rounded-lg overflow-hidden border-4 transition-transform ${
                    selected?.name === p.name 
                      ? "border-amber-500 scale-105" 
                      : "border-purple-200"
                  }`}
                >
                  <img src={p.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>

        <Button 
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-full h-14 bg-[#5C1F33] hover:bg-[#4a1829] text-lg font-bold"
        >
          <Check className="w-5 h-5 mr-2" />
          Concluir
        </Button>
      </div>
    </div>
  )
}

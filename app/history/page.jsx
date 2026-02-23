"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2 } from "lucide-react"
import { looksStorage } from "@/lib/wardrobe-storage"

export default function HistoryPage() {
  const router = useRouter()
  const [looks, setLooks] = useState([])
  const [deletingId, setDeletingId] = useState(null)
  // </CHANGE>

  useEffect(() => {
    const savedLooks = looksStorage.getLooks()
    console.log("[v0] Historico - Looks carregados:", savedLooks.length)
    console.log("[v0] Historico - Dados:", JSON.stringify(savedLooks.map(l => ({ id: l.id, mood: l.mood, occasion: l.occasion }))))
    setLooks(savedLooks)
  }, [])

  const handleDeleteLook = (id, e) => {
    e.stopPropagation()
    setDeletingId(id)
  }

  const confirmDelete = () => {
    if (!deletingId) return
    looksStorage.deleteLook(deletingId)
    setLooks(looksStorage.getLooks())
    setDeletingId(null)
  }
  // </CHANGE>

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-light tracking-tight text-foreground">Historico de Looks</h1>
          </div>
          {looks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Apagar TODO o historico de looks?")) {
                  localStorage.removeItem("prontissima_looks")
                  setLooks([])
                }
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Tudo
            </Button>
          )}
        </div>

        {looks.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground">Você ainda não criou nenhum look</p>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Criar primeiro look
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {looks.map((look) => (
              <div
                key={look.id}
                className="w-full border border-border rounded-lg p-4 hover:border-foreground/50 transition-colors relative group"
              >
                <button
                  onClick={(e) => handleDeleteLook(look.id, e)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white hover:bg-red-50 border border-neutral-200 hover:border-red-300 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 active:scale-90"
                  title="Apagar look"
                >
                  <Trash2 className="w-4 h-4 text-neutral-600 hover:text-red-600" />
                </button>
                {/* </CHANGE> */}

                <button onClick={() => router.push(`/look-detail?id=${look.id}`)} className="w-full text-left">
                  <div className="flex items-start gap-4">
                    <div className="grid grid-cols-2 gap-1 w-24 flex-shrink-0">
                      {(look.pieces || []).slice(0, 4).map((piece, idx) => (
                        <div key={idx} className="aspect-square">
                          <img
                            src={piece.image || "/placeholder.svg"}
                            alt=""
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-medium text-foreground capitalize">
                        {look.mood} • {look.occasion}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(look.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-neutral-900">Apagar este look?</h3>
            <p className="text-sm text-neutral-600">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button
                onClick={() => setDeletingId(null)}
                variant="outline"
                className="flex-1 h-11 active:scale-95 transition-transform"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white active:scale-95 transition-transform"
              >
                Apagar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* </CHANGE> */}
    </div>
  )
}

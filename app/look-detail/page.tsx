"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock } from "lucide-react"
import { looksStorage } from "@/lib/wardrobe-storage"
import { userStorage } from "@/lib/user-storage"

function LookDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lookId = searchParams.get("id")
  const [look, setLook] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(userStorage.getUser())
    if (lookId) {
      const foundLook = looksStorage.getLookById(lookId)
      setLook(foundLook)
    }
  }, [lookId])

  if (!look) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Look não encontrado</p>
      </div>
    )
  }

  const isPremium = user?.isPremium

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-light tracking-tight text-foreground capitalize">
              {look.mood} • {look.occasion}
            </h1>
            <p className="text-xs text-muted-foreground">{new Date(look.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>

        {/* Look A */}
        <div className="space-y-4 border border-border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground">Look A - Editorial</h2>
          <div className="grid grid-cols-2 gap-3">
            {look.pieces.slice(0, 4).map((piece, idx) => (
              <div key={idx} className="aspect-square">
                <img
                  src={piece.image || "/placeholder.svg"}
                  alt={piece.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{look.lookA}</p>
        </div>

        {/* Look B */}
        <div className="space-y-4 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Look B - Seguro</h2>
            {!isPremium && <Lock className="w-4 h-4 text-muted-foreground" />}
          </div>

          {isPremium ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {look.pieces.slice(0, 4).map((piece, idx) => (
                  <div key={idx} className="aspect-square">
                    <img
                      src={piece.image || "/placeholder.svg"}
                      alt={piece.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{look.lookB}</p>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 relative">
                <div className="absolute inset-0 backdrop-blur-xl bg-background/50 rounded-lg flex items-center justify-center z-10">
                  <Lock className="w-12 h-12 text-muted-foreground" />
                </div>
                {look.pieces.slice(0, 4).map((piece, idx) => (
                  <div key={idx} className="aspect-square">
                    <img
                      src={piece.image || "/placeholder.svg"}
                      alt="Bloqueado"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
              <Button
                onClick={() => router.push("/paywall")}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
              >
                Desbloquear com Premium
              </Button>
            </>
          )}
        </div>

        {isPremium && (
          <Button
            onClick={() => router.push(`/loading?mood=${look.mood}&occasion=${look.occasion}`)}
            variant="outline"
            className="w-full"
          >
            Gerar Variação
          </Button>
        )}
      </div>
    </div>
  )
}

export default function LookDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LookDetailContent />
    </Suspense>
  )
}

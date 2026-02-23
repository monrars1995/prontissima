"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { looksStorage } from "@/lib/wardrobe-storage"

export default function GalleryPage() {
  const router = useRouter()
  const [looks, setLooks] = useState<any[]>([])

  useEffect(() => {
    const savedLooks = looksStorage.getLooks()
    setLooks(savedLooks)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <div>
          <h1 className="text-3xl font-serif tracking-tight">Meus Looks</h1>
          <p className="text-sm text-muted-foreground mt-1">{looks.length} looks salvos</p>
        </div>

        {looks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Você ainda não criou nenhum look</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {looks.map((look) => (
              <button
                key={look.id}
                onClick={() => router.push(`/look-detail?lookId=${look.id}&variant=A`)}
                className="group"
              >
                <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-2">
                  <img
                    src={look.imageA || "/placeholder.svg"}
                    alt="Look"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-left space-y-1">
                  <p className="text-sm font-medium capitalize">{look.occasion}</p>
                  <p className="text-xs text-muted-foreground capitalize">{look.mood}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

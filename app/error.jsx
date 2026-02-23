"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-foreground">Algo deu errado</h1>
          <p className="text-sm text-muted-foreground">
            Encontramos um erro inesperado. Tente novamente ou entre em contato com o suporte.
          </p>
        </div>
        <div className="space-y-3">
          <Button onClick={() => reset()} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90">
            Tentar novamente
          </Button>
          <Button onClick={() => (window.location.href = "/dashboard")} variant="outline" className="w-full">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

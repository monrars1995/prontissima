import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-light tracking-tight text-foreground">404</h1>
          <p className="text-sm text-muted-foreground">Página não encontrada</p>
        </div>
        <Link href="/dashboard">
          <Button className="bg-foreground text-background hover:bg-foreground/90">Voltar ao Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

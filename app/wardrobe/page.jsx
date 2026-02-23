"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WardrobePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/wardrobe-edit")
  }, [router])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <p className="text-neutral-500">Redirecionando...</p>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { userStorage } from "@/lib/user-storage"

export default function CreditsBadge() {
  const [credits, setCredits] = useState(null)

  useEffect(() => {
    const user = userStorage.getUser()
    if (user) {
      setCredits(user.credits)
    }
  }, [])

  if (credits === null) return null

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full shadow-sm">
      <Sparkles className="w-4 h-4 text-[#5C1F33]" />
      <span className="text-sm font-medium text-neutral-900">
        {credits} {credits === 1 ? "crédito" : "créditos"}
      </span>
    </div>
  )
}

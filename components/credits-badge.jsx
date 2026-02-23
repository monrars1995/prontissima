"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { userStorage } from "@/lib/user-storage"

export default function CreditsBadge() {
  const [total, setTotal] = useState(null)

  useEffect(() => {
    const user = userStorage.getUser()
    if (user?.credits) {
      setTotal((user.credits.plan || 0) + (user.credits.packs || 0))
    }
  }, [])

  if (total === null) return null

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DFD6] rounded-full shadow-sm">
      <Sparkles className="w-4 h-4 text-[#5C1F33]" />
      <span className="text-sm font-medium text-[#3E261E]">
        {total} {total === 1 ? "crédito" : "créditos"}
      </span>
    </div>
  )
}

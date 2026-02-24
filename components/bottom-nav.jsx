"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Plus, Sparkles, Grid3X3, User } from "lucide-react"

const NAV_ITEMS = [
    { icon: Home, label: "Início", path: "/dashboard" },
    { icon: Plus, label: "Upload", path: "/upload" },
    { icon: Sparkles, label: "Criar", path: "/preferences", accent: true },
    { icon: Grid3X3, label: "Gavetas", path: "/wardrobe" },
    { icon: User, label: "Perfil", path: "/settings" },
]

export default function BottomNav() {
    const pathname = usePathname()
    const router = useRouter()

    // Only show on dashboard-related pages
    const showOn = ["/dashboard", "/wardrobe", "/history", "/settings", "/upload"]
    if (!showOn.some(p => pathname?.startsWith(p))) return null

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
            <div className="bg-white/90 backdrop-blur-xl border-t border-[#E8DFD6]/60 px-2 pt-2 pb-1">
                <div className="flex items-center justify-around max-w-lg mx-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.path
                        const Icon = item.icon
                        return (
                            <button
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all press ${isActive ? "text-[#5C1F33]" : "text-[#C9B8A8]"
                                    }`}
                            >
                                {item.accent ? (
                                    <div className={`w-10 h-10 -mt-4 rounded-xl flex items-center justify-center shadow-md ${isActive ? "bg-[#5C1F33]" : "bg-[#5C1F33]/80"
                                        }`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                ) : (
                                    <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-[#5C1F33]" : ""}`} />
                                )}
                                <span className={`text-[10px] font-medium tracking-wide ${isActive ? "text-[#5C1F33]" : ""
                                    }`}>
                                    {item.label}
                                </span>
                                {isActive && !item.accent && (
                                    <div className="w-1 h-1 rounded-full bg-[#5C1F33] mt-0.5" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}

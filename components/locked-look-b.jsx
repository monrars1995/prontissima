"use client"

import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"

/**
 * LockedLookB — Premium blurred/locked state with luxury styling
 */
export default function LockedLookB({ pieces = [] }) {
    const router = useRouter()

    return (
        <div className="luxury-card p-8 relative space-y-6 anim-fade-up">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-[#3E261E]">Look B</h2>
                <div className="flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase font-semibold text-[#B8860B] bg-[#B8860B]/8 px-4 py-1.5 rounded-full border border-[#B8860B]/15">
                    <Lock className="w-3.5 h-3.5" />
                    Bloqueado
                </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-2xl bg-[#FDF9F5]/80 flex flex-col items-center justify-center z-10 p-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: "linear-gradient(135deg, rgba(184,134,11,0.1), rgba(92,31,51,0.1))" }}
                    >
                        <Lock className="w-7 h-7 text-[#B8860B]" />
                    </div>
                    <p className="text-xl font-bold text-[#3E261E] mb-1 text-center">Segunda Opção</p>
                    <p className="text-sm text-[#8C7865] text-center mb-5">
                        Ative o teste grátis para desbloquear
                    </p>
                    <div className="bg-[#2D6A4F]/6 border border-[#2D6A4F]/15 rounded-xl p-4 text-center w-full">
                        <p className="text-sm font-bold text-[#2D6A4F]">🎁 3 Dias OU 3 Looks Grátis</p>
                        <p className="text-xs text-[#2D6A4F]/70 mt-1">Acesso total · Cancele quando quiser</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 opacity-15">
                    {pieces.map((piece, idx) => (
                        <div key={idx} className="aspect-square">
                            <img
                                src={piece.image || "/placeholder.svg"}
                                alt="Bloqueado"
                                className="w-full h-full object-cover rounded-xl"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={() => router.push("/paywall")}
                className="w-full py-4 rounded-2xl font-bold text-base tracking-wide text-white press"
                style={{
                    background: "linear-gradient(135deg, #2D6A4F 0%, #3D8B6E 50%, #2D6A4F 100%)",
                    boxShadow: "0 6px 24px rgba(45, 106, 79, 0.25)",
                    fontFamily: "var(--font-body)",
                }}
            >
                🎁 Ativar Teste Grátis e Ver Look B
            </button>
        </div>
    )
}

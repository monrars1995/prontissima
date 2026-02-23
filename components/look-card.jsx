"use client"

import { Save } from "lucide-react"
import LookComposition from "@/components/look-composition"
import LookStylingDetails from "@/components/look-styling-details"

/**
 * LookCard — Luxury look card with header, pieces, styling, and save button
 */
export default function LookCard({
    title,
    badge,
    badgeColor = "green",
    lookData,
    pieces,
    getStyling,
    onSave,
    saved,
    children,
}) {
    const badgeStyles = {
        green: {
            text: "text-[#2D6A4F]",
            bg: "bg-[#2D6A4F]/8",
            border: "border-[#2D6A4F]/15",
        },
        amber: {
            text: "text-[#B8860B]",
            bg: "bg-[#B8860B]/8",
            border: "border-[#B8860B]/15",
        },
    }

    const style = badgeStyles[badgeColor]

    return (
        <div className="luxury-card p-8 space-y-6 anim-fade-up">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-[#3E261E]">{title}</h2>
                <span className={`text-xs tracking-[0.1em] uppercase font-semibold ${style.text} ${style.bg} px-4 py-1.5 rounded-full border ${style.border}`}>
                    {badge}
                </span>
            </div>

            {children}

            <LookComposition pieces={pieces} title="Suas Peças Selecionadas" />
            <LookStylingDetails lookData={lookData} getStyling={getStyling} />

            {onSave && (
                <button
                    onClick={onSave}
                    className={`w-full py-4 rounded-2xl font-bold text-base tracking-wide press transition-all duration-300 flex items-center justify-center gap-2 ${saved
                            ? "bg-[#2D6A4F] text-white shadow-lg"
                            : "text-white"
                        }`}
                    style={saved ? {} : {
                        background: "linear-gradient(135deg, #5C1F33 0%, #7A2944 50%, #5C1F33 100%)",
                        boxShadow: "0 6px 24px rgba(92, 31, 51, 0.2)",
                    }}
                >
                    <Save className="w-5 h-5" />
                    {saved ? "Look Salvo no Histórico!" : "Salvar Este Look"}
                </button>
            )}
        </div>
    )
}

"use client"

/**
 * LookStylingDetails — Luxury styling suggestion display
 */
export default function LookStylingDetails({ lookData, getStyling }) {
    if (!lookData) return null

    return (
        <div className="space-y-5 pt-4">
            <div className="bg-gradient-to-br from-[#F7F1E9] to-[#F0EAE0] p-6 rounded-2xl border border-[#E8DFD6]/60 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <p className="text-xs tracking-[0.15em] uppercase font-semibold text-[#5C1F33]">👠 Sapato</p>
                        <p className="text-sm text-[#3E261E] leading-relaxed">{getStyling(lookData, "sapato")}</p>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-xs tracking-[0.15em] uppercase font-semibold text-[#5C1F33]">👜 Bolsa</p>
                        <p className="text-sm text-[#3E261E] leading-relaxed">{getStyling(lookData, "bolsa")}</p>
                    </div>
                </div>

                <div className="luxury-divider" />

                <div className="space-y-1.5">
                    <p className="text-xs tracking-[0.15em] uppercase font-semibold text-[#5C1F33]">
                        💎 Bijouteria & Acessórios
                    </p>
                    <p className="text-sm text-[#3E261E] leading-relaxed">
                        {Array.isArray(lookData?.acessorios)
                            ? lookData.acessorios.join(" · ")
                            : getStyling(lookData, "acessorios")}
                    </p>
                </div>

                <div className="luxury-divider" />

                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <p className="text-xs tracking-[0.15em] uppercase font-semibold text-[#5C1F33]">💇‍♀️ Cabelo</p>
                        <p className="text-sm text-[#3E261E] leading-relaxed">{getStyling(lookData, "cabelo")}</p>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-xs tracking-[0.15em] uppercase font-semibold text-[#5C1F33]">💄 Maquiagem</p>
                        <p className="text-sm text-[#3E261E] leading-relaxed">{getStyling(lookData, "maquiagem")}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-[#5C1F33]/6 to-[#B8860B]/6 p-6 rounded-2xl border border-[#E8DFD6]/40">
                <p className="text-xs tracking-[0.15em] uppercase font-semibold text-[#5C1F33] mb-3">
                    Por que este look funciona para você
                </p>
                <p className="text-sm text-[#3E261E] leading-relaxed">{lookData?.porqueFunciona}</p>
            </div>
        </div>
    )
}

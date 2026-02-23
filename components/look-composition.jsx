"use client"

export default function LookComposition({ pieces, title }) {
  if (!pieces || pieces.length === 0) {
    return (
      <div className="bg-neutral-100 rounded-2xl p-8 text-center">
        <p className="text-neutral-500">Nenhuma peça selecionada</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-neutral-50 to-amber-50/30 p-6 rounded-2xl border-2 border-[#E8DFD6] space-y-4">
      <p className="text-sm uppercase tracking-wider text-[#5C1F33] font-bold text-center">
        {title || "Look Completo"} ({pieces.length} peças)
      </p>

      {/* Composição visual estilo revista de moda */}
      <div className="relative bg-white rounded-xl p-6 shadow-inner min-h-[400px] flex items-center justify-center">
        {pieces.length === 1 ? (
          // Look com 1 peça (vestido)
          <div className="w-full max-w-sm">
            <img
              src={pieces[0].image || "/placeholder.svg"}
              alt={pieces[0].name}
              className="w-full h-auto object-contain rounded-xl shadow-2xl border-4 border-white"
            />
          </div>
        ) : pieces.length === 2 ? (
          // Look com 2 peças (superior + inferior) - Layout estilo revista
          <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
            <div className="space-y-2">
              <div className="aspect-square relative group overflow-hidden rounded-xl shadow-xl">
                <img
                  src={pieces[0].image || "/placeholder.svg"}
                  alt={pieces[0].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-sm font-semibold">{pieces[0].name}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="aspect-square relative group overflow-hidden rounded-xl shadow-xl">
                <img
                  src={pieces[1].image || "/placeholder.svg"}
                  alt={pieces[1].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-sm font-semibold">{pieces[1].name}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Look com 3+ peças - Grid adaptativo
          <div className={`grid ${pieces.length === 3 ? "grid-cols-3" : "grid-cols-2"} gap-4 w-full`}>
            {pieces.map((piece, idx) => (
              <div key={idx} className="aspect-square relative group overflow-hidden rounded-xl shadow-xl">
                <img
                  src={piece.image || "/placeholder.svg"}
                  alt={piece.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-xs font-semibold">{piece.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags de categorias das pecas COM TIPO */}
      <div className="flex flex-wrap gap-2 justify-center">
        {pieces.map((piece, idx) => (
          <span key={idx} className="text-xs font-semibold px-3 py-1 bg-[#5C1F33] text-white rounded-full">
            {piece.tipo || "PECA"}: {piece.name.split(".")[0]}
          </span>
        ))}
      </div>
    </div>
  )
}

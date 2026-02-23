"use client"

import { useState } from "react"
import { colorAnalyzer } from "@/lib/color-analyzer"

export function ColorValidator({ detectedColor, onConfirm, onColorChange }) {
  const [showPicker, setShowPicker] = useState(false)

  if (!detectedColor) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl p-4 border border-neutral-100 animate-in slide-in-from-bottom-5 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full border-2 border-neutral-200 shadow-inner"
            style={{ 
              backgroundColor: detectedColor.rgb 
                ? `rgb(${detectedColor.rgb.r}, ${detectedColor.rgb.g}, ${detectedColor.rgb.b})` 
                : '#888' 
            }}
          />
          <div>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Cor Detectada</p>
            <h3 className="text-lg font-black text-neutral-900 leading-tight">{detectedColor.name}</h3>
            {detectedColor.isLowConfidence && (
              <p className="text-xs text-amber-600">Confianca baixa - verifique</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowPicker(!showPicker)}
            className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Trocar
          </button>
          <button 
            onClick={() => onConfirm(detectedColor)}
            className="px-6 py-2 bg-neutral-900 text-white text-sm font-bold rounded-xl active:scale-95 transition-transform"
          >
            Confirmar
          </button>
        </div>
      </div>

      {showPicker && (
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-3">Selecione a cor correta</p>
          <div className="grid grid-cols-6 gap-2">
            {colorAnalyzer.VEST_AI_COLORS.map((color) => (
              <button
                key={color.slug}
                onClick={() => {
                  onColorChange({
                    name: color.name,
                    slug: color.slug,
                    rgb: { r: color.r, g: color.g, b: color.b },
                    isLowConfidence: false,
                    confidence: 'manual'
                  })
                  setShowPicker(false)
                }}
                className="w-10 h-10 rounded-full border-2 border-neutral-200 hover:border-neutral-900 hover:scale-110 transition-all"
                style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

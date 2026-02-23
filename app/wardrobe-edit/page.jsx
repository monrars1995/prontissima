"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Shirt, ChevronDown } from "lucide-react"
import { wardrobeStorage } from "@/lib/wardrobe-storage"
import AppLogo from "@/components/app-logo"

const TIPOS = [
  { value: "SUPERIOR", label: "SUPERIOR (Blusa/Camisa/Top)", color: "bg-blue-100 text-blue-800" },
  { value: "INFERIOR", label: "INFERIOR (Calca/Saia/Short)", color: "bg-green-100 text-green-800" },
  { value: "VESTIDO", label: "VESTIDO (Peca unica)", color: "bg-purple-100 text-purple-800" },
]

export default function WardrobeEditPage() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const wardrobeItems = wardrobeStorage.getItems()
    setItems(wardrobeItems)
  }, [])

  const handleTypeChange = (index, newType) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      tipo: newType,
      manualVerified: true,
    }
    setItems(updatedItems)
    setHasChanges(true)
  }

  const handleSave = () => {
    setSaving(true)
    
    // Salvar no localStorage
    localStorage.setItem("prontissima_wardrobe", JSON.stringify(items))
    
    // Contar tipos
    const tipos = items.reduce((acc, item) => {
      acc[item.tipo] = (acc[item.tipo] || 0) + 1
      return acc
    }, {})
    
    setTimeout(() => {
      setSaving(false)
      setHasChanges(false)
      alert(`Salvo com sucesso!\n\nSUPERIOR: ${tipos.SUPERIOR || 0}\nINFERIOR: ${tipos.INFERIOR || 0}\nVESTIDO: ${tipos.VESTIDO || 0}`)
    }, 500)
  }

  const countTypes = () => {
    return items.reduce((acc, item) => {
      acc[item.tipo] = (acc[item.tipo] || 0) + 1
      return acc
    }, {})
  }

  const tipos = countTypes()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <AppLogo size="sm" />
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving}
            size="sm"
            className="bg-[#5C1F33] hover:bg-[#4a1829]"
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </header>

      <main className="p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Titulo */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold">Editar Tipos de Pecas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Classifique cada peca corretamente
            </p>
          </div>

          {/* Contagem */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-800">{tipos.SUPERIOR || 0}</div>
              <div className="text-xs text-blue-600">Superior</div>
            </div>
            <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-800">{tipos.INFERIOR || 0}</div>
              <div className="text-xs text-green-600">Inferior</div>
            </div>
            <div className="text-center px-4 py-2 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-800">{tipos.VESTIDO || 0}</div>
              <div className="text-xs text-purple-600">Vestido</div>
            </div>
          </div>

          {/* Aviso se nao tem INFERIOR */}
          {(tipos.INFERIOR || 0) === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              <strong>Atencao:</strong> Voce nao tem nenhuma peca INFERIOR (calca/saia). 
              Classifique pelo menos 3 pecas como INFERIOR para criar looks combinados.
            </div>
          )}

          {/* Lista de pecas */}
          <div className="space-y-3">
            {items.map((item, index) => (
              <div 
                key={item.id || index} 
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border shadow-sm"
              >
                {/* Imagem */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100">
                  <img 
                    src={item.image || "/placeholder.svg"} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground truncate mb-1">
                    {item.name}
                  </div>
                  <div className="text-xs text-neutral-500 mb-2">
                    Cor: {item.cor || "N/A"}
                  </div>
                  
                  {/* Selector de tipo */}
                  <select
                    value={item.tipo || "SUPERIOR"}
                    onChange={(e) => handleTypeChange(index, e.target.value)}
                    className={`w-full text-xs font-semibold px-2 py-1.5 rounded-lg border-2 cursor-pointer ${
                      item.tipo === "INFERIOR" 
                        ? "bg-green-100 border-green-300 text-green-800"
                        : item.tipo === "VESTIDO"
                          ? "bg-purple-100 border-purple-300 text-purple-800"
                          : "bg-blue-100 border-blue-300 text-blue-800"
                    }`}
                  >
                    <option value="SUPERIOR">SUPERIOR (Blusa/Camisa)</option>
                    <option value="INFERIOR">INFERIOR (Calca/Saia)</option>
                    <option value="VESTIDO">VESTIDO</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma peca no guarda-roupa
            </div>
          )}
        </div>
      </main>

      {/* Botao fixo de salvar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full h-12 bg-[#5C1F33] hover:bg-[#4a1829]"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alteracoes"}
          </Button>
        </div>
      )}
    </div>
  )
}

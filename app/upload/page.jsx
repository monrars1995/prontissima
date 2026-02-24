"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, X, Shirt, CircleDot, ChevronLeft, Camera, AlertCircle } from "lucide-react"
import { wardrobeStorage } from "@/lib/wardrobe-storage"
import { flowState } from "@/lib/flow-state"
import { userStorage } from "@/lib/user-storage"
import { colorAnalyzer } from "@/lib/color-analyzer"
import AppLogo from "@/components/app-logo"

const MAX_PIECES = 50
const TRIAL_MAX = 5
const TRIAL_MIN = 5
const TRIAL_SUPERIOR = 3
const TRIAL_INFERIOR = 2

export default function UploadPage() {
  const router = useRouter()
  const [pieces, setPieces] = useState({ SUPERIOR: [], INFERIOR: [], VESTIDO: [] })
  const [uploadError, setUploadError] = useState("")
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 5 })
  const [isTrial, setIsTrial] = useState(false)
  const [maxPieces, setMaxPieces] = useState(TRIAL_MAX)
  const [toast, setToast] = useState(null) // Replaces alert()

  const superiorInputRef = useRef(null)
  const inferiorInputRef = useRef(null)
  const vestidoInputRef = useRef(null)

  useEffect(() => {
    flowState.validate("UPLOAD", router)
    loadSavedPieces()
    const user = userStorage.get()
    const plan = user?.plan || "TRIAL"
    const wardrobeLimit = userStorage.getWardrobeLimit()
    setIsTrial(plan === "TRIAL")
    setMaxPieces(wardrobeLimit)
  }, [router])

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (message, type = "warning") => {
    setToast({ message, type })
  }

  const loadSavedPieces = () => {
    const savedItems = wardrobeStorage.getItems()
    const organized = { SUPERIOR: [], INFERIOR: [], VESTIDO: [] }
    savedItems.forEach(item => {
      const tipo = item.tipo || "SUPERIOR"
      if (organized[tipo]) organized[tipo].push(item)
      else organized.SUPERIOR.push(item)
    })
    setPieces(organized)
    updateStorageInfo()
  }

  const updateStorageInfo = () => {
    const wardrobeData = localStorage.getItem("prontissima_wardrobe") || "[]"
    const usedMB = new Blob([wardrobeData]).size / (1024 * 1024)
    setStorageInfo({ used: usedMB, total: 5 })
  }

  const handleFolderClick = (folderType) => {
    if (folderType === "SUPERIOR") superiorInputRef.current?.click()
    else if (folderType === "INFERIOR") inferiorInputRef.current?.click()
    else if (folderType === "VESTIDO") vestidoInputRef.current?.click()
  }

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"))
      reader.onload = (e) => {
        const img = new Image()
        img.onerror = () => reject(new Error("Erro ao carregar imagem"))
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height
          const maxDimension = 800
          if (width > maxDimension || height > maxDimension) {
            if (width > height) { height = (height / width) * maxDimension; width = maxDimension }
            else { width = (width / height) * maxDimension; height = maxDimension }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0, width, height)
          let quality = 0.6
          let compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
          while (compressedDataUrl.length > 200 * 1024 && quality > 0.3) {
            quality -= 0.1
            compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
          }
          resolve(compressedDataUrl)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleUploadToFolder = async (folderType, e) => {
    setUploadError("")
    const file = e.target.files?.[0]
    if (!file) return

    if (!userStorage.canAddPiece()) {
      const limit = userStorage.getWardrobeLimit()
      showToast(`Limite de ${limit} peças atingido. Remova uma peça para adicionar outra.`)
      e.target.value = ""
      return
    }

    if (!file.type.startsWith("image/")) {
      showToast("Por favor, selecione apenas imagens", "error")
      return
    }

    try {
      const compressedImage = await compressImage(file)
      const colorResult = await colorAnalyzer.analyzeImageColor(compressedImage)
      const metadata = {
        cor: colorResult.name,
        colorSlug: colorResult.slug,
        colorRgb: colorResult.rgb,
        tipo: folderType,
        categoria: folderType === "VESTIDO" ? "vestido" : folderType === "INFERIOR" ? "calca" : "blusa",
        manualVerified: true,
      }

      const saved = await wardrobeStorage.addItem(file.name, compressedImage, metadata)
      if (!saved) {
        showToast("Memória cheia! Remova algumas peças.", "error")
        e.target.value = ""
        return
      }

      const newPiece = {
        id: Date.now(),
        name: file.name,
        image: compressedImage,
        cor: colorResult.name,
        colorSlug: colorResult.slug,
        colorRgb: colorResult.rgb,
        tipo: folderType,
        manualVerified: true,
      }

      setPieces(prev => ({ ...prev, [folderType]: [...prev[folderType], newPiece] }))
      updateStorageInfo()
      e.target.value = ""
    } catch (error) {
      showToast("Erro ao processar imagem", "error")
    }
  }

  const handleDelete = (folderType, pieceId) => {
    const piece = pieces[folderType].find(p => p.id === pieceId || p.name === pieceId)
    if (piece) wardrobeStorage.removeItem(piece.name)
    setPieces(prev => ({
      ...prev,
      [folderType]: prev[folderType].filter(p => p.id !== pieceId && p.name !== pieceId)
    }))
    updateStorageInfo()
  }

  const handleProceed = () => {
    if (isTrial) {
      if (pieces.SUPERIOR.length < TRIAL_SUPERIOR) {
        showToast(`Adicione ${TRIAL_SUPERIOR - pieces.SUPERIOR.length} blusa(s) para continuar`)
        return
      }
      if (pieces.INFERIOR.length < TRIAL_INFERIOR) {
        showToast(`Adicione ${TRIAL_INFERIOR - pieces.INFERIOR.length} calça(s) para continuar`)
        return
      }
    } else {
      const hasDressLocal = pieces.VESTIDO.length >= 1
      const hasTopAndBottomLocal = pieces.SUPERIOR.length >= 1 && pieces.INFERIOR.length >= 1
      if (!hasDressLocal && !hasTopAndBottomLocal) {
        showToast("Precisa de: 1 vestido ou 1 blusa + 1 calça")
        return
      }
    }
    flowState.set("PREFERENCES")
    router.push("/preferences")
  }

  const totalPieces = pieces.SUPERIOR.length + pieces.INFERIOR.length + pieces.VESTIDO.length
  const hasDress = pieces.VESTIDO.length >= 1
  const hasTopAndBottom = pieces.SUPERIOR.length >= 1 && pieces.INFERIOR.length >= 1
  const trialComplete = pieces.SUPERIOR.length >= TRIAL_SUPERIOR && pieces.INFERIOR.length >= TRIAL_INFERIOR
  const canProceed = isTrial ? trialComplete : (hasDress || hasTopAndBottom)

  // Progress for trial
  const trialProgress = isTrial
    ? ((Math.min(pieces.SUPERIOR.length, TRIAL_SUPERIOR) + Math.min(pieces.INFERIOR.length, TRIAL_INFERIOR)) / (TRIAL_SUPERIOR + TRIAL_INFERIOR)) * 100
    : 100

  const FolderCard = ({ tipo, label, icon: Icon, accent, items }) => {
    const currentTotal = pieces.SUPERIOR.length + pieces.INFERIOR.length + pieces.VESTIDO.length
    let categoryLimit = maxPieces
    let isDisabled = false
    if (isTrial) {
      if (tipo === "SUPERIOR") categoryLimit = TRIAL_SUPERIOR
      else if (tipo === "INFERIOR") categoryLimit = TRIAL_INFERIOR
      else { categoryLimit = 0; isDisabled = true }
    }
    const limitReached = isTrial ? items.length >= categoryLimit : currentTotal >= maxPieces

    return (
      <div className={`rounded-2xl border transition-all anim-fade-up ${items.length > 0 ? 'border-[#B8860B]/30 bg-white/80' : 'border-[#E8DFD6] bg-white/60'
        } backdrop-blur-sm p-4 space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent || 'bg-[#FDF9F5]'
              }`}>
              <Icon className="w-5 h-5 text-[#5C1F33]" />
            </div>
            <div>
              <span className="font-semibold text-[#3E261E] text-sm">{label}</span>
              {isTrial && !isDisabled && (
                <p className="text-xs text-[#C9B8A8]">{items.length}/{categoryLimit}</p>
              )}
            </div>
          </div>
          {items.length > 0 && (
            <span className="text-xs font-medium text-[#B8860B] bg-[#B8860B]/10 px-2 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? 'peça' : 'peças'}
            </span>
          )}
        </div>

        {isDisabled ? (
          <div className="w-full py-3 rounded-xl bg-[#E8DFD6]/30 text-[#C9B8A8] text-center text-xs">
            Disponível no plano PRO
          </div>
        ) : limitReached ? (
          <div className="w-full py-3 rounded-xl bg-[#B8860B]/5 text-[#B8860B] text-center text-xs font-medium">
            ✓ Completo
          </div>
        ) : (
          <button
            onClick={() => handleFolderClick(tipo)}
            className="w-full py-4 rounded-xl border border-dashed border-[#C9B8A8] hover:border-[#B8860B] hover:bg-[#B8860B]/5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[#C9B8A8] hover:text-[#5C1F33]"
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Adicionar foto</span>
          </button>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {items.map((piece, idx) => (
              <div key={piece.id || idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#E8DFD6] shadow-sm">
                <img src={piece.image || "/placeholder.svg"} alt={piece.name} className="w-full h-full object-cover" />
                {piece.colorRgb && (
                  <div
                    className="absolute bottom-1 left-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: `rgb(${piece.colorRgb.r}, ${piece.colorRgb.g}, ${piece.colorRgb.b})` }}
                  />
                )}
                <button
                  onClick={() => handleDelete(tipo, piece.id || piece.name)}
                  className="absolute top-1 right-1 w-5 h-5 bg-[#5C1F33]/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#5C1F33] transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF9F5] flex flex-col relative pb-8">
      {/* Hidden inputs */}
      <input ref={superiorInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadToFolder("SUPERIOR", e)} />
      <input ref={inferiorInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadToFolder("INFERIOR", e)} />
      <input ref={vestidoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadToFolder("VESTIDO", e)} />

      {/* Ambient gradient */}
      <div className="absolute top-0 left-0 right-0 h-60 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(92,31,51,0.06) 0%, rgba(184,134,11,0.02) 40%, transparent 100%)" }}
      />

      {/* Header */}
      <header className="w-full px-5 pt-6 pb-4 flex items-center justify-between z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-[#C9B8A8] hover:text-[#5C1F33] transition-colors press">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <AppLogo variant="wordmark" colorMode="dark" size="small" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#C9B8A8] tracking-wide">3/6</span>
          <div className="w-16 h-1 bg-[#E8DFD6] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${50}%`, background: "linear-gradient(90deg, #5C1F33, #B8860B)" }} />
          </div>
        </div>
      </header>

      {/* Toast notification (replaces alert()) */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 anim-fade-up ${toast.type === "error" ? "bg-[#5C1F33]" : "bg-[#3E261E]"
          } text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 opacity-80" />
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="p-1 opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="max-w-md w-full mx-auto px-5 space-y-5 z-10 relative">
        {/* Title */}
        <div className="text-center space-y-3 anim-fade-up">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#5C1F33]/10 to-[#B8860B]/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#5C1F33]" />
          </div>
          <h1 className="font-display text-2xl text-[#3E261E] tracking-tight">
            {isTrial ? "Monte seu Guarda-Roupa" : "Adicionar Peças"}
          </h1>

          {isTrial ? (
            <div className="space-y-3">
              <p className="text-sm text-[#C9B8A8]">
                Adicione <strong className="text-[#5C1F33]">{TRIAL_SUPERIOR} blusas</strong> e <strong className="text-[#5C1F33]">{TRIAL_INFERIOR} calças</strong>
              </p>
              {/* Trial progress bar */}
              <div className="w-full h-2 bg-[#E8DFD6] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${trialProgress}%`, background: "linear-gradient(90deg, #5C1F33, #B8860B)" }} />
              </div>
              <div className="flex justify-center gap-4">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${pieces.SUPERIOR.length >= TRIAL_SUPERIOR ? 'bg-[#B8860B]/10 text-[#B8860B]' : 'bg-[#E8DFD6]/50 text-[#C9B8A8]'
                  }`}>
                  {pieces.SUPERIOR.length >= TRIAL_SUPERIOR ? '✓' : ''} Blusas {pieces.SUPERIOR.length}/{TRIAL_SUPERIOR}
                </span>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${pieces.INFERIOR.length >= TRIAL_INFERIOR ? 'bg-[#B8860B]/10 text-[#B8860B]' : 'bg-[#E8DFD6]/50 text-[#C9B8A8]'
                  }`}>
                  {pieces.INFERIOR.length >= TRIAL_INFERIOR ? '✓' : ''} Calças {pieces.INFERIOR.length}/{TRIAL_INFERIOR}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#C9B8A8]">Até {MAX_PIECES} peças</p>
          )}

          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-[#E8DFD6]">
            <span className="text-xl font-display text-[#5C1F33]">{totalPieces}</span>
            <span className="text-xs text-[#C9B8A8]">/ {maxPieces}</span>
          </div>
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="bg-[#5C1F33]/5 border border-[#5C1F33]/20 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#5C1F33] flex-shrink-0" />
            <p className="text-sm text-[#5C1F33] font-medium">{uploadError}</p>
          </div>
        )}

        {/* Folder Cards */}
        <div className="space-y-3">
          <FolderCard tipo="SUPERIOR" label="Blusas / Camisas" icon={Shirt} accent="bg-[#5C1F33]/5" items={pieces.SUPERIOR} />
          <FolderCard tipo="INFERIOR" label="Calças / Saias" icon={CircleDot} accent="bg-[#B8860B]/5" items={pieces.INFERIOR} />
          <FolderCard tipo="VESTIDO" label="Vestidos" icon={Sparkles} accent="bg-[#C9B8A8]/10" items={pieces.VESTIDO} />
        </div>

        {/* CTA */}
        {canProceed && (
          <button
            onClick={handleProceed}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base tracking-wide shadow-xl active:scale-[0.97] transition-all anim-fade-up"
            style={{ background: "linear-gradient(135deg, #5C1F33 0%, #7A2944 50%, #B8860B 100%)" }}
          >
            Continuar →
          </button>
        )}

        {/* Missing pieces hint */}
        {totalPieces > 0 && !canProceed && (
          <div className="text-center bg-[#B8860B]/5 border border-[#B8860B]/20 rounded-xl p-3">
            <p className="text-xs text-[#B8860B] font-medium">
              {isTrial ? (
                pieces.SUPERIOR.length < TRIAL_SUPERIOR
                  ? `Falta ${TRIAL_SUPERIOR - pieces.SUPERIOR.length} blusa(s)`
                  : `Falta ${TRIAL_INFERIOR - pieces.INFERIOR.length} calça(s)`
              ) : (
                "Precisa: 1 vestido ou (1 blusa + 1 calça)"
              )}
            </p>
          </div>
        )}

        {/* Storage info */}
        <p className="text-center text-[10px] text-[#C9B8A8]/60 tracking-wide">
          {storageInfo.used.toFixed(1)}MB / {storageInfo.total}MB
        </p>
      </div>
    </div>
  )
}

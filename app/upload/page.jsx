"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, X, Shirt, CircleDot } from "lucide-react"
import { wardrobeStorage } from "@/lib/wardrobe-storage"
import { flowState } from "@/lib/flow-state"
import { userStorage } from "@/lib/user-storage"
import { colorAnalyzer } from "@/lib/color-analyzer"
import AppHeader from "@/components/app-header"
import SecurityBadge from "@/components/security-badge"
import AppLogo from "@/components/app-logo"

const MAX_PIECES = 50
const TRIAL_MAX = 5
const TRIAL_MIN = 5 // Declared TRIAL_MIN variable
const TRIAL_SUPERIOR = 3
const TRIAL_INFERIOR = 2

export default function UploadPage() {
  const router = useRouter()
  const [pieces, setPieces] = useState({ SUPERIOR: [], INFERIOR: [], VESTIDO: [] })
  const [uploadError, setUploadError] = useState("")
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 5 })
  const [activeFolder, setActiveFolder] = useState(null)
  const [isTrial, setIsTrial] = useState(false)
  const [maxPieces, setMaxPieces] = useState(TRIAL_MAX)
  const [minPieces, setMinPieces] = useState(0)

  const superiorInputRef = useRef(null)
  const inferiorInputRef = useRef(null)
  const vestidoInputRef = useRef(null)

  useEffect(() => {
    flowState.validate("UPLOAD", router)
    loadSavedPieces()

    // Usa o novo userStorage para limites
    const user = userStorage.get()
    const plan = user?.plan || "TRIAL"
    const wardrobeLimit = userStorage.getWardrobeLimit()

    setIsTrial(plan === "TRIAL")
    setMinPieces(plan === "TRIAL" ? TRIAL_MIN : 0)
    setMaxPieces(wardrobeLimit)
  }, [router])

  const loadSavedPieces = () => {
    const savedItems = wardrobeStorage.getItems()
    const organized = { SUPERIOR: [], INFERIOR: [], VESTIDO: [] }

    savedItems.forEach(item => {
      const tipo = item.tipo || "SUPERIOR"
      if (organized[tipo]) {
        organized[tipo].push(item)
      } else {
        organized.SUPERIOR.push(item)
      }
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
    setActiveFolder(folderType)
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

          // Redimensionar para celular - maximo 800px para economizar espaco
          const maxDimension = 800
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension
              width = maxDimension
            } else {
              width = (width / height) * maxDimension
              height = maxDimension
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0, width, height)

          // Qualidade inicial menor para caber mais pecas
          let quality = 0.6
          let compressedDataUrl = canvas.toDataURL("image/jpeg", quality)

          // Se ainda estiver muito grande, reduzir mais
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

    // Verificar limite de pecas usando userStorage
    if (!userStorage.canAddPiece()) {
      const limit = userStorage.getWardrobeLimit()
      setUploadError(`Limite de ${limit} pecas atingido para o seu plano. Remova uma peca para adicionar outra.`)
      setTimeout(() => setUploadError(""), 4000)
      e.target.value = ""
      return
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor, selecione apenas imagens")
      setTimeout(() => setUploadError(""), 3000)
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
        setUploadError("Memoria cheia! Remova algumas pecas.")
        setTimeout(() => setUploadError(""), 5000)
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

      setPieces(prev => ({
        ...prev,
        [folderType]: [...prev[folderType], newPiece]
      }))

      updateStorageInfo()
      e.target.value = ""
    } catch (error) {
      setUploadError("Erro ao processar imagem")
      setTimeout(() => setUploadError(""), 3000)
    }
  }

  const handleDelete = (folderType, pieceId) => {
    const piece = pieces[folderType].find(p => p.id === pieceId || p.name === pieceId)
    if (piece) {
      wardrobeStorage.removeItem(piece.name)
    }
    setPieces(prev => ({
      ...prev,
      [folderType]: prev[folderType].filter(p => p.id !== pieceId && p.name !== pieceId)
    }))
    updateStorageInfo()
  }

  const handleProceed = () => {
    // TRIAL: obrigatorio 3 SUPERIOR + 2 INFERIOR
    if (isTrial) {
      if (pieces.SUPERIOR.length < TRIAL_SUPERIOR) {
        alert(`Adicione ${TRIAL_SUPERIOR - pieces.SUPERIOR.length} blusa(s) para completar o trial.`)
        return
      }
      if (pieces.INFERIOR.length < TRIAL_INFERIOR) {
        alert(`Adicione ${TRIAL_INFERIOR - pieces.INFERIOR.length} calca(s) para completar o trial.`)
        return
      }
    } else {
      // POS-TRIAL: regra de look
      const hasDressLocal = pieces.VESTIDO.length >= 1
      const hasTopAndBottomLocal = pieces.SUPERIOR.length >= 1 && pieces.INFERIOR.length >= 1
      if (!hasDressLocal && !hasTopAndBottomLocal) {
        alert("Para criar looks voce precisa de: 1 VESTIDO ou 1 BLUSA + 1 CALCA")
        return
      }
    }

    flowState.set("PREFERENCES")
    router.push("/preferences")
  }

  const totalPieces = pieces.SUPERIOR.length + pieces.INFERIOR.length + pieces.VESTIDO.length
  const hasDress = pieces.VESTIDO.length >= 1
  const hasTopAndBottom = pieces.SUPERIOR.length >= 1 && pieces.INFERIOR.length >= 1
  const canGenerateLook = hasDress || hasTopAndBottom

  // TRIAL: precisa de exatamente 3 SUPERIOR + 2 INFERIOR
  // POS-TRIAL: so precisa da regra de look
  const trialComplete = pieces.SUPERIOR.length >= TRIAL_SUPERIOR && pieces.INFERIOR.length >= TRIAL_INFERIOR
  const canProceed = isTrial ? trialComplete : canGenerateLook

  const FolderCard = ({ tipo, label, icon: Icon, color, bgColor, items }) => {
    const currentTotal = pieces.SUPERIOR.length + pieces.INFERIOR.length + pieces.VESTIDO.length

    // TRIAL: limites por categoria
    let categoryLimit = maxPieces
    let categoryMessage = ""
    if (isTrial) {
      if (tipo === "SUPERIOR") {
        categoryLimit = TRIAL_SUPERIOR
        categoryMessage = `Max ${TRIAL_SUPERIOR} blusas no trial`
      } else if (tipo === "INFERIOR") {
        categoryLimit = TRIAL_INFERIOR
        categoryMessage = `Max ${TRIAL_INFERIOR} calcas no trial`
      } else {
        categoryLimit = 0
        categoryMessage = "Vestidos nao disponiveis no trial"
      }
    }

    const limitReached = isTrial
      ? items.length >= categoryLimit
      : currentTotal >= maxPieces

    return (
      <div className={`rounded-2xl border-2 ${color} ${bgColor} p-4 space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-6 h-6" />
            <span className="font-bold text-lg">{label}</span>
          </div>
          <span className="text-sm font-medium">{items.length} pecas</span>
        </div>

        {limitReached ? (
          <div className="w-full py-3 rounded-xl bg-green-100 text-green-700 text-center text-sm font-medium">
            {isTrial ? categoryMessage : "Limite atingido - remova uma peca primeiro"}
          </div>
        ) : (
          <button
            onClick={() => handleFolderClick(tipo)}
            className={`w-full py-4 rounded-xl border-2 border-dashed ${color} hover:bg-white/50 transition-all active:scale-95 flex items-center justify-center gap-2`}
          >
            <span className="text-2xl">+</span>
            <span className="font-medium">Adicionar {label}</span>
          </button>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {items.map((piece, idx) => (
              <div key={piece.id || idx} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200">
                <img src={piece.image || "/placeholder.svg"} alt={piece.name} className="w-full h-full object-cover" />
                {piece.colorRgb && (
                  <div
                    className="absolute bottom-1 left-1 w-4 h-4 rounded-full border border-white"
                    style={{ backgroundColor: `rgb(${piece.colorRgb.r}, ${piece.colorRgb.g}, ${piece.colorRgb.b})` }}
                  />
                )}
                <button
                  onClick={() => handleDelete(tipo, piece.id || piece.name)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
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
    <div className="min-h-screen bg-neutral-100 flex flex-col p-4 pt-20 pb-8">
      <input ref={superiorInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadToFolder("SUPERIOR", e)} />
      <input ref={inferiorInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadToFolder("INFERIOR", e)} />
      <input ref={vestidoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadToFolder("VESTIDO", e)} />

      <div className="absolute top-6 left-6 z-20">
        <AppLogo size="small" />
      </div>

      <AppHeader step={2} totalSteps={6} />

      <div className="max-w-md w-full mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">
            {isTrial ? "Monte seu Guarda-Roupa" : "Adicionar Pecas"}
          </h1>

          {isTrial ? (
            <div className="space-y-2">
              <p className="text-sm text-neutral-600">
                Adicione <strong>{TRIAL_SUPERIOR} blusas</strong> e <strong>{TRIAL_INFERIOR} calcas</strong> para comecar
              </p>
              <div className="flex justify-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${pieces.SUPERIOR.length >= TRIAL_SUPERIOR ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  Blusas: {pieces.SUPERIOR.length}/{TRIAL_SUPERIOR}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${pieces.INFERIOR.length >= TRIAL_INFERIOR ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  Calcas: {pieces.INFERIOR.length}/{TRIAL_INFERIOR}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-600">
              Voce pode ter ate {MAX_PIECES} pecas
            </p>
          )}

          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-2xl font-bold text-[#5C1F33]">{totalPieces}</span>
            <span className="text-sm text-neutral-500">/ {maxPieces} pecas</span>
          </div>
        </div>

        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700 font-medium text-center">{uploadError}</p>
          </div>
        )}

        <div className="space-y-4">
          <FolderCard
            tipo="SUPERIOR"
            label="Blusas / Camisas"
            icon={Shirt}
            color="border-blue-400 text-blue-700"
            bgColor="bg-blue-50"
            items={pieces.SUPERIOR}
          />

          <FolderCard
            tipo="INFERIOR"
            label="Calcas / Saias"
            icon={CircleDot}
            color="border-green-400 text-green-700"
            bgColor="bg-green-50"
            items={pieces.INFERIOR}
          />

          <FolderCard
            tipo="VESTIDO"
            label="Vestidos"
            icon={Sparkles}
            color="border-purple-400 text-purple-700"
            bgColor="bg-purple-50"
            items={pieces.VESTIDO}
          />
        </div>

        {canProceed && (
          <Button
            onClick={handleProceed}
            className="w-full h-14 font-bold text-lg text-white shadow-xl"
            style={{ backgroundColor: "#5C1F33", borderRadius: "28px" }}
          >
            CONTINUAR
          </Button>
        )}

        {totalPieces > 0 && !canProceed && (
          <div className="text-center bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-sm text-amber-800 font-medium">
              {isTrial ? (
                pieces.SUPERIOR.length < TRIAL_SUPERIOR
                  ? `Falta ${TRIAL_SUPERIOR - pieces.SUPERIOR.length} blusa(s)`
                  : `Falta ${TRIAL_INFERIOR - pieces.INFERIOR.length} calca(s)`
              ) : (
                "Precisa: 1 VESTIDO ou (1 BLUSA + 1 CALCA)"
              )}
            </p>
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-neutral-400">
            Memoria: {storageInfo.used.toFixed(1)}MB / {storageInfo.total}MB
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <SecurityBadge />
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Camera, Check, X, Loader2, User, Ruler } from "lucide-react"
import AppHeader from "@/components/app-header"
import SecurityBadge from "@/components/security-badge"
import AppLogo from "@/components/app-logo"
import { flowState } from "@/lib/flow-state"
import { analyzeFaceImage, getColorRecommendations } from "@/lib/skin-hair-analyzer"

// Opcoes de tom de pele
const SKIN_OPTIONS = [
  { value: "muito-clara", label: "Muito Clara" },
  { value: "clara", label: "Clara" },
  { value: "media", label: "Media" },
  { value: "morena", label: "Morena" },
  { value: "escura", label: "Escura" },
  { value: "muito-escura", label: "Muito Escura" },
]

// Opcoes de cor de cabelo
const HAIR_OPTIONS = [
  { value: "loiro", label: "Loiro" },
  { value: "ruivo", label: "Ruivo" },
  { value: "castanho-claro", label: "Castanho Claro" },
  { value: "castanho", label: "Castanho Medio" },
  { value: "castanho-escuro", label: "Castanho Escuro" },
  { value: "preto", label: "Preto" },
  { value: "grisalho", label: "Grisalho" },
]

export default function PersonalAnalysisPage() {
  const router = useRouter()
  const [bodyPhoto, setBodyPhoto] = useState(null)
  const [facePhoto, setFacePhoto] = useState(null)
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState("")
  
  // Estado de confirmacao
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [detectedSkin, setDetectedSkin] = useState("")
  const [detectedHair, setDetectedHair] = useState("")
  const [selectedSkin, setSelectedSkin] = useState("")
  const [selectedHair, setSelectedHair] = useState("")

  useEffect(() => {
    flowState.validate("PERSONAL_ANALYSIS", router)
    
    // Carregar apenas altura/peso salvos (fotos NAO sao salvas - ocupam muito espaco)
    if (typeof window !== "undefined") {
      const savedBodyInfo = localStorage.getItem("prontissima_body_info")
      if (savedBodyInfo) {
        const data = JSON.parse(savedBodyInfo)
        if (data.height) setHeight(String(data.height))
        if (data.weight) setWeight(String(data.weight))
      }
    }
  }, [router])

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

          const maxDimension = 1920
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

          let quality = 0.85
          let compressedDataUrl = canvas.toDataURL("image/jpeg", quality)

          while (compressedDataUrl.length > 5 * 1024 * 1024 && quality > 0.3) {
            quality -= 0.1
            compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
          }

          console.log(`[v0] Imagem comprimida: ${compressedDataUrl.length} bytes`)
          resolve(compressedDataUrl)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoUpload = async (type, file) => {
    if (!file) return

    try {
      const compressed = await compressImage(file)
      if (type === "body") {
        setBodyPhoto(compressed)
        console.log("[v0] Foto corporal carregada:", compressed.length, "bytes")
      } else {
        setFacePhoto(compressed)
        console.log("[v0] Foto facial carregada:", compressed.length, "bytes")
      }
    } catch (err) {
      setError("Erro ao processar imagem")
      console.error("[v0] Erro ao comprimir:", err)
    }
  }

  const handleAnalyze = async () => {
    if (!bodyPhoto || !facePhoto || !height || !weight) {
      return
    }

    setAnalyzing(true)

    try {
      // Analise de pele e cabelo via canvas
      const faceAnalysis = await analyzeFaceImage(facePhoto)
      
      // Mostrar resultado para CONFIRMACAO do usuario
      setDetectedSkin(faceAnalysis.skin_tone)
      setDetectedHair(faceAnalysis.hair_color)
      setSelectedSkin(faceAnalysis.skin_tone)
      setSelectedHair(faceAnalysis.hair_color)
      setShowConfirmation(true)
    } catch (err) {
      // Fallback: mostrar opcoes padrao
      setDetectedSkin("media")
      setDetectedHair("castanho")
      setSelectedSkin("media")
      setSelectedHair("castanho")
      setShowConfirmation(true)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleConfirmAndContinue = () => {
    // Calculo de IMC para biotipo
    const heightM = Number.parseFloat(height) / 100
    const weightKg = Number.parseFloat(weight)
    const imc = weightKg / (heightM * heightM)
    
    let bodyType = "mixed"
    if (imc < 18.5) bodyType = "rectangle"
    else if (imc < 25) bodyType = "hourglass"
    else if (imc < 30) bodyType = "pear"
    else bodyType = "mixed"
    
    // Pegar label da opcao selecionada
    const skinOption = SKIN_OPTIONS.find(o => o.value === selectedSkin)
    const hairOption = HAIR_OPTIONS.find(o => o.value === selectedHair)
    
    // Recomendacoes de cores baseadas na SELECAO DO USUARIO
    const colorRecs = getColorRecommendations(selectedSkin, selectedHair)
    
    const analysisData = {
      skin_tone: selectedSkin,
      skin_label: skinOption?.label || "Media",
      skin_warmth: "neutral",
      hair_color: selectedHair,
      hair_label: hairOption?.label || "Castanho",
      body_type: bodyType,
      height: Number.parseFloat(height),
      weight: Number.parseFloat(weight),
      imc: Math.round(imc * 10) / 10,
      recommended_colors: colorRecs.best,
      avoid_colors: colorRecs.avoid,
      user_confirmed: true,
      analyzed_at: new Date().toISOString()
    }
    
    localStorage.setItem("prontissima_body_info", JSON.stringify(analysisData))

    flowState.set("TRIAL")
    router.push("/trial")
  }

  const canProceed = bodyPhoto && facePhoto && height && weight

  // TELA DE CONFIRMACAO
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center p-4">
        <div className="absolute top-6 left-6 z-20">
          <AppLogo size="small" />
        </div>

        <div className="max-w-md w-full space-y-6 mt-20">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900">Confirme seus dados</h1>
            <p className="text-sm text-neutral-600">
              Detectamos automaticamente, mas voce pode corrigir se necessario
            </p>
          </div>

          {/* Foto do rosto para referencia */}
          {facePhoto && (
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#5C1F33]">
                <img src={facePhoto || "/placeholder.svg"} alt="Seu rosto" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Tom de Pele */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-neutral-700">Tom de Pele</label>
            <div className="grid grid-cols-3 gap-2">
              {SKIN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedSkin(option.value)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedSkin === option.value
                      ? "border-[#5C1F33] bg-[#5C1F33]/10 text-[#5C1F33]"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  {option.label}
                  {option.value === detectedSkin && (
                    <span className="block text-xs text-neutral-400">(detectado)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cor do Cabelo */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-neutral-700">Cor do Cabelo</label>
            <div className="grid grid-cols-2 gap-2">
              {HAIR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedHair(option.value)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedHair === option.value
                      ? "border-[#5C1F33] bg-[#5C1F33]/10 text-[#5C1F33]"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  {option.label}
                  {option.value === detectedHair && (
                    <span className="block text-xs text-neutral-400">(detectado)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleConfirmAndContinue}
            className="w-full h-14 font-bold text-lg text-white rounded-2xl"
            style={{ backgroundColor: "#5C1F33" }}
          >
            <Check className="w-5 h-5 mr-2" />
            CONFIRMAR E CONTINUAR
          </Button>

          <button
            onClick={() => setShowConfirmation(false)}
            className="w-full text-sm text-neutral-500 hover:text-neutral-700"
          >
            Voltar e refazer fotos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-between p-0 py-0">
      <div className="absolute top-6 left-6 z-20">
        <AppLogo size="small" />
      </div>

      <AppHeader step={2} totalSteps={6} />

      <div className="max-w-md w-full space-y-6 px-4">
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <User className="w-10 h-10 text-[#5C1F33]" />
          </div>

          <h1 className="text-3xl font-light tracking-tight text-neutral-900 text-balance">Análise Pessoal</h1>

          <p className="text-sm text-neutral-600">
            Suas fotos são privadas e usadas apenas para extrair dados de estilo
          </p>
        </div>

        {/* Foto Corpo Completo */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-neutral-700">
            Foto Corpo Completo <span className="text-red-500">*</span>
          </label>
          <label className="cursor-pointer block">
            <div
              className={`relative aspect-[3/4] rounded-2xl border-3 transition-all overflow-hidden ${
                bodyPhoto
                  ? "border-[#5C1F33] shadow-lg"
                  : "border-dashed border-neutral-300 hover:border-[#5C1F33] hover:bg-white/50"
              }`}
            >
              {bodyPhoto ? (
                <>
                  <img src={bodyPhoto || "/placeholder.svg"} alt="Corpo" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setBodyPhoto(null)
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white/50">
                  <Camera className="w-12 h-12 text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600">Foto de corpo inteiro</p>
                  <p className="text-xs text-neutral-500 mt-1">Vista frontal, luz natural</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handlePhotoUpload("body", e.target.files?.[0])}
            />
          </label>
        </div>

        {/* Foto Rosto */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-neutral-700">
            Foto do Rosto <span className="text-red-500">*</span>
          </label>
          <label className="cursor-pointer block">
            <div
              className={`relative aspect-square rounded-2xl border-3 transition-all overflow-hidden ${
                facePhoto
                  ? "border-[#5C1F33] shadow-lg"
                  : "border-dashed border-neutral-300 hover:border-[#5C1F33] hover:bg-white/50"
              }`}
            >
              {facePhoto ? (
                <>
                  <img src={facePhoto || "/placeholder.svg"} alt="Rosto" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setFacePhoto(null)
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white/50">
                  <Camera className="w-12 h-12 text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600">Foto do rosto</p>
                  <p className="text-xs text-neutral-500 mt-1">Frontal, boa iluminação</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => handlePhotoUpload("face", e.target.files?.[0])}
            />
          </label>
        </div>

        {/* Medidas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">
              Altura (cm) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="165"
                className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-neutral-200 focus:border-[#5C1F33] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">
              Peso (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
              className="w-full h-12 px-4 rounded-xl border-2 border-neutral-200 focus:border-[#5C1F33] outline-none"
            />
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!canProceed || analyzing}
          className="w-full h-16 font-bold text-lg text-white rounded-3xl"
          style={{ backgroundColor: canProceed ? "#5C1F33" : "#ccc" }}
        >
          {analyzing ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Check className="w-6 h-6 mr-2" />
              ANALISAR E CONTINUAR
            </>
          )}
        </Button>
      </div>

      <div className="px-4 pb-4">
        <SecurityBadge />
      </div>
    </div>
  )
}

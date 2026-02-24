"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, Check, X, Loader2, User, Ruler, Weight, ChevronLeft } from "lucide-react"
import AppLogo from "@/components/app-logo"
import { flowState } from "@/lib/flow-state"
import { analyzeFaceImage, getColorRecommendations } from "@/lib/skin-hair-analyzer"

const SKIN_OPTIONS = [
  { value: "muito-clara", label: "Muito Clara" },
  { value: "clara", label: "Clara" },
  { value: "media", label: "Média" },
  { value: "morena", label: "Morena" },
  { value: "escura", label: "Escura" },
  { value: "muito-escura", label: "Muito Escura" },
]

const HAIR_OPTIONS = [
  { value: "loiro", label: "Loiro" },
  { value: "ruivo", label: "Ruivo" },
  { value: "castanho-claro", label: "Castanho Claro" },
  { value: "castanho", label: "Castanho Médio" },
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

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [detectedSkin, setDetectedSkin] = useState("")
  const [detectedHair, setDetectedHair] = useState("")
  const [selectedSkin, setSelectedSkin] = useState("")
  const [selectedHair, setSelectedHair] = useState("")

  useEffect(() => {
    flowState.validate("PERSONAL_ANALYSIS", router)
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
          let w = img.width, h = img.height
          const maxDim = 1920
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = (h / w) * maxDim; w = maxDim }
            else { w = (w / h) * maxDim; h = maxDim }
          }
          canvas.width = w; canvas.height = h
          canvas.getContext("2d").drawImage(img, 0, 0, w, h)
          let quality = 0.85
          let result = canvas.toDataURL("image/jpeg", quality)
          while (result.length > 5 * 1024 * 1024 && quality > 0.3) {
            quality -= 0.1
            result = canvas.toDataURL("image/jpeg", quality)
          }
          resolve(result)
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
      if (type === "body") setBodyPhoto(compressed)
      else setFacePhoto(compressed)
    } catch {
      setError("Erro ao processar imagem")
    }
  }

  const handleAnalyze = async () => {
    if (!bodyPhoto || !facePhoto || !height || !weight) return
    setAnalyzing(true)
    try {
      const faceAnalysis = await analyzeFaceImage(facePhoto)
      setDetectedSkin(faceAnalysis.skin_tone)
      setDetectedHair(faceAnalysis.hair_color)
      setSelectedSkin(faceAnalysis.skin_tone)
      setSelectedHair(faceAnalysis.hair_color)
      setShowConfirmation(true)
    } catch {
      setDetectedSkin("media"); setDetectedHair("castanho")
      setSelectedSkin("media"); setSelectedHair("castanho")
      setShowConfirmation(true)
    } finally { setAnalyzing(false) }
  }

  const handleConfirmAndContinue = () => {
    const heightM = parseFloat(height) / 100
    const weightKg = parseFloat(weight)
    const imc = weightKg / (heightM * heightM)
    let bodyType = "mixed"
    if (imc < 18.5) bodyType = "rectangle"
    else if (imc < 25) bodyType = "hourglass"
    else if (imc < 30) bodyType = "pear"

    const skinOption = SKIN_OPTIONS.find(o => o.value === selectedSkin)
    const hairOption = HAIR_OPTIONS.find(o => o.value === selectedHair)
    const colorRecs = getColorRecommendations(selectedSkin, selectedHair)

    const analysisData = {
      skin_tone: selectedSkin,
      skin_label: skinOption?.label || "Média",
      skin_warmth: "neutral",
      hair_color: selectedHair,
      hair_label: hairOption?.label || "Castanho",
      body_type: bodyType,
      height: parseFloat(height),
      weight: parseFloat(weight),
      imc: Math.round(imc * 10) / 10,
      recommended_colors: colorRecs.best,
      avoid_colors: colorRecs.avoid,
      user_confirmed: true,
      analyzed_at: new Date().toISOString(),
    }
    localStorage.setItem("prontissima_body_info", JSON.stringify(analysisData))
    flowState.set("TRIAL")
    router.push("/trial")
  }

  const canProceed = bodyPhoto && facePhoto && height && weight

  // ── Confirmation Screen ──
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-[#FDF9F5] flex flex-col items-center p-5 relative">
        <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(92,31,51,0.05) 0%, transparent 100%)" }}
        />
        <div className="pt-6 mb-8 z-10">
          <AppLogo variant="wordmark" colorMode="dark" size="small" />
        </div>

        <div className="max-w-md w-full space-y-6 z-10">
          <div className="text-center space-y-2 anim-fade-up">
            <h1 className="text-2xl font-bold text-[#3E261E]" style={{ fontFamily: "var(--font-display)" }}>
              Confirme seus dados
            </h1>
            <p className="text-sm text-[#C9B8A8]">
              Detectamos automaticamente, mas você pode corrigir se necessário
            </p>
          </div>

          {facePhoto && (
            <div className="flex justify-center anim-fade-up delay-1">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#5C1F33]/20 shadow-lg">
                <img src={facePhoto} alt="Seu rosto" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div className="space-y-3 anim-fade-up delay-2">
            <label className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9B8A8]">Tom de Pele</label>
            <div className="grid grid-cols-3 gap-2">
              {SKIN_OPTIONS.map((option) => (
                <button key={option.value} onClick={() => setSelectedSkin(option.value)}
                  className={`p-3 rounded-2xl border-2 text-sm font-medium transition-all press ${selectedSkin === option.value
                      ? "border-[#5C1F33] bg-[#5C1F33]/8 text-[#5C1F33]"
                      : "border-[#E8DFD6] bg-white hover:border-[#C9B8A8] text-[#8C7865]"
                    }`}
                >
                  {option.label}
                  {option.value === detectedSkin && (
                    <span className="block text-[10px] text-[#C9B8A8]">(detectado)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 anim-fade-up delay-3">
            <label className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9B8A8]">Cor do Cabelo</label>
            <div className="grid grid-cols-2 gap-2">
              {HAIR_OPTIONS.map((option) => (
                <button key={option.value} onClick={() => setSelectedHair(option.value)}
                  className={`p-3 rounded-2xl border-2 text-sm font-medium transition-all press ${selectedHair === option.value
                      ? "border-[#5C1F33] bg-[#5C1F33]/8 text-[#5C1F33]"
                      : "border-[#E8DFD6] bg-white hover:border-[#C9B8A8] text-[#8C7865]"
                    }`}
                >
                  {option.label}
                  {option.value === detectedHair && (
                    <span className="block text-[10px] text-[#C9B8A8]">(detectado)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleConfirmAndContinue}
            className="w-full py-5 rounded-2xl font-bold text-base tracking-wide text-white press anim-fade-up delay-4 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #5C1F33 0%, #7A2944 50%, #5C1F33 100%)", boxShadow: "0 8px 32px rgba(92,31,51,0.25)" }}
          >
            <Check className="w-5 h-5" />
            Confirmar e Continuar
          </button>

          <button onClick={() => setShowConfirmation(false)}
            className="w-full text-sm text-[#C9B8A8] hover:text-[#5C1F33] transition-colors press py-2"
          >
            ← Voltar e refazer fotos
          </button>
        </div>
      </div>
    )
  }

  // ── Main Form ──
  return (
    <div className="min-h-screen bg-[#FDF9F5] flex flex-col items-center relative pb-8">
      {/* Subtle gradient top */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(92,31,51,0.06) 0%, rgba(184,134,11,0.02) 40%, transparent 100%)" }}
      />

      {/* Header */}
      <header className="w-full px-5 pt-6 pb-4 flex items-center justify-between z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-[#C9B8A8] hover:text-[#5C1F33] transition-colors press">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <AppLogo variant="wordmark" colorMode="dark" size="small" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#C9B8A8] tracking-wide">2/6</span>
          <div className="w-16 h-1 bg-[#E8DFD6] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: "33%", background: "linear-gradient(90deg, #5C1F33, #B8860B)" }} />
          </div>
        </div>
      </header>

      <div className="max-w-md w-full space-y-6 px-5 z-10">
        {/* Title */}
        <div className="text-center space-y-3 anim-fade-up">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(92,31,51,0.08), rgba(184,134,11,0.08))" }}
          >
            <User className="w-7 h-7 text-[#5C1F33]" />
          </div>
          <h1 className="text-3xl font-semibold text-[#3E261E]" style={{ fontFamily: "var(--font-display)", lineHeight: "1.2" }}>
            Análise Pessoal
          </h1>
          <p className="text-sm text-[#C9B8A8]">
            Suas fotos são privadas e usadas apenas para extrair dados de estilo
          </p>
        </div>

        {/* Body Photo */}
        <div className="space-y-2 anim-fade-up delay-1">
          <label className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9B8A8]">
            Foto Corpo Completo <span className="text-red-400">*</span>
          </label>
          <label className="cursor-pointer block">
            <div className={`relative aspect-[3/4] rounded-2xl border-2 transition-all overflow-hidden ${bodyPhoto
                ? "border-[#B8860B]/40 shadow-lg"
                : "border-dashed border-[#E8DFD6] hover:border-[#C9B8A8] hover:bg-white/60"
              }`}>
              {bodyPhoto ? (
                <>
                  <img src={bodyPhoto} alt="Corpo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <button onClick={(e) => { e.preventDefault(); setBodyPhoto(null) }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md press"
                  >
                    <X className="w-4 h-4 text-[#5C1F33]" />
                  </button>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#5C1F33]/80 text-white text-[10px] font-semibold tracking-wide">
                    ✓ Foto carregada
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white/40">
                  <div className="w-16 h-16 rounded-2xl bg-[#F7F1E9] flex items-center justify-center mb-3">
                    <Camera className="w-7 h-7 text-[#C9B8A8]" />
                  </div>
                  <p className="text-sm font-medium text-[#8C7865]">Foto de corpo inteiro</p>
                  <p className="text-xs text-[#C9B8A8] mt-1">Vista frontal, luz natural</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => handlePhotoUpload("body", e.target.files?.[0])}
            />
          </label>
        </div>

        {/* Face Photo */}
        <div className="space-y-2 anim-fade-up delay-2">
          <label className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9B8A8]">
            Foto do Rosto <span className="text-red-400">*</span>
          </label>
          <label className="cursor-pointer block">
            <div className={`relative aspect-square rounded-2xl border-2 transition-all overflow-hidden ${facePhoto
                ? "border-[#B8860B]/40 shadow-lg"
                : "border-dashed border-[#E8DFD6] hover:border-[#C9B8A8] hover:bg-white/60"
              }`}>
              {facePhoto ? (
                <>
                  <img src={facePhoto} alt="Rosto" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <button onClick={(e) => { e.preventDefault(); setFacePhoto(null) }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md press"
                  >
                    <X className="w-4 h-4 text-[#5C1F33]" />
                  </button>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#5C1F33]/80 text-white text-[10px] font-semibold tracking-wide">
                    ✓ Foto carregada
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white/40">
                  <div className="w-16 h-16 rounded-2xl bg-[#F7F1E9] flex items-center justify-center mb-3">
                    <Camera className="w-7 h-7 text-[#C9B8A8]" />
                  </div>
                  <p className="text-sm font-medium text-[#8C7865]">Foto do rosto</p>
                  <p className="text-xs text-[#C9B8A8] mt-1">Frontal, boa iluminação</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" capture="user" className="hidden"
              onChange={(e) => handlePhotoUpload("face", e.target.files?.[0])}
            />
          </label>
        </div>

        {/* Measurements */}
        <div className="grid grid-cols-2 gap-4 anim-fade-up delay-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9B8A8]">
              Altura (cm) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9B8A8]" />
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="165"
                className="w-full h-12 pl-10 pr-4 rounded-2xl border-2 border-[#E8DFD6] bg-white focus:border-[#5C1F33] outline-none text-[#3E261E] transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9B8A8]">
              Peso (kg) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9B8A8]" />
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="60"
                className="w-full h-12 pl-10 pr-4 rounded-2xl border-2 border-[#E8DFD6] bg-white focus:border-[#5C1F33] outline-none text-[#3E261E] transition-colors"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm anim-fade-in px-1">{error}</p>}

        {/* CTA */}
        <button onClick={handleAnalyze} disabled={!canProceed || analyzing}
          className="w-full py-5 rounded-2xl font-bold text-base tracking-wide text-white press anim-fade-up delay-4 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          style={{
            background: canProceed ? "linear-gradient(135deg, #5C1F33 0%, #7A2944 50%, #5C1F33 100%)" : "#C9B8A8",
            boxShadow: canProceed ? "0 8px 32px rgba(92,31,51,0.25)" : "none",
          }}
        >
          {analyzing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analisando...</>
          ) : (
            <><Check className="w-5 h-5" /> Analisar e Continuar</>
          )}
        </button>

        {/* Security hint */}
        <p className="text-center text-[10px] text-[#C9B8A8] anim-fade-up delay-5">
          🔒 Seus dados são processados localmente e não enviados a servidores
        </p>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { userStorage } from "@/lib/user-storage"
import AppHeader from "@/components/app-header"
import SecurityBadge from "@/components/security-badge"
import AppLogo from "@/components/app-logo"

export default function BodyTypePage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // Multiple steps: 1=photos, 2=measurements
  const [bodyPhoto, setBodyPhoto] = useState(null)
  const [facePhoto, setFacePhoto] = useState(null)
  const [bodyPhotoPreview, setBodyPhotoPreview] = useState("")
  const [facePhotoPreview, setFacePhotoPreview] = useState("")
  const [alturaCm, setAlturaCm] = useState("")
  const [pesoKg, setPesoKg] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const [selectedBodyType, setSelectedBodyType] = useState("")
  const [skinTone, setSkinTone] = useState("")
  const [hairColor, setHairColor] = useState("")
  const [hairTexture, setHairTexture] = useState("")

  useEffect(() => {
    const savedBodyInfo = userStorage.getBodyInfo()
    if (savedBodyInfo) {
      setSelectedBodyType(savedBodyInfo.bodyType || "")
      setAlturaCm(savedBodyInfo.alturaCm?.toString() || "")
      setPesoKg(savedBodyInfo.pesoKg?.toString() || "")
      setSkinTone(savedBodyInfo.skinTone || "")
      setHairColor(savedBodyInfo.hairColor || "")
      setHairTexture(savedBodyInfo.hairTexture || "")
    }
  }, [])

  const bodyTypes = [
    {
      id: "hourglass",
      label: "Ampulheta",
      description: "Cintura marcada, proporções alinhadas",
      svg: (isSelected) => (
        <svg width="80" height="180" viewBox="0 0 80 180" className="mx-auto">
          <path
            d="M30 10 Q15 50 40 90 Q65 50 50 10 M30 170 Q15 130 40 90 Q65 130 50 170"
            fill="none"
            stroke={isSelected ? "#1A1A1A" : "#C9B8A8"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "inverted",
      label: "Triângulo Invertido",
      description: "Ombros mais largos que quadris",
      svg: (isSelected) => (
        <svg width="80" height="180" viewBox="0 0 80 180" className="mx-auto">
          <path
            d="M10 10 L70 10 L40 60 Z M40 60 L40 170 M30 170 L50 170"
            fill="none"
            stroke={isSelected ? "#1A1A1A" : "#C9B8A8"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "rectangle",
      label: "Retângulo",
      description: "Linha reta, pouca curva",
      svg: (isSelected) => (
        <svg width="80" height="180" viewBox="0 0 80 180" className="mx-auto">
          <rect
            x="25"
            y="10"
            width="30"
            height="160"
            rx="12"
            fill="none"
            stroke={isSelected ? "#1A1A1A" : "#C9B8A8"}
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: "pear",
      label: "Pêra",
      description: "Quadris mais largos",
      svg: (isSelected) => (
        <svg width="80" height="180" viewBox="0 0 80 180" className="mx-auto">
          <ellipse
            cx="40"
            cy="135"
            rx="28"
            ry="42"
            fill="none"
            stroke={isSelected ? "#1A1A1A" : "#C9B8A8"}
            strokeWidth="2"
          />
          <circle cx="40" cy="35" r="20" fill="none" stroke={isSelected ? "#1A1A1A" : "#C9B8A8"} strokeWidth="2" />
          <line x1="40" y1="55" x2="40" y2="93" stroke={isSelected ? "#1A1A1A" : "#C9B8A8"} strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: "oval",
      label: "Oval",
      description: "Cintura suave e centralizada",
      svg: (isSelected) => (
        <svg width="80" height="180" viewBox="0 0 80 180" className="mx-auto">
          <ellipse
            cx="40"
            cy="90"
            rx="28"
            ry="75"
            fill="none"
            stroke={isSelected ? "#1A1A1A" : "#C9B8A8"}
            strokeWidth="2"
          />
        </svg>
      ),
    },
  ]

  const skinTones = [
    { id: "porcelain", color: "#FCEEE4", label: "Porcelana" },
    { id: "light", color: "#F5D5C0", label: "Clara" },
    { id: "medium", color: "#D4A574", label: "Média" },
    { id: "tan", color: "#A67C52", label: "Morena" },
    { id: "dark", color: "#5D4037", label: "Negra" },
  ]

  const hairColors = [
    { id: "blonde", label: "Loiro", color: "#F0E68C" },
    { id: "brown", label: "Castanho", color: "#8B4513" },
    { id: "black", label: "Preto", color: "#1A1A1A" },
    { id: "red", label: "Ruivo", color: "#CD5C5C" },
    { id: "gray", label: "Grisalho", color: "#A9A9A9" },
  ]

  const hairTextures = [
    { id: "straight", label: "Liso" },
    { id: "wavy", label: "Ondulado" },
    { id: "curly", label: "Cacheado" },
  ]

  const handleBodyPhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setBodyPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBodyPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFacePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFacePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFacePhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyzePhotos = async () => {
    if (!bodyPhoto || !facePhoto || !alturaCm || !pesoKg) {
      setError("Por favor, envie ambas as fotos e preencha altura e peso")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("bodyPhoto", bodyPhoto)
      formData.append("facePhoto", facePhoto)
      formData.append("alturaCm", alturaCm)
      formData.append("pesoKg", pesoKg)

      const response = await fetch("/api/analyze-body", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erro ao analisar fotos")
      }

      const analysisData = await response.json()

      userStorage.saveBodyInfo({
        bodyType: analysisData.body_type,
        bodyProportion: analysisData.body_proportion,
        heightPerception: analysisData.height_perception,
        fitRecommendation: analysisData.fit_recommendation,
        skinTone: analysisData.skin_tone,
        hairType: analysisData.hair_type,
        hairColor: analysisData.hair_color,
        faceShape: analysisData.face_shape,
        alturaCm: Number.parseInt(alturaCm, 10),
        pesoKg: Number.parseInt(pesoKg, 10),
        analyzedAt: new Date().toISOString(),
      })

      router.push("/preferences")
    } catch (err) {
      setError("Erro ao processar as imagens. Tente novamente.")
      console.error("[v0] Error analyzing body photos:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col relative">
        <div className="absolute top-4 left-4 z-20">
          <AppLogo size="small" />
        </div>

        <AppHeader step={3} totalSteps={6} />

        <div className="px-5 py-6 max-w-md mx-auto w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light text-foreground mb-3">Análise Corporal</h1>
            <p className="text-base text-muted-foreground leading-relaxed px-4">
              Envie suas fotos para análise personalizada (apenas uma vez)
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Body Photo Upload */}
            <div>
              <label className="block text-sm uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                Foto do Corpo Completo
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBodyPhotoChange}
                  className="hidden"
                  id="bodyPhoto"
                />
                <label
                  htmlFor="bodyPhoto"
                  className="block w-full h-64 border-2 border-dashed border-neutral-300 rounded-2xl bg-white cursor-pointer hover:border-[#5C1F33] transition-colors overflow-hidden"
                >
                  {bodyPhotoPreview ? (
                    <img
                      src={bodyPhotoPreview || "/placeholder.svg"}
                      alt="Body preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm">Foto de corpo inteiro (frontal)</span>
                    </div>
                  )}
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Dica: Tire a foto de frente, com luz natural</p>
            </div>

            {/* Face Photo Upload */}
            <div>
              <label className="block text-sm uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                Foto do Rosto
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFacePhotoChange}
                  className="hidden"
                  id="facePhoto"
                />
                <label
                  htmlFor="facePhoto"
                  className="block w-full h-48 border-2 border-dashed border-neutral-300 rounded-2xl bg-white cursor-pointer hover:border-[#5C1F33] transition-colors overflow-hidden"
                >
                  {facePhotoPreview ? (
                    <img
                      src={facePhotoPreview || "/placeholder.svg"}
                      alt="Face preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm">Foto do rosto (frontal)</span>
                    </div>
                  )}
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Dica: Sem óculos escuros, cabelo visível</p>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!bodyPhoto || !facePhoto}
            className={`w-full py-5 rounded-[28px] font-bold text-lg tracking-wide transition-all active:scale-[0.98] ${
              bodyPhoto && facePhoto
                ? "bg-[#5C1F33] text-white hover:bg-[#7A2944] shadow-lg"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            CONTINUAR
          </button>
        </div>

        <div className="flex justify-center pb-6 mt-4">
          <SecurityBadge />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col relative">
      <div className="absolute top-4 left-4 z-20">
        <AppLogo size="small" />
      </div>

      <AppHeader step={3} totalSteps={6} />

      <div className="px-5 py-6 max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-light text-foreground mb-3">Suas Medidas</h1>
          <p className="text-base text-muted-foreground leading-relaxed px-4">
            Complete com altura e peso para finalizar a análise
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
              Altura (cm)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={alturaCm}
              onChange={(e) => setAlturaCm(e.target.value)}
              placeholder="165"
              min="120"
              max="250"
              className="w-full px-4 py-4 rounded-xl border-2 border-neutral-200 focus:border-[#5C1F33] focus:outline-none transition-colors text-center text-xl font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
              Peso (kg)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              placeholder="60"
              min="30"
              max="300"
              className="w-full px-4 py-4 rounded-xl border-2 border-neutral-200 focus:border-[#5C1F33] focus:outline-none transition-colors text-center text-xl font-semibold"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyzePhotos}
          disabled={isAnalyzing || !alturaCm || !pesoKg}
          className={`w-full py-5 rounded-[28px] font-bold text-lg tracking-wide transition-all active:scale-[0.98] ${
            !isAnalyzing && alturaCm && pesoKg
              ? "bg-[#5C1F33] text-white hover:bg-[#7A2944] shadow-lg"
              : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
          }`}
        >
          {isAnalyzing ? "ANALISANDO..." : "ANALISAR FOTOS"}
        </button>

        <button
          onClick={() => setStep(1)}
          disabled={isAnalyzing}
          className="w-full py-4 mt-3 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
        >
          Voltar para fotos
        </button>
      </div>

      <div className="flex justify-center pb-6 mt-4">
        <SecurityBadge />
      </div>
    </div>
  )
}

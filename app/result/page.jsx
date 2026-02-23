"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { looksStorage, wardrobeStorage, fixTrialWardrobe } from "@/lib/wardrobe-storage"
import { userStorage } from "@/lib/user-storage"
import AppLogo from "@/components/app-logo"
import SecurityBadge from "@/components/security-badge"
import AccountStatusPanel from "@/components/account-status-panel"
import LookCard from "@/components/look-card"
import LockedLookB from "@/components/locked-look-b"

export default function ResultPage() {
  const router = useRouter()
  const [lookData, setLookData] = useState(null)
  const [bodyInfo, setBodyInfo] = useState(null)
  const [saved, setSaved] = useState(false)
  const [canViewLookB, setCanViewLookB] = useState(false)
  const [errorState, setErrorState] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [credits, setCredits] = useState(null)
  const [strategySeen, setStrategySeen] = useState(true)

  useEffect(() => {
    const user = userStorage.getUser()
    if (user) {
      const totalCredits = (user.credits?.plan || 0) + (user.credits?.packs || 0)
      setCredits(totalCredits)
    }

    let fetchedLookData = null

    if (typeof window !== "undefined") {
      const pendingLook = sessionStorage.getItem("prontissima_pending_look")

      if (pendingLook) {
        try {
          fetchedLookData = JSON.parse(pendingLook)
          sessionStorage.removeItem("prontissima_pending_look")
        } catch (error) {
          console.error("[PRONTISSIMA] Erro ao ler look do sessionStorage:", error)
        }
      }

      if (!fetchedLookData) {
        const looks = looksStorage.getLooks()
        if (looks && looks.length > 0) {
          fetchedLookData = looks[0]
        }
      }
    }

    if (!fetchedLookData) {
      setErrorState(true)
      setErrorMessage("A IA não gerou nenhum look. Storage vazio.")
      return
    }

    const seen = localStorage.getItem("prontissima_strategy_seen")
    setStrategySeen(!!seen)

    const lookA = fetchedLookData.lookA
    const hasPiecesArray = Array.isArray(lookA?.pieces) && lookA.pieces.length > 0
    const hasTraditionalLook = lookA?.upperPiece && lookA?.lowerPiece
    const hasDressLook = lookA?.dressPiece
    const hasSinglePiece = lookA?.singlePiece

    if (!lookA || (!hasPiecesArray && !hasTraditionalLook && !hasDressLook && !hasSinglePiece)) {
      setErrorState(true)
      setErrorMessage("Look incompleto: nenhuma peca identificada.")
      return
    }

    setLookData(fetchedLookData)

    const info = userStorage.getBodyInfo()
    setBodyInfo(info)

    const shouldBlur = userStorage.shouldBlurLookB()
    setCanViewLookB(!shouldBlur)
  }, [])

  // ============= HANDLERS ============= //

  const handleSaveLook = () => {
    if (!lookData) return
    looksStorage.saveLook({
      mood: lookData.mood,
      occasion: lookData.occasion,
      lookA: lookData.lookA,
      lookB: lookData.lookB,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleFixAndRetry = () => {
    const result = fixTrialWardrobe()
    alert(result)
    window.location.href = "/preferences"
  }

  // ============= HELPERS ============= //

  const getSelectedPiecesForLook = (lookData) => {
    if (!lookData) return []

    if (Array.isArray(lookData.pieces) && lookData.pieces.length > 0) {
      const wardrobeItems = wardrobeStorage.getItems()
      return lookData.pieces
        .map(piece => {
          return wardrobeItems.find(item =>
            item.id === piece.id ||
            item.name === piece.name ||
            item.name === piece.nome ||
            item.id === piece.name
          ) || piece
        })
        .filter(Boolean)
    }

    const pieces = []
    const wardrobeItems = wardrobeStorage.getItems()

    if (lookData.dressPiece?.id) {
      const found = wardrobeItems.find(item => item.name === lookData.dressPiece.id || item.id === lookData.dressPiece.id)
      if (found) pieces.push({ ...found, description: lookData.dressPiece.description })
    }
    if (lookData.upperPiece?.id) {
      const found = wardrobeItems.find(item => item.name === lookData.upperPiece.id || item.id === lookData.upperPiece.id)
      if (found) pieces.push({ ...found, description: lookData.upperPiece.description })
    }
    if (lookData.lowerPiece?.id) {
      const found = wardrobeItems.find(item => item.name === lookData.lowerPiece.id || item.id === lookData.lowerPiece.id)
      if (found) pieces.push({ ...found, description: lookData.lowerPiece.description })
    }
    if (lookData.singlePiece?.id) {
      const found = wardrobeItems.find(item => item.name === lookData.singlePiece.id || item.id === lookData.singlePiece.id)
      if (found) pieces.push({ ...found, description: lookData.singlePiece.description, isPartial: true, note: lookData.note })
    }

    return pieces
  }

  const getImageStrategyAnalysis = () => {
    if (!bodyInfo) return ""
    const bodyType = bodyInfo.body_type || bodyInfo.bodyType || "mixed"
    const alturaCm = bodyInfo.height || bodyInfo.alturaCm || 165
    const strategies = {
      hourglass: "Sua silhueta ampulheta é naturalmente equilibrada. A estratégia é valorizar a cintura marcada com peças estruturadas que acentuem suas curvas proporcionais.",
      pear: "Com sua silhueta pêra, a estratégia é equilibrar as proporções trazendo volume para a parte superior e alongando as pernas com cores escuras na parte inferior.",
      inverted: "Seu triângulo invertido pede equilíbrio: suavize os ombros com decotes em V e traga atenção para a parte inferior com texturas e cores vibrantes.",
      rectangle: "Sua silhueta retangular permite criar curvas estratégicas. Use cintos, camadas e assimetrias para adicionar dimensão e movimento ao visual.",
      oval: "Sua silhueta oval se beneficia de cortes verticais e tecidos fluidos que alongam. Foque em criar linhas limpas que valorizem sua elegância natural.",
      mixed: "Sua silhueta versátil permite explorar diversos estilos. A estratégia é equilibrar proporções com peças estruturadas que valorizem seus pontos fortes.",
    }
    const strategy = strategies[bodyType] || "Seu estilo único merece peças que realcem sua confiança e autenticidade."
    const height = alturaCm > 170 ? "alta" : alturaCm > 160 ? "média" : "petite"
    const heightTips = {
      alta: " Sua altura permite usar peças oversized e maxissaias com elegância.",
      petite: " Linhas verticais e monocromia alongam sua silhueta com sofisticação.",
      média: " Proporções equilibradas são sua força — abuse de cintura alta.",
    }
    return strategy + heightTips[height]
  }

  const getStyling = (lookData, field) => {
    if (lookData?.styling?.[field]) {
      const value = lookData.styling[field]
      const forbiddenTerms = ["coordenada", "adequada", "escolha", "natural e fresca"]
      if (forbiddenTerms.some((term) => String(value).toLowerCase().includes(term))) return ""
      return value
    }
    return ""
  }

  const checkWardrobeIssue = () => {
    const items = wardrobeStorage.getItems()
    const tipos = items.reduce((acc, item) => {
      acc[item.tipo] = (acc[item.tipo] || 0) + 1
      return acc
    }, {})
    return {
      total: items.length,
      superior: tipos.SUPERIOR || 0,
      inferior: tipos.INFERIOR || 0,
      vestido: tipos.VESTIDO || 0,
      needsFix: items.length >= 5 && (tipos.INFERIOR || 0) === 0 && (tipos.VESTIDO || 0) === 0
    }
  }

  // ============= ERROR STATE ============= //

  if (errorState) {
    const wardrobeStatus = checkWardrobeIssue()
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center space-y-4">
          <div className="text-6xl">X</div>
          <h1 className="text-2xl font-bold text-red-900">Erro ao Criar Look</h1>
          <p className="text-lg text-red-700 font-mono bg-red-100 p-3 rounded-lg">{errorMessage}</p>

          {wardrobeStatus.needsFix ? (
            <>
              <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 text-left">
                <p className="text-sm font-bold text-amber-800">Problema detectado:</p>
                <p className="text-sm text-amber-700">
                  Todas as {wardrobeStatus.superior} pecas estao como BLUSA.
                  Para criar um look completo, precisa de BLUSA + CALCA.
                </p>
              </div>
              <Button
                onClick={handleFixAndRetry}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                Corrigir Pecas (3 Blusas + 2 Calcas)
              </Button>
            </>
          ) : (
            <p className="text-base text-red-600">
              O sistema nao conseguiu criar um look com suas pecas.
              Verifique se voce tem blusas E calcas no armario.
            </p>
          )}

          <Button
            onClick={() => router.push("/upload")}
            variant="outline"
            className="w-full h-12 border-red-300 text-red-700 hover:bg-red-100"
          >
            Ir para Upload de Pecas
          </Button>
        </div>
      </div>
    )
  }

  if (!lookData) return null

  // ============= DERIVED DATA ============= //

  const lookAData = lookData.lookA
  const lookBData = lookData.lookB
  const lookAPieces = getSelectedPiecesForLook(lookAData)
  const lookBPieces = getSelectedPiecesForLook(lookBData)
  const isLookIncomplete = lookAPieces.length === 1 && !lookAData?.dressPiece
  const wardrobeCheck = checkWardrobeIssue()

  // ============= RENDER ============= //

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <AppLogo size="medium" />
        </div>

        <AccountStatusPanel />

        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Seus looks estão prontos</h1>
          <p className="text-xl text-muted-foreground">
            {lookData.mood} • {lookData.occasion}
          </p>
          {credits !== null && credits <= 1 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mt-4">
              <p className="text-base text-amber-800 font-semibold">
                ⚠️ Atenção: Você tem apenas {credits} {credits === 1 ? "crédito restante" : "créditos restantes"}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Compre mais créditos para continuar criando looks incríveis!
              </p>
            </div>
          )}
        </div>

        {/* Strategy Analysis Banner (first time only) */}
        {bodyInfo && !strategySeen && (
          <div className="bg-gradient-to-br from-[#F7F4EF] to-[#E8DFD6] p-8 rounded-3xl border-2 border-[#C9B8A8] shadow-xl">
            <h2 className="text-2xl font-bold text-[#5C1F33] mb-4 flex items-center gap-2">
              Analise da Sua Estrategia de Imagem
            </h2>
            <p className="text-lg text-neutral-800 leading-relaxed">{getImageStrategyAnalysis()}</p>
            <button
              onClick={() => {
                localStorage.setItem("prontissima_strategy_seen", "true")
                setStrategySeen(true)
              }}
              className="mt-4 text-sm text-[#5C1F33] underline"
            >
              Entendi, nao mostrar novamente
            </button>
          </div>
        )}

        {/* Wardrobe Fix Banner */}
        {isLookIncomplete && wardrobeCheck.needsFix && (
          <div className="bg-amber-100 border-2 border-amber-400 rounded-2xl p-4 space-y-3">
            <p className="text-amber-800 font-bold">
              Look incompleto: todas as suas {wardrobeCheck.superior} pecas estao como BLUSA
            </p>
            <p className="text-sm text-amber-700">
              Para criar looks completos, o sistema precisa de BLUSAS e CALCAS separadas.
            </p>
            <Button
              onClick={handleFixAndRetry}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              CORRIGIR AGORA (3 Blusas + 2 Calcas)
            </Button>
          </div>
        )}

        {/* Look A */}
        <LookCard
          title="Look A"
          badge="Gratis"
          badgeColor="green"
          lookData={lookAData}
          pieces={lookAPieces}
          getStyling={getStyling}
          onSave={handleSaveLook}
          saved={saved}
        >
          <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg font-semibold">
            Look mais adequado dentro do seu guarda-roupa - escolhido especialmente para voce!
          </p>
        </LookCard>

        {/* Look B */}
        <div id="look-b-section">
          {canViewLookB ? (
            <LookCard
              title="Look B"
              badge="✓ Desbloqueado"
              badgeColor="green"
              lookData={lookBData}
              pieces={lookBPieces}
              getStyling={getStyling}
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl text-center shadow-lg">
                <p className="text-xl font-bold">🎉 Look B Desbloqueado com Sucesso!</p>
                <p className="text-sm mt-1 opacity-90">Mais uma combinação incrível para você arrasar</p>
              </div>
              <h3 className="text-2xl font-bold text-[#5C1F33]">{lookBData?.titulo}</h3>
            </LookCard>
          ) : (
            <LockedLookB pieces={lookBPieces} />
          )}
        </div>

        {/* CTA */}
        <div className="pt-6 space-y-4">
          {credits !== null && credits > 0 ? (
            <Button
              onClick={() => router.push("/preferences")}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-[#5C1F33] to-[#7A2C44] text-white hover:from-[#4A1828] hover:to-[#5C1F33] active:scale-95 transition-all shadow-xl"
            >
              ✨ Criar Novo Look ({credits} {credits === 1 ? "crédito disponível" : "créditos disponíveis"})
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/limit-reached")}
              className="w-full h-16 text-xl font-bold bg-amber-600 text-white hover:bg-amber-700 active:scale-95 transition-all shadow-xl"
            >
              💳 Comprar Mais Créditos
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-center pb-6">
        <SecurityBadge />
      </div>
    </div>
  )
}

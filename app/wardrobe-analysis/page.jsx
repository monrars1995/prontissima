"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shirt, ShoppingBag, Sparkles, AlertTriangle, User, Palette, CheckCircle, TrendingUp } from "lucide-react"
import { wardrobeStorage } from "@/lib/wardrobe-storage"
import { userStorage } from "@/lib/user-storage"
import AppLogo from "@/components/app-logo"

// Colorimetria baseada em tom de pele
const COLORIMETRIA = {
  light: { estacao: "Verao Frio", cores_ideais: ["Azul Marinho", "Vermelho Vinho", "Rosa Frio", "Cinza", "Roxo", "Preto"], evitar: ["Laranja", "Amarelo Quente", "Bege Dourado"] },
  medium: { estacao: "Outono Quente", cores_ideais: ["Terracota", "Verde Oliva", "Coral", "Caramelo", "Mostarda", "Bege"], evitar: ["Rosa Pink", "Azul Royal", "Preto Pesado"] },
  olive: { estacao: "Outono Suave", cores_ideais: ["Vermelho Tomate", "Laranja", "Amarelo", "Verde Esmeralda", "Off-White"], evitar: ["Verde Oliva", "Marrom Escuro", "Cinza Frio"] },
  dark: { estacao: "Inverno Profundo", cores_ideais: ["Branco Puro", "Amarelo Vibrante", "Rosa Pink", "Azul Royal", "Verde Limao", "Vermelho"], evitar: ["Marrom Opaco", "Bege Apagado", "Tons Pasteis"] }
}

// Dicas por tipo de corpo (versao completa)
const BODY_TYPE_TIPS = {
  hourglass: {
    nome: "Ampulheta",
    dica: "Sua silhueta e equilibrada. O segredo e nao esconder suas formas sob roupas largas.",
    fazer: "Use cintos para marcar a cintura e decotes em 'V' para alongar.",
    evitar: "Cortes retos ou oversized que apagam suas curvas.",
    logic: "Manter a proporcao ombro-quadril evidente."
  },
  pear: {
    nome: "Triangulo",
    dica: "O objetivo e trazer atencao para os ombros e equilibrar visualmente com o quadril.",
    fazer: "Use ombreiras discretas, colares chamativos ou cores claras na parte superior.",
    evitar: "Calcas com bolsos laterais grandes ou estampas chamativas na parte inferior.",
    logic: "Ampliar visualmente a linha dos ombros."
  },
  inverted_triangle: {
    nome: "Triangulo Invertido",
    dica: "Sua estrutura e forte no topo. Vamos dar volume a parte inferior para suavizar o visual.",
    fazer: "Calcas pantalona, saias evase e cores vibrantes na parte de baixo.",
    evitar: "Decotes canoa ou blusas com muito volume nas mangas.",
    logic: "Criar volume onde ha menos massa visual."
  },
  rectangle: {
    nome: "Retangulo",
    dica: "O foco aqui e criar a ilusao de curvas e definir uma linha de cintura.",
    fazer: "Saias rodadas, blusas com babados e casacos acinturados.",
    evitar: "Looks monocromaticos totalmente retos ou golas altas muito fechadas.",
    logic: "Quebrar a linha reta com volumes estrategicos."
  },
  oval: {
    nome: "Oval",
    dica: "O objetivo e criar uma linha vertical longa para alongar e afinar a silhueta.",
    fazer: "Looks monocromaticos, blazers abertos e tecidos que nao grudam no corpo.",
    evitar: "Cintos contrastantes no meio da barriga ou tecidos com muito brilho.",
    logic: "Direcionar o olhar verticalmente, sem interrupcoes."
  },
  apple: {
    nome: "Maca",
    dica: "Pecas com decote V alongam a silhueta e valorizam o colo.",
    fazer: "Blusas soltas, vestidos imperio e calcas retas.",
    evitar: "Cintos apertados na cintura e tecidos que marcam.",
    logic: "Criar fluidez na regiao central."
  }
}

export default function WardrobeAnalysisPage() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [bodyInfo, setBodyInfo] = useState(null)

  useEffect(() => {
    const wardrobeItems = wardrobeStorage.getItems()
    const savedBodyInfo = userStorage.getBodyInfo()
    
    setItems(wardrobeItems)
    setBodyInfo(savedBodyInfo)
    
    // TRAVA DE ENGENHARIA: Se pecas < 3, redirecionar para consultoria
    if (wardrobeItems.length > 0 && wardrobeItems.length < 3) {
      router.push("/analysis-feedback?reason=limited")
      return
    }
    
    if (wardrobeItems.length >= 3) {
      const result = analyzeWardrobe(wardrobeItems, savedBodyInfo)
      setAnalysis(result)
    }
  }, [router])

  const analyzeWardrobe = (wardrobeItems, bodyData) => {
    // Contagem por tipo
    const tipos = {
      SUPERIOR: wardrobeItems.filter(p => p.tipo === "SUPERIOR").length,
      INFERIOR: wardrobeItems.filter(p => p.tipo === "INFERIOR").length,
      VESTIDO: wardrobeItems.filter(p => p.tipo === "VESTIDO").length,
      SAPATO: wardrobeItems.filter(p => p.tipo === "SAPATO").length,
    }

    // Contagem por cor
    const cores = {}
    wardrobeItems.forEach(item => {
      const cor = item.cor || "Indefinida"
      cores[cor] = (cores[cor] || 0) + 1
    })

    // Ordenar cores por frequencia
    const coresOrdenadas = Object.entries(cores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Cor predominante
    const corPredominante = coresOrdenadas[0] ? coresOrdenadas[0][0] : "Variado"

    // Biotipo
    const bodyType = bodyData?.body_type || "rectangle"
    const bodyTips = BODY_TYPE_TIPS[bodyType] || BODY_TYPE_TIPS.rectangle
    
    // Colorimetria
    const skinTone = bodyData?.skin_tone || "medium"
    const colorimetria = COLORIMETRIA[skinTone] || COLORIMETRIA.medium

    // Verificar harmonia da cor predominante com a pele
    const corPredominanteNorm = corPredominante.toLowerCase()
    const harmoniaExcelente = colorimetria.cores_ideais.some(c => corPredominanteNorm.includes(c.toLowerCase()))
    const harmoniaRuim = colorimetria.evitar.some(c => corPredominanteNorm.includes(c.toLowerCase()))
    
    let harmoniaPele = "Boa - Cores neutras que funcionam bem."
    if (harmoniaExcelente) {
      harmoniaPele = "Excelente - Esta cor ilumina seu rosto."
    } else if (harmoniaRuim) {
      harmoniaPele = "Atencao - Considere usar essa cor longe do rosto."
    }

    // Gap do armario
    let gapArmario = ""
    if (tipos.INFERIOR === 0 && tipos.SUPERIOR > 0) {
      gapArmario = "Voce tem muitos Tops, mas nenhuma peca Inferior. Adicione calcas ou saias."
    } else if (tipos.SUPERIOR === 0 && tipos.INFERIOR > 0) {
      gapArmario = "Voce tem pecas Inferiores, mas nenhum Top. Adicione blusas ou camisas."
    } else if (tipos.INFERIOR < tipos.SUPERIOR / 2) {
      gapArmario = "Voce tem muitos Tops, mas poucas pecas Inferiores neutras."
    } else if (tipos.SUPERIOR < tipos.INFERIOR / 2) {
      gapArmario = "Voce tem muitas pecas Inferiores, mas poucos Tops versateis."
    } else {
      gapArmario = "Seu armario esta equilibrado entre Tops e Bottoms!"
    }

    // Dica expert baseada no biotipo
    const dicaExpert = bodyTips.dica

    // Combinacoes possiveis
    const combinacoes = (tipos.SUPERIOR * tipos.INFERIOR) + tipos.VESTIDO

    // Estrutura de resposta JSON conforme especificado
    return {
      status: "success",
      perfil: {
        biotipo: bodyTips.nome,
        colorimetria: colorimetria.estacao
      },
      analise_tecnica: {
        cor_predominante: corPredominante,
        harmonia_pele: harmoniaPele,
        gap_armario: gapArmario
      },
      dica_expert: dicaExpert,
      bodyTips,
      colorimetria,
      total: wardrobeItems.length,
      tipos,
      coresOrdenadas,
      combinacoes
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <AppLogo size="medium" />
        <p className="text-neutral-600 mt-4 text-center">Voce ainda nao tem pecas no guarda-roupa</p>
        <Button onClick={() => router.push("/upload")} className="mt-4 bg-[#5C1F33] text-white">
          Adicionar Pecas
        </Button>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">Analisando seu guarda-roupa...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-light tracking-tight">Analise do Guarda-Roupa</h1>
        </div>

        {/* Card Principal - Perfil */}
        <div className="bg-gradient-to-br from-[#5C1F33] to-[#8B3A5C] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Seu Perfil</p>
              <p className="text-white/70 text-sm">Analise personalizada</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/60 text-xs mb-1">Biotipo</p>
              <p className="font-medium">{analysis.perfil.biotipo}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/60 text-xs mb-1">Colorimetria</p>
              <p className="font-medium">{analysis.perfil.colorimetria}</p>
            </div>
          </div>
        </div>

        {/* Analise Tecnica */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#5C1F33]" />
            <span className="font-medium">Analise Tecnica</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl">
              <Palette className="w-5 h-5 text-[#5C1F33] mt-0.5" />
              <div>
                <p className="text-sm font-medium">Cor Predominante</p>
                <p className="text-sm text-neutral-600">{analysis.analise_tecnica.cor_predominante}</p>
              </div>
            </div>
            
            <div className={`flex items-start gap-3 p-3 rounded-xl ${
              analysis.analise_tecnica.harmonia_pele.includes("Excelente") 
                ? "bg-green-50 border border-green-200" 
                : analysis.analise_tecnica.harmonia_pele.includes("Atencao")
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-blue-50 border border-blue-200"
            }`}>
              <CheckCircle className={`w-5 h-5 mt-0.5 ${
                analysis.analise_tecnica.harmonia_pele.includes("Excelente") 
                  ? "text-green-600" 
                  : analysis.analise_tecnica.harmonia_pele.includes("Atencao")
                    ? "text-amber-600"
                    : "text-blue-600"
              }`} />
              <div>
                <p className="text-sm font-medium">Harmonia com sua Pele</p>
                <p className="text-sm text-neutral-600">{analysis.analise_tecnica.harmonia_pele}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-[#5C1F33] mt-0.5" />
              <div>
                <p className="text-sm font-medium">Gap do Armario</p>
                <p className="text-sm text-neutral-600">{analysis.analise_tecnica.gap_armario}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dica Expert */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-900">Dica da Estilista</span>
          </div>
          <p className="text-amber-800">{analysis.dica_expert}</p>
          
          {analysis.bodyTips.fazer && (
            <div className="mt-4 p-3 bg-white/60 rounded-xl">
              <p className="text-xs text-amber-700 font-medium mb-1">O QUE FAZER:</p>
              <p className="text-sm text-amber-800">{analysis.bodyTips.fazer}</p>
            </div>
          )}
          
          {analysis.bodyTips.evitar && (
            <div className="mt-2 p-3 bg-white/60 rounded-xl">
              <p className="text-xs text-amber-700 font-medium mb-1">O QUE EVITAR:</p>
              <p className="text-sm text-amber-800">{analysis.bodyTips.evitar}</p>
            </div>
          )}
        </div>

        {/* Resumo Numerico */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center gap-3 mb-4">
            <Shirt className="w-5 h-5 text-neutral-600" />
            <span className="font-medium">Seu Guarda-Roupa</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-neutral-50 rounded-xl p-3">
              <p className="text-xl font-light text-[#5C1F33]">{analysis.tipos.SUPERIOR}</p>
              <p className="text-xs text-neutral-500">Tops</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-3">
              <p className="text-xl font-light text-[#5C1F33]">{analysis.tipos.INFERIOR}</p>
              <p className="text-xs text-neutral-500">Bottoms</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-3">
              <p className="text-xl font-light text-[#5C1F33]">{analysis.tipos.VESTIDO}</p>
              <p className="text-xs text-neutral-500">Vestidos</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-3">
              <p className="text-xl font-light text-[#5C1F33]">{analysis.combinacoes}</p>
              <p className="text-xs text-neutral-500">Looks</p>
            </div>
          </div>
        </div>

        {/* Cores Ideais para Voce */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400" />
            <span className="font-medium">Cores Ideais para Voce</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {analysis.colorimetria.cores_ideais.map((cor) => (
              <span key={cor} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                {cor}
              </span>
            ))}
          </div>
          
          <p className="text-xs text-neutral-500 mt-4 mb-2">Cores para usar com cuidado:</p>
          <div className="flex flex-wrap gap-2">
            {analysis.colorimetria.evitar.map((cor) => (
              <span key={cor} className="px-3 py-1 bg-neutral-100 text-neutral-500 text-sm rounded-full">
                {cor}
              </span>
            ))}
          </div>
        </div>

        {/* Botao de Acao */}
        <Button 
          onClick={() => router.push("/dashboard")} 
          className="w-full h-14 bg-[#5C1F33] text-white hover:bg-[#4A1828] text-lg"
        >
          Ver Looks Sugeridos
        </Button>
        
        <Button 
          onClick={() => router.push("/upload")} 
          variant="outline"
          className="w-full h-12 bg-transparent"
        >
          Adicionar Mais Pecas
        </Button>
      </div>
    </div>
  )
}

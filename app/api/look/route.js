import { generateText } from "ai"

export async function POST(request) {
  const { pieces, mood, occasion, bodyInfo } = await request.json()

  console.log("[v0] Generating look with", pieces.length, "pieces for", mood, occasion)
  console.log("[v0] Body info:", bodyInfo)

  try {
    const userContent = [
      {
        type: "text",
        text: `Você é uma ESTILISTA CHEFE SÊNIOR, especialista em imagem feminina, moda brasileira real, biotipo, proporção corporal e construção de LOOKS COMPLETOS.

Você trabalha exclusivamente para MULHERES REAIS e domina:
- biotipo feminino (ampulheta, triângulo, retângulo, oval, etc.)
- proporção corporal, peso visual, altura, alongamento e equilíbrio de silhueta
- sensualidade elegante
- moda que funciona no corpo, não só na foto

DADOS DA CLIENTE:
- Altura: ${bodyInfo?.alturaCm || "165"} cm
- Peso aproximado: ${bodyInfo?.pesoKg || "60"} kg
- Biotipo: ${bodyInfo?.bodyType || "ampulheta"}
- Tom de pele: ${bodyInfo?.skinTone || "médio"}
- Cabelo: ${bodyInfo?.hairColor || "castanho"} ${bodyInfo?.hairTexture || "ondulado"}
- MOOD: ${mood}
- OCASIÃO: ${occasion}

FLUXO OBRIGATÓRIO (NÃO INVERTA):
1. ANALISE PRIMEIRO cada peça enviada nas imagens:
   - cor EXATA, tecido, modelagem, comprimento, impacto visual
   - identifique se é parte SUPERIOR (blusa, camisa, top, blazer, cropped, body) 
     ou INFERIOR (calça, saia, short, bermuda)
     ou VESTIDO/MACACÃO (peça única completa)
2. CONSIDERE o BIOTIPO da cliente (ajuste, equilíbrio, pontos fortes e cuidados)
3. SÓ DEPOIS considere ocasião e mood emocional

REGRAS ABSOLUTAS:
- TODOS os looks DEVEM ser COMPLETOS
- TODOS os looks DEVEM conter NO MÍNIMO:
  • 1 parte superior + 1 parte inferior (OU 1 vestido/macacão completo)
  • Sapato
  • Bolsa
  • Acessórios
  • Cabelo
  • Maquiagem
- NUNCA use calça + saia juntas
- NUNCA use 2 calças, 2 saias, 2 blusas no mesmo look
- NUNCA monte look incompleto
- NÃO descreva como catálogo
- NÃO seja genérico
- NÃO faça perguntas
- NÃO ofereça mais de duas opções
- DECIDA como uma estilista experiente decide

PEÇAS DO GUARDA-ROUPA DISPONÍVEIS:`,
      },
    ]

    pieces.forEach((piece, index) => {
      userContent.push({
        type: "text",
        text: `\n\nPEÇA ${index + 1}: ${piece.name}`,
      })
      userContent.push({
        type: "image",
        image: piece.image,
      })
    })

    userContent.push({
      type: "text",
      text: `\n\nRETORNE OBRIGATORIAMENTE UM JSON PURO (sem markdown, sem \`\`\`json, sem explicações) neste formato EXATO:

{
  "lookA": {
    "titulo": "Nome do Look Principal",
    "pecasSelecionadas": ["nome_arquivo1.jpeg", "nome_arquivo2.jpeg"],
    "sapato": "descrição específica do sapato",
    "bolsa": "descrição específica da bolsa",
    "acessorios": ["Brinco específico", "Colar específico"],
    "cabelo": "sugestão específica de penteado",
    "maquiagem": "sugestão específica de maquiagem",
    "porqueFunciona": "Justificativa focada em BIOTIPO + OCASIÃO + MOOD (máx. 2 frases)"
  },
  "lookB": {
    "titulo": "Nome do Look Alternativo",
    "pecasSelecionadas": ["nome_arquivo3.jpeg", "nome_arquivo4.jpeg"],
    "sapato": "descrição específica do sapato",
    "bolsa": "descrição específica da bolsa",
    "acessorios": ["Brinco específico", "Colar específico"],
    "cabelo": "sugestão específica de penteado",
    "maquiagem": "sugestão específica de maquiagem",
    "porqueFunciona": "Justificativa curta (máx. 1 frase)"
  }
}

IMPORTANTE:
- Em "pecasSelecionadas" use APENAS os nomes DOS ARQUIVOS que você VIU nas imagens acima
- Cada look DEVE ter OBRIGATORIAMENTE NO MÍNIMO 2 peças:
  * 1 SUPERIOR + 1 INFERIOR (blusa + calça, ou blusa + saia, ou cropped + short)
  * OU 1 VESTIDO/MACACÃO completo (mas sempre 2 peças mínimo no array)
- Se não houver peças suficientes para 2 looks diferentes, use combinações diferentes das mesmas peças
- NUNCA retorne look com apenas 1 peça
- NUNCA retorne look com calça + saia
- NUNCA retorne look com 2 partes inferiores ou 2 superiores

FINALIZE com UMA frase forte, segura e feminina, reforçando confiança, presença e estilo.`,
    })

    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é VEST.AI, ESTILISTA SÊNIOR especialista em:
- Análise visual PROFISSIONAL de roupas (cor exata, tecido, caimento, estilo, tipo de peça)
- Biotipo feminino e proporções corporais brasileiras
- Moda brasileira tropical sofisticada
- Construção de looks completos e funcionais que valorizam o corpo

PROCESSO OBRIGATÓRIO:
1. ANALISE cada imagem identificando EXATAMENTE: 
   - Tipo de peça (SUPERIOR: blusa/camisa/top/blazer/cropped OU INFERIOR: calça/saia/short OU VESTIDO: peça única)
   - Cor exata
   - Tecido e textura
   - Estilo e ocasião
2. CLASSIFIQUE todas as peças disponíveis por categoria
3. MONTE 2 looks completos usando APENAS as peças fotografadas
4. GARANTA que cada look tem:
   - 1 SUPERIOR + 1 INFERIOR (blusa + calça, cropped + saia, etc)
   - OU 1 VESTIDO/MACACÃO
   - NUNCA calça + saia, NUNCA 2 superiores, NUNCA 2 inferiores
   - NO MÍNIMO 2 peças no array "pecasSelecionadas"

NUNCA retorne look incompleto, com apenas 1 peça, ou com combinação impossível.
Responda SOMENTE com JSON puro (sem \`\`\`json, sem markdown, sem explicações).`,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    })

    console.log("[v0] GPT-4o Vision raw response:", text)

    let lookData
    const cleanText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      lookData = JSON.parse(jsonMatch[0])

      // Validação rigorosa
      if (!lookData.lookA?.pecasSelecionadas || !lookData.lookB?.pecasSelecionadas) {
        throw new Error("JSON inválido: faltam pecasSelecionadas")
      }

      if (lookData.lookA.pecasSelecionadas.length < 2 || lookData.lookB.pecasSelecionadas.length < 2) {
        console.warn("[v0] GPT retornou looks incompletos, aplicando correção...")
        throw new Error("Looks incompletos retornados pelo GPT")
      }

      console.log("[v0] GPT-4o Vision looks válidos:", {
        lookA: lookData.lookA.pecasSelecionadas,
        lookB: lookData.lookB.pecasSelecionadas,
      })

      return Response.json(lookData)
    }

    throw new Error("Resposta não contém JSON válido")
  } catch (error) {
    console.error("[v0] Error generating look:", error.message || error)

    console.log("[v0] Ativando fallback com classificação inteligente...")

    try {
      // Primeiro passo: identificar tipo de cada peça
      const classificacoesPromises = pieces.map(async (piece) => {
        try {
          const { text } = await generateText({
            model: "openai/gpt-4o",
            messages: [
              {
                role: "system",
                content: `Você classifica peças de roupa em categorias. Responda APENAS com UMA palavra: SUPERIOR, INFERIOR, VESTIDO ou SAPATO.

SUPERIOR = blusa, camisa, top, blazer, cropped, body, jaqueta, casaco
INFERIOR = calça, saia, short, bermuda, pantalona, legging
VESTIDO = vestido, macacão, jardineira (peça única do corpo todo)
SAPATO = sapato, sandália, tênis, bota, salto`,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Que tipo de peça é esta? Responda apenas: SUPERIOR, INFERIOR, VESTIDO ou SAPATO",
                  },
                  {
                    type: "image",
                    image: piece.image,
                  },
                ],
              },
            ],
            temperature: 0.3,
            maxTokens: 10,
          })

          const tipo = text.trim().toUpperCase()
          console.log(`[v0] Peça ${piece.name} classificada como: ${tipo}`)
          return { ...piece, tipo }
        } catch {
          console.log(`[v0] Erro ao classificar ${piece.name}, assumindo INDEFINIDO`)
          return { ...piece, tipo: "INDEFINIDO" }
        }
      })

      const pecasClassificadas = await Promise.all(classificacoesPromises)

      const superiores = pecasClassificadas.filter((p) => p.tipo === "SUPERIOR")
      const inferiores = pecasClassificadas.filter((p) => p.tipo === "INFERIOR")
      const vestidos = pecasClassificadas.filter((p) => p.tipo === "VESTIDO")

      console.log(
        `[v0] Classificação: ${superiores.length} superiores, ${inferiores.length} inferiores, ${vestidos.length} vestidos`,
      )

      // Criar looks válidos
      let lookAPieces = []
      let lookBPieces = []

      // Look A: tentar 1 superior + 1 inferior
      if (superiores.length > 0 && inferiores.length > 0) {
        lookAPieces = [superiores[0].name, inferiores[0].name]
      } else if (vestidos.length > 0) {
        // Se não tem combo, usar vestido
        lookAPieces = [vestidos[0].name]
        // Adicionar segunda peça se disponível
        if (pecasClassificadas.length > 1) {
          const outraPeca = pecasClassificadas.find((p) => p.name !== vestidos[0].name)
          if (outraPeca) lookAPieces.push(outraPeca.name)
        }
      } else {
        // Último caso: pegar as 2 primeiras peças quaisquer
        lookAPieces = [pecasClassificadas[0].name, pecasClassificadas[1]?.name || pecasClassificadas[0].name]
      }

      // Look B: tentar combinação diferente
      if (superiores.length > 1 && inferiores.length > 1) {
        lookBPieces = [superiores[1].name, inferiores[1].name]
      } else if (superiores.length > 0 && inferiores.length > 1) {
        lookBPieces = [superiores[0].name, inferiores[1].name]
      } else if (vestidos.length > 1) {
        lookBPieces = [vestidos[1].name]
        if (pecasClassificadas.length > 2) {
          const outraPeca = pecasClassificadas.find((p) => p.name !== vestidos[1].name && p.name !== lookAPieces[0])
          if (outraPeca) lookBPieces.push(outraPeca.name)
        }
      } else {
        // Inverter ordem ou usar outras peças
        const pecasRestantes = pecasClassificadas.filter((p) => !lookAPieces.includes(p.name))
        if (pecasRestantes.length >= 2) {
          lookBPieces = [pecasRestantes[0].name, pecasRestantes[1].name]
        } else {
          // Usar mesmas peças em ordem invertida
          lookBPieces = lookAPieces.slice().reverse()
        }
      }

      console.log("[v0] Fallback inteligente - lookA pieces:", lookAPieces)
      console.log("[v0] Fallback inteligente - lookB pieces:", lookBPieces)

      return Response.json({
        lookA: {
          titulo: `Look ${mood} Principal`,
          pecasSelecionadas: lookAPieces,
          sapato: "Sandália nude de salto médio ou scarpin clássico",
          bolsa: "Clutch estruturada ou bolsa pequena de mão",
          acessorios: ["Brincos médios dourados", "Relógio fino", "Cinto se necessário"],
          cabelo: "Ondas naturais soltas ou preso baixo elegante",
          maquiagem: "Pele iluminada, olhos esfumados suaves, batom nude rosado",
          porqueFunciona: `Combinação equilibrada para biotipo ${bodyInfo?.bodyType || "ampulheta"}, perfeita para ${occasion.toLowerCase()} com elegância tropical brasileira.`,
        },
        lookB: {
          titulo: `Look ${mood} Alternativo`,
          pecasSelecionadas: lookBPieces,
          sapato: "Mule de salto médio ou sandália de amarração",
          bolsa: "Bolsa saco média ou crossbody minimalista",
          acessorios: ["Argola média", "Pulseiras delicadas empilhadas"],
          cabelo: "Coque baixo despojado ou rabo lateral",
          maquiagem: "Natural com foco nos olhos, batom terracota ou nude",
          porqueFunciona: "Variação sofisticada e confortável mantendo elegância.",
        },
      })
    } catch (fallbackError) {
      console.error("[v0] Erro no fallback inteligente:", fallbackError)

      // Fallback final: usar primeiras 2 peças para cada look
      const allPieces = pieces.map((p) => p.name)
      return Response.json({
        lookA: {
          titulo: `Look ${mood} Principal`,
          pecasSelecionadas: [allPieces[0], allPieces[1] || allPieces[0]],
          sapato: "Sandália nude salto médio",
          bolsa: "Clutch minimalista",
          acessorios: ["Brincos dourados"],
          cabelo: "Solto natural",
          maquiagem: "Pele iluminada",
          porqueFunciona: "Combinação elegante e confortável.",
        },
        lookB: {
          titulo: `Look ${mood} Alternativo`,
          pecasSelecionadas: [allPieces[2] || allPieces[0], allPieces[3] || allPieces[1] || allPieces[0]],
          sapato: "Mule salto médio",
          bolsa: "Bolsa saco",
          acessorios: ["Argolas"],
          cabelo: "Preso baixo",
          maquiagem: "Natural",
          porqueFunciona: "Alternativa prática.",
        },
      })
    }
  }
}

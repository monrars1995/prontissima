# Como Configurar a API Key do OpenAI

O VEST.AI usa GPT-4o Vision para analisar as peças e criar looks profissionais.

## Passo 1: Adicionar a API Key

1. Clique em "Vars" na barra lateral esquerda do v0
2. Adicione uma nova variável:
   - Nome: `OPENAI_API_KEY`
   - Valor: sua chave da OpenAI (começa com `sk-`)
3. Salve

## Passo 2: Resetar o App

1. Na tela de onboarding, clique no botão vermelho "RESET" no canto superior direito
2. Isso vai limpar todas as peças antigas (que não têm descrição)

## Passo 3: Fazer Upload Novamente

1. Faça upload de 3-5 peças
2. **IMPORTANTE**: Selecione o tipo de cada peça (calça, blusa, vestido, etc)
3. Continue o fluxo normalmente

## Por que as descrições são importantes?

O GPT-4o Vision precisa das descrições para:
- Classificar tops e bottoms corretamente
- Evitar combinações impossíveis (ex: 2 calças juntas)
- Criar looks que fazem sentido

## Testando se está funcionando

Quando o GPT-4o Vision funcionar, você verá nos logs:
\`\`\`
[v0] GPT-4o Vision response: {...}
\`\`\`

Se ainda aparecer:
\`\`\`
[v0] Error generating look: Gateway request failed: fetch failed
\`\`\`

A API key pode estar incorreta ou não foi adicionada.

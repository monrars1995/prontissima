# Como Configurar a API Key do Gemini

O Prontíssima usa **Gemini 3 Flash** para analisar fotos do corpo e criar looks personalizados.

## Passo 1: Obter a API Key

1. Acesse [Google AI Studio](https://aistudio.google.com/apikey)
2. Crie uma nova API Key (é **gratuita** para uso moderado)
3. Copie a chave gerada

## Passo 2: Adicionar a API Key

### No desenvolvimento local:
1. Copie `.env.example` para `.env`
2. Cole sua chave em `GEMINI_API_KEY=sua-chave-aqui`

### No Vercel:
1. Vá em Settings → Environment Variables
2. Adicione `GEMINI_API_KEY` com o valor da chave

## Passo 3: Testar

Acesse `/api/test-openai` no navegador. Se funcionar, vai retornar:

```json
{
  "success": true,
  "message": "Gemini 3 Flash está funcionando!",
  "model": "gemini-3-flash-preview"
}
```

## Por que Gemini em vez de OpenAI?

- **Gratuito** para uso moderado (vs $0.03/chamada no GPT-4o-mini)
- **1M tokens de contexto** — analisa fotos em alta resolução
- **Structured outputs** nativos — JSON sempre válido
- **Mais rápido** para análise de imagem

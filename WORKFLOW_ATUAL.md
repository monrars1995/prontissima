# VEST.AI - Workflow Atual vs Spec

## STATUS GERAL
- ✅ **19 rotas criadas** (100% das páginas básicas)
- ⚠️ **Vision rodando a cada look** (deveria rodar 1x no upload)
- ❌ **Geração de imagens faltando** (mostra fotos reais, não modelo genérico)
- ❌ **Análise corporal ausente** (não usa Vision para corpo)

## FLUXO IMPLEMENTADO

### 1. ONBOARDING → UPLOAD → LOGIN (1ª vez)
✅ `/onboarding` - Intro rápida
✅ `/upload` - Upload de 5-10 peças do guarda-roupa
⚠️ **GAP CRÍTICO**: Vision roda aqui mas não persiste os metadados
✅ `/login` - Cadastro (email/senha) - só acontece 1x

### 2. DASHBOARD → CRIAR LOOK
✅ `/dashboard` - Hub principal
✅ `/body-type` - Seleção de tipo corporal (MOCK - deveria usar Vision)
✅ `/preferences` - Mood + Ocasião
✅ `/loading` - Análise IA
⚠️ **GAP CRÍTICO**: Vision roda NOVAMENTE aqui (custo 30x maior)
✅ `/result` - Look A (grátis) + Look B (bloqueado)

### 3. MONETIZAÇÃO
✅ `/limit-reached` - Oferta de packs quando créditos acabam
✅ `/confirmation` - Mock de confirmação de compra
❌ **GAP**: Falta integração real de pagamento PIX

### 4. HISTÓRICO E EXTRAS
✅ `/history` - Lista de looks criados
✅ `/look-detail` - Detalhes de um look específico
✅ `/gallery` - Galeria visual
✅ `/settings` - Configurações
✅ `/about` - Sobre o app

## GAPS CRÍTICOS POR PRIORIDADE

### 🔴 SPRINT 1: OTIMIZAÇÃO DE CUSTOS (CRÍTICO)
**Problema**: Vision roda toda vez que cria look = US$30/usuária
**Solução**: Mover análise Vision para `/upload` e persistir metadados

**Ações**:
1. Salvar metadados completos no localStorage após upload
2. Remover chamada Vision do `/loading`
3. Usar metadados salvos em `/create-looks`
**Economia**: US$30 → US$1 por usuária (97% redução)

### 🟠 SPRINT 2: GERAÇÃO DE IMAGENS
**Problema**: Mostra fotos reais das peças, não modelo genérico
**Solução**: Integrar fal.ai ou DALL-E para gerar modelo vestindo o look

**Ações**:
1. Criar `/api/generate-model` usando fal.ai
2. Enviar descrição do look + mood
3. Retornar imagem do modelo genérico vestindo as peças
**Custo estimado**: US$0.05 por look gerado

### 🟡 SPRINT 3: ANÁLISE CORPORAL COM VISION
**Problema**: `/body-type` é seleção manual (deveria ser automática)
**Solução**: Selfie + Vision para detectar tipo corporal

**Ações**:
1. Adicionar upload de selfie em `/body-type`
2. Criar `/api/analyze-body` usando GPT-4o Vision
3. Detectar automaticamente: altura relativa, proporções, tipo corporal
**Custo**: US$0.01 por análise (1x por usuária)

### 🟢 SPRINT 4: PÁGINA DE SEGURANÇA
**Problema**: Falta página de proteção de dados
**Solução**: Criar `/security` com política de privacidade

**Ações**:
1. Criar `/security/page.jsx`
2. Adicionar link no footer de todas as páginas
3. Conteúdo: como dados são armazenados, uso de IA, LGPD

### 🔵 SPRINT 5: INTEGRAÇÃO DE PAGAMENTO
**Problema**: Confirmação de compra é mock
**Solução**: Integrar PIX real ou Stripe

**Ações**:
1. Integrar API de pagamento (Mercado Pago ou Stripe)
2. Criar webhook para confirmação
3. Atualizar créditos automaticamente após pagamento

## SISTEMA DE CRÉDITOS (IMPLEMENTADO)
✅ Pack Inicial: 3 créditos (3 looks = 6 opções)
✅ Pack Básico: 10 créditos por R$ 19,90
✅ Pack Premium: 30 créditos por R$ 49,90
✅ Modo DEV: Créditos ilimitados para testes

## PRÓXIMOS PASSOS RECOMENDADOS
1. **AGORA**: Implementar Sprint 1 (economia de 97% nos custos)
2. **Depois**: Sprint 2 (geração de imagens)
3. **Por último**: Sprints 3, 4 e 5 (melhorias incrementais)

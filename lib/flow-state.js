// ============================================
// FLOW STATE - INTEGRIDADE DO FLUXO
// - Sem pulos de etapas em erro
// - Erros bloqueiam ou fallback, NUNCA avancam
// - Sequencia OBRIGATORIA
// ============================================
const FLOW_KEY = "prontissima_flow_state"
const STEPS = ["SPLASH", "ONBOARDING", "SIGNUP", "PERSONAL_ANALYSIS", "TRIAL", "UPLOAD", "PREFERENCES", "LOADING", "READY"]

export const flowState = {
  get() {
    if (typeof window === "undefined") return { step: "SPLASH" }
    const d = localStorage.getItem(FLOW_KEY)
    return d ? JSON.parse(d) : { step: "SPLASH" }
  },

  // REGRA: So avanca se step e valido
  set(step) {
    if (!STEPS.includes(step)) {
      console.error("[VEST] ERRO: Step invalido bloqueado:", step)
      return false
    }
    localStorage.setItem(FLOW_KEY, JSON.stringify({ step }))
    return true
  },

  // REGRA: Valida se usuario pode estar nesta pagina
  // Se nao pode, BLOQUEIA e redireciona para etapa correta
  validate(currentStep, router) {
    const { step } = this.get()
    const currentIndex = STEPS.indexOf(currentStep)
    const savedIndex = STEPS.indexOf(step)

    // READY pode acessar qualquer pagina
    if (step === "READY") return true

    // Se tentando acessar etapa futura, BLOQUEIA
    if (currentIndex > savedIndex) {
      console.warn("[VEST] Acesso bloqueado:", currentStep, "- deve estar em:", step)
      router.push(this.getRoute(step))
      return false
    }

    return true
  },

  // REGRA: Permite voltar para etapa anterior (mas nao pular)
  canGoTo(targetStep) {
    const { step } = this.get()
    if (step === "READY") return true
    const targetIndex = STEPS.indexOf(targetStep)
    const currentIndex = STEPS.indexOf(step)
    return targetIndex <= currentIndex
  },

  getRoute(step) {
    const routes = {
      SPLASH: "/",
      ONBOARDING: "/onboarding",
      SIGNUP: "/signup",
      PERSONAL_ANALYSIS: "/personal-analysis",
      TRIAL: "/trial",
      UPLOAD: "/upload",
      PREFERENCES: "/preferences",
      LOADING: "/loading",
      READY: "/dashboard",
    }
    return routes[step] || "/"
  },

  reset() {
    localStorage.removeItem(FLOW_KEY)
  },
}

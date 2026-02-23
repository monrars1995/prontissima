// ===============================
// PRONTISSIMA — USER STORAGE (FINAL v3)
// ===============================

const KEY = "prontissima_user"

export const userStorage = {

  get() {
    if (typeof window === "undefined") return null
    return JSON.parse(localStorage.getItem(KEY) || "null")
  },

  save(user) {
    if (typeof window === "undefined") return
    localStorage.setItem(KEY, JSON.stringify(user))
  },

  init() {
    const u = {
      isPremium: false,
      plan: "TRIAL", // TRIAL | BASIC | PREMIUM
      subscriptionRenewsAt: null,
      credits: {
        plan: 3,  // trial = 3 looks
        packs: 0
      },
      wardrobeLimit: 10 // trial limit (unified)
    }
    this.save(u)
    return u
  },

  // Criar usuario com nome e email (cadastro)
  create(email, name) {
    const u = {
      email: email,
      name: name,
      isPremium: false,
      plan: "TRIAL",
      subscriptionRenewsAt: null,
      credits: {
        plan: 3,
        packs: 0
      },
      wardrobeLimit: 10,
      createdAt: new Date().toISOString()
    }
    this.save(u)
    return true
  },

  // ============= PLANOS ============= //

  activateTrial() {
    const u = this.init()
    u.plan = "TRIAL"
    u.credits.plan = 3
    u.wardrobeLimit = 5
    this.save(u)
    return u
  },

  activateBasic() {
    const u = this.get() || this.init()
    u.plan = "BASIC"
    u.planType = "basic"
    u.isPremium = true
    u.subscriptionRenewsAt = Date.now() + 30 * 86400 * 1000
    u.credits.plan = 10        // 10 looks x2 opcoes = 20
    u.wardrobeLimit = 50       // limite fixo
    this.save(u)
    return u
  },

  activatePremium() {
    const u = this.get() || this.init()
    u.plan = "PREMIUM"
    u.planType = "premium"
    u.isPremium = true
    u.subscriptionRenewsAt = Date.now() + 30 * 86400 * 1000
    u.credits.plan = 30        // 30 looks x2 opcoes
    u.wardrobeLimit = 50       // limite fixo
    this.save(u)
    return u
  },

  // Renovacao automatica mensal - RESETA creditos do plano
  checkRenewal() {
    const u = this.get()
    if (!u || !u.isPremium) return

    const now = Date.now()
    if (now >= u.subscriptionRenewsAt) {
      u.subscriptionRenewsAt = now + 30 * 86400 * 1000

      // RESETA para a franquia do plano (nao acumula)
      u.credits.plan = u.planType === "basic" ? 10 : 30

      this.save(u)
    }
  },

  // ============= PACKS ============= //

  addPack(qtd) {
    const u = this.get() || this.init()
    u.credits.packs += qtd
    // NAO aumenta guarda-roupa
    this.save(u)
    return u
  },

  // ============= CREDITOS ============= //

  hasCredits() {
    if (this.isDevMode()) return true // dev mode = unlimited
    const u = this.get()
    if (!u) return false
    return (u.credits.plan > 0 || u.credits.packs > 0)
  },

  consume() {
    const u = this.get()
    if (!u) return { success: false, credits: 0, redirect: "/limit-reached" }

    if (u.credits.plan > 0) {
      u.credits.plan -= 1
    } else if (u.credits.packs > 0) {
      u.credits.packs -= 1
    } else {
      return { success: false, credits: 0, redirect: "/limit-reached" }
    }

    this.save(u)
    const remaining = u.credits.plan + u.credits.packs
    return { success: true, credits: remaining }
  },

  // ============= WARDROBE ============= //

  getWardrobeLimit() {
    const u = this.get()
    // Premium = 50, Trial/Free = 10
    return u?.isPremium ? 50 : 10
  },

  canAddPiece() {
    const u = this.get()
    if (!u) return false
    if (typeof window === "undefined") return false

    const items = JSON.parse(localStorage.getItem("prontissima_wardrobe") || "[]")
    const maxItems = u.isPremium ? 50 : 10
    return items.length < maxItems
  },

  // ============= LOOK B BLUR (Trial) ============= //

  shouldBlurLookB() {
    const u = this.get()
    if (!u) return true
    // Premium users always see Look B
    // Trial/free users always see Look B blurred (must upgrade)
    return !u.isPremium
  },

  // ============= ALIASES (compatibilidade) ============= //

  getUser() { return this.get() },
  addCredits(qtd) { return this.addPack(qtd) },
  consumeCredit() { return this.consume() },

  getTotalCredits() {
    const u = this.get()
    if (!u) return 0
    return (u.credits?.plan || 0) + (u.credits?.packs || 0)
  },

  updateUser(data) {
    const u = this.get()
    if (!u) return null
    Object.assign(u, data)
    this.save(u)
    return u
  },

  createUser(data = {}) {
    const u = {
      ...data,
      isPremium: false,
      plan: "TRIAL",
      subscriptionRenewsAt: null,
      credits: { plan: 3, packs: 0 },
      wardrobeLimit: 10
    }
    this.save(u)
    return u
  },

  renewPremiumIfNeeded() {
    this.checkRenewal()
    return this.get()
  },

  getDaysUntilRenewal() {
    const u = this.get()
    if (!u || !u.isPremium || !u.subscriptionRenewsAt) return null
    const diff = u.subscriptionRenewsAt - Date.now()
    return Math.max(0, Math.ceil(diff / 86400000))
  },

  // ============= BODY INFO ============= //

  getBodyInfo() {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem("prontissima_body_info")
    return data ? JSON.parse(data) : null
  },

  saveBodyInfo(info) {
    if (typeof window === "undefined") return
    localStorage.setItem("prontissima_body_info", JSON.stringify(info))
  },

  // ============= OUTROS ============= //

  logout() {
    if (typeof window === "undefined") return
    localStorage.removeItem(KEY)
    localStorage.removeItem("prontissima_body_info")
  },

  isDevMode() {
    if (typeof window === "undefined") return false
    return localStorage.getItem("prontissima_dev_mode") === "true"
  },
  enableDevMode() {
    if (typeof window !== "undefined") localStorage.setItem("prontissima_dev_mode", "true")
  },
  disableDevMode() {
    if (typeof window !== "undefined") localStorage.removeItem("prontissima_dev_mode")
  },
  toggleDevMode() {
    if (this.isDevMode()) {
      this.disableDevMode()
    } else {
      this.enableDevMode()
    }
  }
}

export default userStorage

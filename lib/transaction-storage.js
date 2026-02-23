import { userStorage } from "./user-storage"

export const transactionStorage = {
  createPendingTransaction(pack, amount) {
    const user = userStorage.getUser()
    if (!user) return null

    const transactionId = `TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const transaction = {
      id: transactionId,
      userId: user.email,
      pack: pack,
      amount: amount,
      credits: pack === "basic" ? 10 : 30,
      status: "pending",
      createdAt: new Date().toISOString(),
      approvedAt: null,
    }

    const transactions = this.getPendingTransactions()
    transactions.push(transaction)
    localStorage.setItem("prontissima_pending_transactions", JSON.stringify(transactions))

    console.log("[v0] Transação pendente criada:", transactionId)
    return transaction
  },

  getPendingTransactions() {
    const stored = localStorage.getItem("prontissima_pending_transactions")
    return stored ? JSON.parse(stored) : []
  },

  getUserPendingTransactions() {
    const user = userStorage.getUser()
    if (!user) return []

    return this.getPendingTransactions().filter((t) => t.userId === user.email && t.status === "pending")
  },

  approveTransaction(transactionId) {
    const transactions = this.getPendingTransactions()
    const transaction = transactions.find((t) => t.id === transactionId)

    if (!transaction) return false

    transaction.status = "approved"
    transaction.approvedAt = new Date().toISOString()
    localStorage.setItem("prontissima_pending_transactions", JSON.stringify(transactions))

    userStorage.addCredits(transaction.credits)

    console.log("[v0] Transação aprovada:", transactionId, `+${transaction.credits} créditos`)
    return true
  },

  getAllPendingTransactions() {
    return this.getPendingTransactions().filter((t) => t.status === "pending")
  },

  checkIfProcessedToday(userId, pack) {
    const processed = this.getProcessedTransactions()
    const today = new Date().toDateString()

    return processed.some(
      (t) => t.userId === userId && t.pack === pack && new Date(t.processedAt).toDateString() === today,
    )
  },

  recordProcessedTransaction(userId, pack, credits) {
    const processed = this.getProcessedTransactions()
    processed.push({
      userId,
      pack,
      credits,
      processedAt: new Date().toISOString(),
    })
    localStorage.setItem("prontissima_processed_transactions", JSON.stringify(processed))
    console.log("[v0] Transação registrada no log anti-fraude:", { userId, pack, credits })
  },

  getProcessedTransactions() {
    const stored = localStorage.getItem("prontissima_processed_transactions")
    return stored ? JSON.parse(stored) : []
  },
}

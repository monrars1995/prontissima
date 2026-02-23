"use client"

import { useEffect, useState } from "react"
import { Sparkles, Clock, AlertCircle, Crown } from "lucide-react"
import { userStorage } from "@/lib/user-storage"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AccountStatusPanel() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Verificar e renovar ciclo ao carregar
    let userData = userStorage.renewPremiumIfNeeded()
    if (!userData) {
      userData = userStorage.getUser()
    }

    if (userData) {
      setUser(userData)
      const planC = userData.credits?.plan || 0
      const packC = userData.credits?.packs || 0
      console.log("[VEST] Status - plano:", planC, "+ packs:", packC, "= total:", planC + packC)
    }
  }, [])

  if (!user) return null

  // Nova estrutura: credits.plan e credits.packs
  const planCredits = user.credits?.plan || 0
  const packCredits = user.credits?.packs || 0
  const totalCredits = planCredits + packCredits
  const creditsLow = totalCredits <= 1
  const creditsOut = totalCredits === 0
  const isPremium = user.isPremium || false
  const daysUntilRenewal = userStorage.getDaysUntilRenewal()

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      <div
        className={`p-4 rounded-lg border-2 ${
          creditsOut
            ? "bg-red-50 border-red-300"
            : creditsLow
              ? "bg-yellow-50 border-yellow-300"
              : "bg-white border-neutral-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                creditsOut ? "bg-red-100" : creditsLow ? "bg-yellow-100" : "bg-[#5C1F33]/10"
              }`}
            >
              <Sparkles
                className={`w-5 h-5 ${creditsOut ? "text-red-600" : creditsLow ? "text-yellow-600" : "text-[#5C1F33]"}`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Looks Restantes</p>
              <p
                className={`text-2xl font-bold ${
                  creditsOut ? "text-red-600" : creditsLow ? "text-yellow-600" : "text-neutral-900"
                }`}
              >
                {totalCredits}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {planCredits > 0 && `${planCredits} do plano`}
                {planCredits > 0 && packCredits > 0 && " + "}
                {packCredits > 0 && `${packCredits} de packs`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Cada look</p>
            <p className="text-lg font-semibold text-neutral-700">2 opcoes</p>
            <p className="text-xs text-neutral-500">A e B</p>
          </div>
        </div>
      </div>

      {creditsOut && (
        <Alert className="border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Créditos esgotados!</strong> Adquira mais créditos para continuar criando looks profissionais.
          </AlertDescription>
        </Alert>
      )}

      {creditsLow && !creditsOut && (
        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Último crédito!</strong> Seu pack está quase acabando. Considere adquirir mais créditos.
          </AlertDescription>
        </Alert>
      )}

      <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPremium ? (
              <>
                <Crown className="w-4 h-4 text-[#5C1F33]" />
                <p className="text-sm font-medium text-neutral-700">Premium Ativo</p>
              </>
            ) : user.plan === "trial" ? (
              <>
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-neutral-700">Trial ({totalCredits} looks)</p>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-neutral-400" />
                <p className="text-sm text-neutral-500">Sem plano ativo</p>
              </>
            )}
          </div>
          {isPremium && daysUntilRenewal !== null && (
            <p className="text-xs text-neutral-500">
              Renova em <span className="font-semibold">{daysUntilRenewal} dias</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

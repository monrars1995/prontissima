import { Shield, Lock } from "lucide-react"

export default function SecurityBadge() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-full border border-neutral-200 shadow-sm">
      <div className="relative">
        <Shield className="w-4 h-4 text-[#5C1F33]" />
        <Lock className="w-2 h-2 text-amber-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <span className="text-xs font-medium text-neutral-700">Conexão Segura e Criptografada</span>
    </div>
  )
}

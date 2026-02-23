"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import AppLogo from "@/components/app-logo"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <AppLogo size="medium" />
      </div>

      <h1 className="text-2xl font-bold">Configuracoes</h1>

      {/* ALERTAS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Alertas</h2>

        <div className="space-y-2 text-sm text-neutral-700">
          <p>- Avisar antes da renovacao (48h antes)</p>
          <p>- Avisar quando creditos estiverem acabando</p>
          <p>- Notificar novos recursos e melhorias</p>
        </div>
      </section>

      {/* SUPORTE */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Suporte</h2>

        <div className="flex flex-col gap-2 text-sm text-neutral-700">
          <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="underline">
            Fale Conosco (WhatsApp)
          </a>

          <details className="p-3 bg-neutral-50 rounded-lg">
            <summary className="font-semibold cursor-pointer">FAQ — Perguntas Frequentes</summary>
            <div className="mt-2 space-y-2 text-sm">
              <p><strong>O que e Look Duplo?</strong><br/>Cada look gera 2 versoes (Look A + Look B). 1 credito = 2 opcoes.</p>
              <p><strong>Quantas opcoes recebo no Premium?</strong><br/>30 looks = 60 opcoes por mes.</p>
              <p><strong>O plano Basico tambem tem Look Duplo?</strong><br/>Sim. 10 looks = 20 opcoes.</p>
              <p><strong>Posso fazer upload de varias pecas na mesma foto?</strong><br/>Nao. 1 peca por foto e obrigatorio.</p>
              <p><strong>Como funciona o cancelamento?</strong><br/>Cancelamentos so sao validos se feitos ate 3 dias antes da renovacao.</p>
            </div>
          </details>

          <details className="p-3 bg-neutral-50 rounded-lg">
            <summary className="font-semibold cursor-pointer">Tutorial — Como Fotografar Pecas</summary>
            <div className="mt-2 space-y-2 text-sm">
              <p>- Fotografe 1 peca por foto.</p>
              <p>- Fundo claro ou neutro.</p>
              <p>- Iluminacao frontal.</p>
              <p>- Evite sombras e dobras excessivas.</p>
            </div>
          </details>

          <details className="p-3 bg-neutral-50 rounded-lg">
            <summary className="font-semibold cursor-pointer">Como funciona assinatura e creditos</summary>
            <div className="mt-2 space-y-2 text-sm">
              <p><strong>Plano Basico:</strong> 10 looks (20 opcoes) validos por 30 dias.</p>
              <p><strong>Plano Premium:</strong> 30 looks (60 opcoes) renovados mensalmente.</p>
              <p>Voce pode comprar packs adicionais a qualquer momento.</p>
              <p>Creditos nao utilizados expiram no fim do ciclo.</p>
            </div>
          </details>

          <details className="p-3 bg-neutral-50 rounded-lg">
            <summary className="font-semibold cursor-pointer">Sobre o PRONTISSIMA</summary>
            <div className="mt-2 space-y-2 text-sm">
              <p>O PRONTISSIMA e um assistente de estilo que monta looks completos com base nas suas pecas.</p>
              <p>Combina logica profissional de moda com regras de proporcao, paleta e ocasiao.</p>
              <p>Todo o sistema e protegido por direitos autorais e patente.</p>
            </div>
          </details>

          <details className="p-3 bg-neutral-50 rounded-lg">
            <summary className="font-semibold cursor-pointer">Termos de Uso</summary>
            <div className="mt-2 space-y-2 text-sm">
              <p>- Look Duplo: 1 credito = 2 opcoes.</p>
              <p>- Renovacao automatica a cada 30 dias.</p>
              <p>- Cancelamentos: validos apenas ate 3 dias antes da renovacao.</p>
              <p>- Proibido copiar, reproduzir ou fazer engenharia reversa.</p>
              <p>- Todos os direitos reservados sob patente.</p>
            </div>
          </details>

          <details className="p-3 bg-neutral-50 rounded-lg">
            <summary className="font-semibold cursor-pointer">Politica de Privacidade</summary>
            <div className="mt-2 space-y-2 text-sm">
              <p>- Suas imagens sao usadas apenas para gerar looks.</p>
              <p>- Nada e compartilhado com terceiros.</p>
              <p>- Dados sensiveis seguem normas LGPD/GDPR.</p>
            </div>
          </details>

          <details className="p-3 bg-neutral-50 rounded-lg">
            <summary className="font-semibold cursor-pointer">LGPD / GDPR</summary>
            <div className="mt-2 space-y-2 text-sm">
              <p>Voce pode solicitar delecao completa dos seus dados a qualquer momento.</p>
              <p>O app nao armazena imagens do corpo — apenas tags necessarias para estilismo.</p>
            </div>
          </details>

          <details className="p-3 bg-neutral-50 rounded-lg">
            <summary className="font-semibold cursor-pointer">Vantagens em ser Premium</summary>
            <div className="mt-2 space-y-2 text-sm">
              <p>- 30 looks mensais (60 opcoes)</p>
              <p>- Upload ilimitado</p>
              <p>- Prioridade em novos recursos</p>
              <p>- Packs extras com desconto</p>
            </div>
          </details>

          <p className="text-xs text-neutral-500 mt-4">Versao 1.0.0 — Todos os direitos reservados - Tecnologia protegida sob patente</p>
        </div>
      </section>

      {/* CONTA */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Conta</h2>

        <div className="flex flex-col gap-2 text-sm text-neutral-700">
          <button
            className="underline text-left"
            onClick={() => {
              localStorage.removeItem("prontissima_wardrobe")
              alert("Guarda-roupa limpo!")
            }}
          >
            Limpar guarda-roupa
          </button>

          <button
            className="underline text-left"
            onClick={() => {
              localStorage.removeItem("prontissima_user")
              router.push("/login")
            }}
          >
            Sair da conta
          </button>

          <button
            className="underline text-left text-red-600"
            onClick={() => {
              if (confirm("Tem certeza que deseja excluir sua conta permanentemente?")) {
                localStorage.clear()
                router.push("/")
              }
            }}
          >
            Excluir conta
          </button>
        </div>
      </section>
    </div>
  )
}

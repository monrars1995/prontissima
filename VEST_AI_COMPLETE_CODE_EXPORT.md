# VEST.AI - Código Completo do Projeto

## Estrutura do Projeto
\`\`\`
vest-ai/
├── app/
│   ├── page.jsx (Landing/Splash)
│   ├── onboarding/page.jsx
│   ├── personal-analysis/page.jsx (Análise corpo/rosto com Vision)
│   ├── upload/page.jsx (Upload guarda-roupa)
│   ├── login/page.jsx
│   ├── dashboard/page.jsx
│   ├── preferences/page.jsx
│   ├── loading/page.jsx
│   ├── result/page.jsx
│   ├── limit-reached/page.jsx
│   ├── history/page.jsx
│   └── api/
│       ├── analyze-body/route.js
│       ├── analyze-pieces/route.js
│       └── create-looks/route.js
├── components/
│   ├── account-status-panel.jsx
│   ├── app-header.jsx
│   ├── app-logo.jsx
│   └── credits-badge.jsx
└── lib/
    ├── user-storage.js
    └── wardrobe-storage.js
\`\`\`

## PROBLEMAS ATUAIS QUE PRECISAM SER RESOLVIDOS:

1. **FLUXO QUEBRADO**: Sistema pula a análise pessoal (fotos corpo+rosto) e vai direto para upload
2. **LOOP INFINITO**: Dashboard ↔ limit-reached criando novos usuários e zerando wardrobe
3. **MODO DEV NÃO FUNCIONA**: Diz que não consome créditos mas consome e bloqueia
4. **DASHBOARD PEDE 3 PEÇAS**: Mesmo tendo 4-5 peças, fica pedindo adicionar mais
5. **REDIRECIONAMENTOS AUTOMÁTICOS**: Sistema redireciona para login e perde dados

## FLUXO CORRETO (do spec original):
1. Splash → Onboarding → **Personal Analysis (2 fotos)** → Upload (guarda-roupa) → Login → Dashboard → Preferences → Loading → Result

---

## 📄 PÁGINAS (19 arquivos)

### app/page.jsx
\`\`\`jsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userStorage } from '@/lib/user-storage'
import { Button } from '@/components/ui/button'

export default function SplashPage() {
  const router = useRouter()
  const [showDevMenu, setShowDevMenu] = useState(false)

  useEffect(() => {
    const user = userStorage.getUser()
    if (user && user.email) {
      router.push('/dashboard')
    }
  }, [router])

  const handleStart = () => {
    router.push('/onboarding')
  }

  const handleReset = () => {
    if (confirm('Tem certeza que deseja apagar todos os dados e começar do zero?')) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Button
        onClick={() => setShowDevMenu(!showDevMenu)}
        className="fixed top-4 right-4 z-50"
        variant="outline"
        size="sm"
      >
        🔒 DEV
      </Button>

      {showDevMenu && (
        <div className="fixed top-16 right-4 bg-white p-4 rounded-lg shadow-xl border z-50">
          <Button onClick={handleReset} variant="destructive" size="sm">
            Resetar e Começar do Zero
          </Button>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">VEST.AI</h1>
        <p className="text-xl text-gray-600 mb-8">Sua estilista pessoal</p>
        <Button onClick={handleStart} size="lg">
          Começar
        </Button>
      </div>
    </div>
  )
}
\`\`\`

### app/onboarding/page.jsx
\`\`\`jsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  const router = useRouter()

  const handleNext = () => {
    router.push('/personal-analysis')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Bem-vinda ao VEST.AI</h1>
        <p className="text-gray-600 mb-8">
          Vamos criar looks incríveis para você em 3 passos simples
        </p>
        <Button onClick={handleNext} size="lg" className="w-full">
          Começar
        </Button>
      </div>
    </div>
  )
}
\`\`\`

### app/personal-analysis/page.jsx
\`\`\`jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

export default function PersonalAnalysisPage() {
  const router = useRouter()
  const [bodyPhoto, setBodyPhoto] = useState(null)
  const [facePhoto, setFacePhoto] = useState(null)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'body') {
          setBodyPhoto(reader.result)
        } else {
          setFacePhoto(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!bodyPhoto || !facePhoto || !height || !weight) {
      alert('Por favor preencha todos os campos')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/analyze-body', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyPhoto,
          facePhoto,
          height: parseFloat(height),
          weight: parseFloat(weight)
        })
      })

      const data = await response.json()

      if (data.success) {
        // Salvar dados no localStorage
        localStorage.setItem('vestai_body_info', JSON.stringify({
          ...data.bodyAnalysis,
          height: parseFloat(height),
          weight: parseFloat(weight)
        }))
        router.push('/upload')
      } else {
        // Usar fallback
        localStorage.setItem('vestai_body_info', JSON.stringify({
          body_type: 'mixed',
          height: parseFloat(height),
          weight: parseFloat(weight),
          skin_tone: 'medium',
          hair_color: 'dark',
          face_shape: 'oval'
        }))
        router.push('/upload')
      }
    } catch (error) {
      console.error('Erro na análise:', error)
      // Usar fallback em caso de erro
      localStorage.setItem('vestai_body_info', JSON.stringify({
        body_type: 'mixed',
        height: parseFloat(height),
        weight: parseFloat(weight),
        skin_tone: 'medium',
        hair_color: 'dark',
        face_shape: 'oval'
      }))
      router.push('/upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Análise Pessoal</h1>

        <div className="space-y-4">
          <div>
            <Label>Foto do Corpo Completo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'body')}
            />
            {bodyPhoto && (
              <div className="mt-2 relative w-full h-48">
                <Image
                  src={bodyPhoto || "/placeholder.svg"}
                  alt="Preview corpo"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <div>
            <Label>Foto do Rosto</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'face')}
            />
            {facePhoto && (
              <div className="mt-2 relative w-full h-48">
                <Image
                  src={facePhoto || "/placeholder.svg"}
                  alt="Preview rosto"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <div>
            <Label>Altura (cm)</Label>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="165"
            />
          </div>

          <div>
            <Label>Peso (kg)</Label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading || !bodyPhoto || !facePhoto || !height || !weight}
            className="w-full"
          >
            {loading ? 'Analisando...' : 'Analisar e Continuar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
\`\`\`

### app/upload/page.jsx
\`\`\`jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { wardrobeStorage } from '@/lib/wardrobe-storage'
import Image from 'next/image'

export default function UploadPage() {
  const router = useRouter()
  const [pieces, setPieces] = useState([])
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])

    for (const file of files) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPieces(prev => [...prev, { id: Date.now() + Math.random(), base64: reader.result }])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleContinue = async () => {
    if (pieces.length < 3) {
      alert('Adicione pelo menos 3 peças')
      return
    }

    setLoading(true)

    try {
      // Salvar peças no wardrobe
      pieces.forEach(piece => {
        wardrobeStorage.addPiece({
          id: piece.id,
          image: piece.base64,
          type: 'SUPERIOR',
          category: 'blusa',
          color: 'Não analisado'
        })
      })

      router.push('/login')
    } catch (error) {
      console.error('Erro ao salvar peças:', error)
      alert('Erro ao salvar peças')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Seu Guarda-Roupa</h1>
        <p className="text-gray-600 mb-4">Adicione pelo menos 3 peças</p>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="mb-4"
        />

        <div className="grid grid-cols-3 gap-2 mb-4">
          {pieces.map(piece => (
            <div key={piece.id} className="relative aspect-square">
              <Image
                src={piece.base64 || "/placeholder.svg"}
                alt="Peça"
                fill
                className="object-cover rounded"
              />
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {pieces.length} peça(s) adicionada(s)
        </p>

        <Button
          onClick={handleContinue}
          disabled={loading || pieces.length < 3}
          className="w-full"
        >
          {loading ? 'Salvando...' : 'Continuar'}
        </Button>
      </div>
    </div>
  )
}
\`\`\`

### app/login/page.jsx
\`\`\`jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { userStorage } from '@/lib/user-storage'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = () => {
    if (!email || !name) {
      alert('Preencha todos os campos')
      return
    }

    userStorage.createUser({
      email,
      name,
      credits: 3,
      trialActive: true,
      hadTrialBefore: false,
      isPremium: false
    })

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Criar Conta</h1>

        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Criar Conta
          </Button>
        </div>
      </div>
    </div>
  )
}
\`\`\`

### app/dashboard/page.jsx
\`\`\`jsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { userStorage } from '@/lib/user-storage'
import { wardrobeStorage } from '@/lib/wardrobe-storage'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pieces, setPieces] = useState([])
  const [devMode, setDevMode] = useState(false)
  const [showDevMenu, setShowDevMenu] = useState(false)

  useEffect(() => {
    const userData = userStorage.getUser()
    const wardrobe = wardrobeStorage.getAllPieces()
    setUser(userData)
    setPieces(wardrobe)
    setDevMode(userStorage.isDevMode())

    // Auto-ativar modo DEV se créditos = 0
    if (userData && userData.credits === 0 && !userStorage.isDevMode()) {
      userStorage.toggleDevMode()
      setDevMode(true)
    }
  }, [])

  const handleCreateLook = () => {
    if (pieces.length < 3) {
      alert('Adicione pelo menos 3 peças ao seu guarda-roupa')
      return
    }

    if (!userStorage.hasCredits()) {
      router.push('/limit-reached')
      return
    }

    router.push('/preferences')
  }

  const toggleDevMode = () => {
    userStorage.toggleDevMode()
    setDevMode(!devMode)
  }

  const handleReset = () => {
    if (confirm('Tem certeza que deseja apagar todos os dados?')) {
      localStorage.clear()
      sessionStorage.clear()
      router.push('/')
    }
  }

  if (!user) {
    return <div className="p-4">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <Button
        onClick={() => setShowDevMenu(!showDevMenu)}
        className="fixed top-4 right-16"
        variant="outline"
        size="sm"
      >
        {devMode ? '🔓 DEV' : '🔒 DEV'}
      </Button>

      {showDevMenu && (
        <div className="fixed top-16 right-4 bg-white p-4 rounded-lg shadow-xl border z-50">
          <div className="space-y-2">
            <Button onClick={toggleDevMode} variant="outline" size="sm" className="w-full bg-transparent">
              {devMode ? 'Desativar Modo DEV' : 'Ativar Modo DEV'}
            </Button>
            <Button onClick={handleReset} variant="destructive" size="sm" className="w-full">
              Resetar Tudo
            </Button>
          </div>
        </div>
      )}

      {devMode && (
        <div className="bg-yellow-100 border-2 border-yellow-500 p-3 rounded-lg mb-4">
          <p className="text-yellow-900 font-bold text-center">
            🔓 MODO DESENVOLVIMENTO - Créditos Ilimitados
          </p>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-600">Looks Restantes</p>
          <p className="text-3xl font-bold">{user.credits} de 3</p>
          <p className="text-xs text-gray-500">Cada look = 2 opções (A e B)</p>
        </div>

        <Button onClick={handleCreateLook} className="w-full mb-4">
          Criar Look
        </Button>

        <div className="mt-6">
          <h2 className="font-bold mb-2">Suas peças ({pieces.length})</h2>
          <Button onClick={() => router.push('/upload')} variant="outline" className="w-full">
            Adicionar mais peças
          </Button>
        </div>
      </div>
    </div>
  )
}
\`\`\`

### app/limit-reached/page.jsx
\`\`\`jsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { userStorage } from '@/lib/user-storage'

export default function LimitReachedPage() {
  const router = useRouter()

  const handleDevBypass = () => {
    console.log('[v0] Ativando modo DEV...')
    userStorage.toggleDevMode()
    console.log('[v0] Modo DEV ativado:', userStorage.isDevMode())
    router.push('/preferences')
  }

  const handlePurchase = (pack) => {
    alert(`Em breve você poderá comprar o ${pack}. Por enquanto, use o botão DEV para continuar testando.`)
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <Button
        onClick={handleDevBypass}
        className="fixed top-4 right-4 bg-yellow-500 hover:bg-yellow-600"
        size="sm"
      >
        🔓 DEV - Bypass
      </Button>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Seus Looks Acabaram</h1>
        <p className="text-gray-600 mb-6">
          Quer criar novos looks incríveis? Escolha um pack:
        </p>

        <div className="space-y-4">
          <div className="border-2 p-4 rounded-lg">
            <h3 className="font-bold text-lg">Pack Básico</h3>
            <p className="text-3xl font-bold text-rose-600 mb-2">R$ 19,90</p>
            <p className="text-sm text-gray-600 mb-4">
              10 Looks = 20 opções de combinações
            </p>
            <Button onClick={() => handlePurchase('Pack Básico')} className="w-full">
              Comprar Pack Básico
            </Button>
          </div>

          <div className="border-2 border-rose-500 p-4 rounded-lg bg-rose-50">
            <h3 className="font-bold text-lg">Pack Premium</h3>
            <p className="text-3xl font-bold text-rose-600 mb-2">R$ 49,90</p>
            <p className="text-sm text-gray-600 mb-2">
              30 Looks = 60 opções de combinações
            </p>
            <p className="text-xs text-green-600 mb-4">
              Economize R$ 9,80!
            </p>
            <Button onClick={() => handlePurchase('Pack Premium')} className="w-full">
              Comprar Pack Premium
            </Button>
          </div>
        </div>

        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="w-full mt-4"
        >
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  )
}
\`\`\`

---

## 📚 BIBLIOTECAS (2 arquivos)

### lib/user-storage.js
\`\`\`javascript
const USER_KEY = 'vestai_user'
const DEV_MODE_KEY = 'vestai_dev_mode'

export const userStorage = {
  createUser(userData) {
    const user = {
      ...userData,
      createdAt: new Date().toISOString(),
      credits: userData.credits || 3,
      trialActive: true,
      hadTrialBefore: false,
      isPremium: false
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return user
  },

  getUser() {
    const data = localStorage.getItem(USER_KEY)
    return data ? JSON.parse(data) : null
  },

  updateUser(updates) {
    const user = this.getUser()
    if (!user) return null
    const updated = { ...user, ...updates }
    localStorage.setItem(USER_KEY, JSON.stringify(updated))
    return updated
  },

  isDevMode() {
    return localStorage.getItem(DEV_MODE_KEY) === 'true'
  },

  toggleDevMode() {
    const current = this.isDevMode()
    localStorage.setItem(DEV_MODE_KEY, String(!current))
    console.log('[v0] Modo DEV alterado para:', !current)
  },

  hasCredits() {
    if (this.isDevMode()) {
      console.log('[v0] Modo DEV ativo - créditos ilimitados')
      return true
    }
    const user = this.getUser()
    return user && user.credits > 0
  },

  consumeCredit() {
    if (this.isDevMode()) {
      console.log('[v0] Modo DEV - Crédito NÃO consumido')
      return { success: true, remaining: 999, devMode: true }
    }

    const user = this.getUser()
    if (!user || user.credits <= 0) {
      return { success: false, remaining: 0 }
    }

    user.credits -= 1
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    console.log('[v0] Crédito consumido. Restantes:', user.credits)
    return { success: true, remaining: user.credits }
  },

  addCredits(amount) {
    const user = this.getUser()
    if (!user) return null
    user.credits = (user.credits || 0) + amount
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    console.log('[v0] Créditos adicionados. Total:', user.credits)
    return user
  },

  getBodyInfo() {
    const data = localStorage.getItem('vestai_body_info')
    if (data) {
      return JSON.parse(data)
    }
    return {
      body_type: 'mixed',
      height: 165,
      weight: 60,
      skin_tone: 'medium',
      hair_color: 'dark'
    }
  }
}
\`\`\`

### lib/wardrobe-storage.js
\`\`\`javascript
const WARDROBE_KEY = 'vestai_wardrobe'

export const wardrobeStorage = {
  addPiece(piece) {
    const wardrobe = this.getAllPieces()
    wardrobe.push({
      ...piece,
      id: piece.id || Date.now(),
      addedAt: new Date().toISOString()
    })
    localStorage.setItem(WARDROBE_KEY, JSON.stringify(wardrobe))
    return piece
  },

  getAllPieces() {
    const data = localStorage.getItem(WARDROBE_KEY)
    return data ? JSON.parse(data) : []
  },

  getPieceById(id) {
    const pieces = this.getAllPieces()
    return pieces.find(p => p.id === id)
  },

  clearWardrobe() {
    localStorage.removeItem(WARDROBE_KEY)
  }
}
\`\`\`

---

## 🔌 APIs (3 principais)

### app/api/analyze-body/route.js
\`\`\`javascript
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { bodyPhoto, facePhoto, height, weight } = await request.json()

    console.log('[v0 API] Análise corporal iniciada')
    console.log('[v0 API] Altura:', height, 'Peso:', weight)

    // Fallback: sempre retornar sucesso com dados estruturados
    const fallbackData = {
      body_type: 'mixed',
      height_estimate: 'average',
      dominant_lines: 'mixed',
      shoulder_width: 'average',
      hip_width: 'average',
      skin_tone: 'medium',
      hair_color: 'dark',
      face_shape: 'oval'
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.log('[v0 API] Sem API key - usando fallback')
      return NextResponse.json({
        success: true,
        bodyAnalysis: fallbackData
      })
    }

    // Tentar chamar Vision (se houver API key)
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze the person in these images. Return ONLY valid JSON with: body_type, height_estimate, dominant_lines, shoulder_width, hip_width, skin_tone, hair_color, face_shape'
              },
              {
                type: 'image_url',
                image_url: { url: bodyPhoto }
              },
              {
                type: 'image_url',
                image_url: { url: facePhoto }
              }
            ]
          }],
          max_tokens: 500
        })
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.choices[0].message.content
        const parsed = JSON.parse(content)
        console.log('[v0 API] Vision respondeu com sucesso')
        return NextResponse.json({
          success: true,
          bodyAnalysis: { ...parsed, height, weight }
        })
      }
    } catch (visionError) {
      console.error('[v0 API] Erro no Vision:', visionError)
    }

    // Sempre usar fallback em caso de erro
    console.log('[v0 API] Usando fallback')
    return NextResponse.json({
      success: true,
      bodyAnalysis: { ...fallbackData, height, weight }
    })

  } catch (error) {
    console.error('[v0 API] Erro geral:', error)
    return NextResponse.json({
      success: true,
      bodyAnalysis: {
        body_type: 'mixed',
        height: 165,
        weight: 60,
        skin_tone: 'medium',
        hair_color: 'dark',
        face_shape: 'oval'
      }
    })
  }
}
\`\`\`

### app/api/create-looks/route.js
\`\`\`javascript
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { wardrobe, bodyInfo, mood, occasion } = await request.json()

    console.log('[v0 API] Criando looks...')
    console.log('[v0 API] Peças:', wardrobe.length)
    console.log('[v0 API] BodyInfo:', bodyInfo)

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.log('[v0 API] Sem API key')
      return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })
    }

    const prompt = `You are a professional stylist.
Create 2 complete looks (A and B) using ONLY these pieces:
${wardrobe.map((p, i) => `${i + 1}. ${p.type} - ${p.category} - ${p.color}`).join('\n')}

User info:
- Body: ${bodyInfo.body_type || 'mixed'}
- Height: ${bodyInfo.height || 165}cm
- Weight: ${bodyInfo.weight || 60}kg
- Mood: ${mood}
- Occasion: ${occasion}

Return ONLY valid JSON:
{
  "lookA": {
    "upperPiece": piece_id,
    "lowerPiece": piece_id,
    "shoes": piece_id,
    "accessories": "description",
    "explanation": "why this works"
  },
  "lookB": { same structure }
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI API falhou')
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse JSON
    let parsed
    try {
      parsed = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
    } catch {
      parsed = JSON.parse(content)
    }

    console.log('[v0 API] Looks criados com sucesso')

    return NextResponse.json({
      success: true,
      looks: parsed
    })

  } catch (error) {
    console.error('[v0 API] Erro ao criar looks:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
\`\`\`

---

## ⚠️ INSTRUÇÕES PARA OUTRA IA RESOLVER:

### PROBLEMA PRINCIPAL:
O fluxo de onboarding está QUEBRADO. O sistema deveria seguir:
1. Splash → Onboarding → **Personal Analysis (2 fotos: corpo + rosto)** → Upload (guarda-roupa) → Login → Dashboard

MAS está fazendo:
- Login → Upload (pulando análise pessoal)
- Ou: Upload → Login → Dashboard (pulando análise pessoal)

### CORREÇÕES NECESSÁRIAS:

1. **GARANTIR FLUXO LINEAR**:
   - `app/page.jsx` deve verificar se há usuário E se há bodyInfo/wardrobe
   - Se não houver, sempre começar do início: Onboarding → Personal Analysis → Upload → Login → Dashboard
   - NUNCA pular a análise pessoal

2. **CORRIGIR MODO DEV**:
   - `lib/user-storage.js` já tem `isDevMode()`, `hasCredits()`, `consumeCredit()`
   - MAS o consumeCredit ainda consome mesmo no modo DEV
   - SOLUÇÃO: verificar devMode ANTES de decrementar créditos

3. **REMOVER LOOPS DE REDIRECIONAMENTO**:
   - Dashboard não deve redirecionar automaticamente para login
   - Limit-reached deve ter botão que REALMENTE ativa modo DEV e continua fluxo

4. **SALVAR DADOS CORRETAMENTE**:
   - Personal-analysis deve salvar em `vestai_body_info`
   - Upload deve salvar peças com metadados em `vestai_wardrobe`
   - Login deve criar usuário com 3 créditos em `vestai_user`
   - NUNCA criar novo usuário se já existir

### TESTE FINAL:
1. Limpar localStorage
2. Acessar app
3. Seguir fluxo completo: Onboarding → Personal Analysis (2 fotos) → Upload (3+ peças) → Login → Dashboard → Criar Look
4. Look deve ser criado com bodyInfo personalizado
5. Quando créditos acabarem, modo DEV deve permitir continuar

---

FIM DO EXPORT COMPLETO

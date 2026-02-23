import type React from "react"
import type { Metadata } from "next"
import { Cormorant_Garamond, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import DevButton from "@/components/dev-button"
import "./globals.css"

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
})
const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Prontíssima — Seu guarda-roupa inteligente",
    template: "%s | Prontíssima",
  },
  description:
    "Transforme seu guarda-roupa em looks incríveis com inteligência artificial. Análise de corpo, combinação de cores e sugestões de styling personalizadas.",
  generator: "Next.js",
  applicationName: "Prontíssima",
  keywords: ["moda", "styling", "guarda-roupa", "looks", "inteligência artificial", "consultoria de imagem"],
  authors: [{ name: "Prontíssima" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Prontíssima",
    title: "Prontíssima — Seu guarda-roupa inteligente",
    description: "Transforme seu guarda-roupa em looks incríveis com inteligência artificial.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prontíssima — Seu guarda-roupa inteligente",
    description: "Transforme seu guarda-roupa em looks incríveis com IA.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Prontíssima",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/icon-192.jpg", sizes: "192x192", type: "image/png" },
      { url: "/images/icon-512.jpg", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/images/icon-192.jpg", sizes: "192x192", type: "image/png" }],
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#5C1F33",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Prontíssima" />
        <link rel="apple-touch-icon" href="/images/icon-192.jpg" />
        <link rel="apple-touch-startup-image" href="/images/icon-512.jpg" />
      </head>
      <body className="font-sans antialiased grain-overlay">
        {children}
        <DevButton />
        <Analytics />
      </body>
    </html>
  )
}

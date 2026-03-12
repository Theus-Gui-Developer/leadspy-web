import { Geist_Mono, Figtree } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "LeadSpy",
    template: "%s — LeadSpy",
  },
  description:
    "Analise anúncios da concorrência, descubra o que está convertendo e escale suas campanhas com inteligência.",
  applicationName: "LeadSpy",
  keywords: [
    "espionar anúncios",
    "biblioteca de anúncios meta",
    "análise de concorrentes",
    "ferramentas para anunciantes",
    "facebook ads spy",
    "leadspy",
  ],
  authors: [{ name: "LeadSpy" }],
  creator: "LeadSpy",
  metadataBase: new URL("https://app.leadspy.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://app.leadspy.com.br",
    siteName: "LeadSpy",
    title: "LeadSpy — Espione os anúncios da concorrência",
    description:
      "Analise anúncios da concorrência, descubra o que está convertendo e escale suas campanhas com inteligência.",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "LeadSpy",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "LeadSpy — Espione os anúncios da concorrência",
    description:
      "Analise anúncios da concorrência, descubra o que está convertendo e escale suas campanhas com inteligência.",
    images: ["/android-chrome-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("dark antialiased", fontMono.variable, figtree.variable)}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}

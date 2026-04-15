import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'

import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils/cn'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Bethel Blog',
    template: '%s | Bethel Blog',
  },
  description:
    'Insights sobre produto, sistemas e empreendedorismo por Bethel.',
  applicationName: 'Bethel Blog',
  authors: [{ name: 'Bethel' }],
  creator: 'Bethel',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: 'Bethel Blog',
    title: 'Bethel Blog',
    description:
      'Insights sobre produto, sistemas e empreendedorismo por Bethel.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Bethel Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bethel Blog',
    description:
      'Insights sobre produto, sistemas e empreendedorismo por Bethel.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn('min-h-screen font-sans antialiased', jakarta.variable, jetbrains.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}

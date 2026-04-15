'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[app error boundary]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Algo deu errado</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Encontramos um problema inesperado. Pode tentar de novo ou voltar
        pra home.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Código: <code className="rounded bg-muted px-1">{error.digest}</code>
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Button onClick={reset} variant="default">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Voltar para a home</Link>
        </Button>
      </div>
    </div>
  )
}

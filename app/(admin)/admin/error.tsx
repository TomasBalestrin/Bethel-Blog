'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface AdminErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error('[admin error boundary]', error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-xl border border-destructive/40 bg-destructive/5 p-6">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Erro no admin</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Algo quebrou ao carregar esta área. Se persistir, cheque os logs
        do Vercel ou console do navegador.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Código: <code className="rounded bg-muted px-1">{error.digest}</code>
        </p>
      )}
      <Button onClick={reset} size="sm">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  )
}

'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'

interface SharePayload {
  url: string
  title: string
  text?: string
}

type ShareResult = 'shared' | 'copied' | 'cancelled' | 'error'

/**
 * Compartilhamento universal. Preferência:
 * 1. navigator.share (mobile/modern browsers)
 * 2. navigator.clipboard.writeText + toast (fallback desktop)
 */
export function useShare() {
  return useCallback(async (payload: SharePayload): Promise<ShareResult> => {
    if (typeof navigator === 'undefined') return 'error'

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(payload)
        return 'shared'
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') return 'cancelled'
        // fallback pra copy em outros erros
      }
    }

    try {
      await navigator.clipboard.writeText(payload.url)
      toast.success('Link copiado')
      return 'copied'
    } catch {
      toast.error('Não foi possível compartilhar')
      return 'error'
    }
  }, [])
}

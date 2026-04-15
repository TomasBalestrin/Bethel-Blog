'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

interface ShareButtonProps {
  url: string
  title: string
  text?: string
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  async function handleShare() {
    if (typeof navigator === 'undefined') return

    if (navigator.share) {
      try {
        await navigator.share({ url, title, text })
      } catch (error) {
        // Usuário cancelou — ignora. Outros erros, fallback copy.
        if ((error as Error)?.name !== 'AbortError') {
          await fallbackCopy()
        }
      }
      return
    }

    await fallbackCopy()
  }

  async function fallbackCopy() {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado')
    } catch {
      toast.error('Não foi possível compartilhar')
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void handleShare()}
      aria-label="Compartilhar post"
    >
      <Share2 className="h-4 w-4" />
      Compartilhar
    </Button>
  )
}

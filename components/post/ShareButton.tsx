'use client'

import { Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useShare } from '@/hooks/useShare'

interface ShareButtonProps {
  url: string
  title: string
  text?: string
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  const share = useShare()

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      onClick={() => void share({ url, title, text })}
      aria-label="Compartilhar post"
    >
      <Share2 className="h-4 w-4" />
      Compartilhar
    </Button>
  )
}

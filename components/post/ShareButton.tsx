'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { ShareModal } from './ShareModal'

interface ShareButtonProps {
  url: string
  title: string
  text?: string
  slug: string
  coverUrl?: string | null
}

export function ShareButton({
  title,
  text,
  slug,
  coverUrl,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => setOpen(true)}
        aria-label="Compartilhar post"
      >
        <Share2 className="h-4 w-4" />
        Compartilhar
      </Button>

      <ShareModal
        open={open}
        onOpenChange={setOpen}
        postTitle={title}
        postSlug={slug}
        postCover={coverUrl ?? null}
        postExcerpt={text ?? null}
      />
    </>
  )
}

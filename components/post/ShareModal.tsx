'use client'

import Image from 'next/image'
import {
  Facebook,
  Link2,
  Mail,
  MoreHorizontal,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LinkedInIcon, XIcon } from '@/lib/icons/social'

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postTitle: string
  postSlug: string
  postCover: string | null
  postExcerpt: string | null
}

export function ShareModal({
  open,
  onOpenChange,
  postTitle,
  postSlug,
  postCover,
  postExcerpt,
}: ShareModalProps) {
  const siteUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const postUrl = `${siteUrl}/p/${postSlug}`
  const shareText = postTitle

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl)
      toast.success('Link copiado!')
    } catch {
      toast.error('Não foi possível copiar')
    }
  }

  function openWindow(url: string) {
    window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer')
  }

  async function handleNativeShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: postExcerpt ?? '',
          url: postUrl,
        })
      } catch {
        /* user cancelled */
      }
    }
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(shareText + '\n\n' + postUrl)}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="px-6 pb-4 pt-6">
          <DialogTitle className="text-lg font-semibold">
            Compartilhar este post
          </DialogTitle>
        </DialogHeader>

        {/* Preview card */}
        <div className="px-6 pb-5">
          <div className="overflow-hidden rounded-xl border border-border">
            {postCover && (
              <div className="relative h-40 w-full bg-muted">
                <Image
                  src={postCover}
                  alt={postTitle}
                  fill
                  sizes="400px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="bg-muted/30 p-3">
              <p className="text-[11px] font-medium text-muted-foreground">
                Bethel Blog
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug">
                {postTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center gap-4">
            <ShareIcon label="Copiar link" onClick={() => void copyLink()}>
              <Link2 className="h-5 w-5" />
            </ShareIcon>
            <ShareIcon label="Facebook" onClick={() => openWindow(facebookUrl)}>
              <Facebook className="h-5 w-5" />
            </ShareIcon>
            <ShareIcon label="E-mail" onClick={() => { window.location.href = emailUrl }}>
              <Mail className="h-5 w-5" />
            </ShareIcon>
            <ShareIcon label="WhatsApp" onClick={() => openWindow(whatsappUrl)}>
              <Send className="h-5 w-5" />
            </ShareIcon>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <ShareIcon label="Mais" onClick={() => void handleNativeShare()}>
                <MoreHorizontal className="h-5 w-5" />
              </ShareIcon>
            )}
          </div>
        </div>

        {/* Extended list */}
        <div className="border-t border-border">
          <ShareListItem
            icon={<XIcon className="h-4 w-4" />}
            label="X (Twitter)"
            onClick={() => openWindow(twitterUrl)}
          />
          <ShareListItem
            icon={<LinkedInIcon className="h-4 w-4" />}
            label="LinkedIn"
            onClick={() => openWindow(linkedinUrl)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShareIcon({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2"
      aria-label={label}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-muted-foreground/20">
        {children}
      </div>
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
    </button>
  )
}

function ShareListItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-muted/50"
    >
      <span className="flex h-5 w-5 items-center justify-center text-foreground">
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

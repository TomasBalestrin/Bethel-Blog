'use client'

import { CopyLinkButton } from './CopyLinkButton'
import { LikeButton } from './LikeButton'
import { ShareButton } from './ShareButton'

interface PostActionsProps {
  postId: string
  initialLikes: number
  url: string
  title: string
  excerpt: string | null
}

export function PostActions({
  postId,
  initialLikes,
  url,
  title,
  excerpt,
}: PostActionsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Ações do post"
      className="
        fixed inset-x-4 bottom-4 z-30 flex items-center justify-center gap-2
        rounded-full border border-border bg-background/95 px-2 py-1.5
        shadow-lg backdrop-blur
        md:static md:inset-auto md:rounded-md md:border md:bg-background/80
        md:px-4 md:py-3 md:shadow-none md:justify-start
      "
    >
      <LikeButton postId={postId} initialCount={initialLikes} />
      <ShareButton url={url} title={title} text={excerpt ?? undefined} />
      <CopyLinkButton url={url} />
    </div>
  )
}

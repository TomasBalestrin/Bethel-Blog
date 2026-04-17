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
    <div className="border-y border-border py-3">
      <div
        role="toolbar"
        aria-label="Ações do post"
        className="flex items-center gap-3"
      >
        <LikeButton postId={postId} initialCount={initialLikes} />
        <div className="flex-1" />
        <ShareButton url={url} title={title} text={excerpt ?? undefined} />
        <CopyLinkButton url={url} />
      </div>
    </div>
  )
}

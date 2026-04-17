'use client'

import { CopyLinkButton } from './CopyLinkButton'
import { LikeButton } from './LikeButton'
import { ShareButton } from './ShareButton'

interface PostActionsProps {
  postId: string
  postSlug: string
  initialLikes: number
  url: string
  title: string
  excerpt: string | null
  coverUrl: string | null
}

export function PostActions({
  postId,
  postSlug,
  initialLikes,
  url,
  title,
  excerpt,
  coverUrl,
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
        <ShareButton
          url={url}
          title={title}
          text={excerpt ?? undefined}
          slug={postSlug}
          coverUrl={coverUrl}
        />
        <CopyLinkButton url={url} />
      </div>
    </div>
  )
}

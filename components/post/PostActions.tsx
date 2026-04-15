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
    <div className="sticky top-16 z-10 -mx-4 flex items-center gap-2 border-y border-border bg-background/80 px-4 py-3 backdrop-blur md:mx-0 md:rounded-md md:border md:px-4">
      <LikeButton postId={postId} initialCount={initialLikes} />
      <ShareButton url={url} title={title} text={excerpt ?? undefined} />
      <CopyLinkButton url={url} />
    </div>
  )
}

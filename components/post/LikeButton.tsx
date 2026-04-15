'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useLikedPosts } from '@/hooks/useLikedPosts'
import { cn } from '@/lib/utils/cn'

interface LikeButtonProps {
  postId: string
  initialCount: number
}

export function LikeButton({ postId, initialCount }: LikeButtonProps) {
  const { isLiked, setLiked, clientUuid, ready } = useLikedPosts()
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)

  const liked = ready && isLiked(postId)

  async function toggle() {
    if (pending || !clientUuid) return
    setPending(true)

    const nextLiked = !liked
    const delta = nextLiked ? 1 : -1

    // Optimistic UI
    setLiked(postId, nextLiked)
    setCount((current) => Math.max(0, current + delta))

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: nextLiked ? 'POST' : 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ client_uuid: clientUuid }),
      })
      if (!response.ok) throw new Error('like_failed')

      const payload = (await response.json()) as {
        data: { liked: boolean; count: number }
      }
      // Sincroniza com contagem autoritativa do servidor
      setCount(payload.data.count)
      setLiked(postId, payload.data.liked)
    } catch {
      // Revert
      setLiked(postId, !nextLiked)
      setCount((current) => Math.max(0, current - delta))
      toast.error('Não foi possível registrar. Tente novamente.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void toggle()}
      disabled={pending || !ready}
      className={cn(
        'gap-2',
        liked &&
          'border-red-400 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-300'
      )}
      aria-pressed={liked}
      aria-label={liked ? 'Descurtir' : 'Curtir'}
    >
      <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
      <span className="tabular-nums">{count}</span>
    </Button>
  )
}

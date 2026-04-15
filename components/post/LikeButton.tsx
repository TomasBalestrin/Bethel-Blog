'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

const STORAGE_KEY = 'bethel:liked-posts'

function getLikedSet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as unknown
    return new Set(Array.isArray(arr) ? (arr.filter((v) => typeof v === 'string') as string[]) : [])
  } catch {
    return new Set()
  }
}

function persistLiked(set: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    /* noop */
  }
}

function getClientUuid(): string {
  if (typeof window === 'undefined') return ''
  const key = 'bethel:client-uuid'
  let value = window.localStorage.getItem(key)
  if (!value) {
    value = crypto.randomUUID()
    window.localStorage.setItem(key, value)
  }
  return value
}

interface LikeButtonProps {
  postId: string
  initialCount: number
}

export function LikeButton({ postId, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setLiked(getLikedSet().has(postId))
  }, [postId])

  async function toggle() {
    if (pending) return
    setPending(true)

    const nextLiked = !liked
    const delta = nextLiked ? 1 : -1
    setLiked(nextLiked)
    setCount((current) => Math.max(0, current + delta))

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: nextLiked ? 'POST' : 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ client_uuid: getClientUuid() }),
      })
      if (!response.ok) throw new Error('like_failed')

      const set = getLikedSet()
      if (nextLiked) set.add(postId)
      else set.delete(postId)
      persistLiked(set)
    } catch {
      // revert otimista
      setLiked(!nextLiked)
      setCount((current) => Math.max(0, current - delta))
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
      disabled={pending}
      className={cn(
        'gap-2',
        liked && 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-300'
      )}
      aria-pressed={liked}
      aria-label={liked ? 'Descurtir' : 'Curtir'}
    >
      <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
      <span className="tabular-nums">{count}</span>
    </Button>
  )
}

'use client'

import { useEffect } from 'react'

/**
 * Dispara um POST /api/posts/[id]/view uma única vez ao montar.
 * O backend deduplica por cookie _session_id (UNIQUE post_id +
 * session_hash no banco), então spam no cliente é inofensivo.
 */
export function useViewTracker(postId: string | null | undefined) {
  useEffect(() => {
    if (!postId) return
    const controller = new AbortController()

    // pequeno delay pra não competir com renderização inicial
    const timer = setTimeout(() => {
      fetch(`/api/posts/${postId}/view`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'content-type': 'application/json' },
      }).catch(() => {
        /* silencioso — tracking é best-effort */
      })
    }, 1200)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [postId])
}

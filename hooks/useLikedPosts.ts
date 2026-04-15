'use client'

import { useCallback, useEffect, useState } from 'react'

const LIKED_KEY = 'bethel:liked-posts'
const UUID_KEY = 'bethel:client-uuid'

function readLikedMap(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(LIKED_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const entries = Object.entries(parsed as Record<string, unknown>)
        .filter(([, v]) => typeof v === 'boolean')
        .map(([k, v]) => [k, v as boolean] as const)
      return Object.fromEntries(entries)
    }
    return {}
  } catch {
    return {}
  }
}

function writeLikedMap(map: Record<string, boolean>) {
  try {
    window.localStorage.setItem(LIKED_KEY, JSON.stringify(map))
  } catch {
    /* noop */
  }
}

function readOrCreateUuid(): string {
  try {
    let uuid = window.localStorage.getItem(UUID_KEY)
    if (!uuid) {
      uuid = crypto.randomUUID()
      window.localStorage.setItem(UUID_KEY, uuid)
    }
    return uuid
  } catch {
    return ''
  }
}

interface UseLikedPostsResult {
  isLiked: (postId: string) => boolean
  setLiked: (postId: string, value: boolean) => void
  clientUuid: string | null
  ready: boolean
}

/**
 * Mantém um Map postId → boolean no localStorage + um UUID
 * persistente por navegador. Usar pra marcar visualmente posts
 * curtidos (cliente não é fonte de verdade — o servidor faz o
 * hash com IP). Ver ADR-002 em tech-stack.md.
 */
export function useLikedPosts(): UseLikedPostsResult {
  const [map, setMap] = useState<Record<string, boolean>>({})
  const [clientUuid, setClientUuid] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMap(readLikedMap())
    setClientUuid(readOrCreateUuid())
    setReady(true)
  }, [])

  const isLiked = useCallback((postId: string) => !!map[postId], [map])

  const setLiked = useCallback((postId: string, value: boolean) => {
    setMap((current) => {
      const next = { ...current, [postId]: value }
      writeLikedMap(next)
      return next
    })
  }, [])

  return { isLiked, setLiked, clientUuid, ready }
}

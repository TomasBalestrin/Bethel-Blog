'use client'

import { useViewTracker } from '@/hooks/useViewTracker'

/**
 * Wrapper client-only pra chamar useViewTracker em RSCs.
 * Não renderiza nada visível.
 */
export function ViewTracker({ postId }: { postId: string }) {
  useViewTracker(postId)
  return null
}

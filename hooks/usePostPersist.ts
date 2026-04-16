'use client'

import { useCallback, useState } from 'react'

import { autoExcerpt } from '@/lib/blocks/excerpt'
import type { PostContent } from '@/types/post-blocks'

interface PersistInput {
  title: string
  excerpt: string
  cover_url: string | null
  cover_alt: string
  meta_title: string
  meta_description: string
  content: PostContent
  category_ids: string[]
}

interface UsePostPersistResult {
  slug: string
  persist: (data: PersistInput) => Promise<void>
}

/**
 * Hook que retorna o callback de PATCH usado pelo auto-save +
 * mantém o slug atualizado (server pode regenerar quando título
 * muda). Não persiste se faltar título.
 */
export function usePostPersist(
  postId: string,
  initialSlug: string
): UsePostPersistResult {
  const [slug, setSlug] = useState(initialSlug)

  const persist = useCallback(
    async (data: PersistInput) => {
      if (!data.title.trim()) return
      const effectiveExcerpt = data.excerpt || autoExcerpt(data.content)

      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          excerpt: effectiveExcerpt || null,
          cover_url: data.cover_url,
          cover_alt: data.cover_alt || null,
          content: data.content,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
          category_ids: data.category_ids,
        }),
      })
      if (!response.ok) {
        const detail = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(detail.error ?? 'Falha ao salvar')
      }
      const { data: updated } = (await response.json()) as {
        data: { slug: string }
      }
      if (updated?.slug) setSlug(updated.slug)
    },
    [postId]
  )

  return { slug, persist }
}

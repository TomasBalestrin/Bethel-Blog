'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import type { useAutoSave } from '@/hooks/useAutoSave'

type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived'

interface UsePostMutationsParams {
  postId: string
  hasTitle: boolean
  hasCover: boolean
  flush: ReturnType<typeof useAutoSave>['flush']
  onStatusChange: (status: PostStatus) => void
}

interface UsePostMutationsResult {
  publishing: boolean
  scheduling: boolean
  manualSaving: boolean
  onManualSave: () => Promise<void>
  onPublishNow: () => Promise<void>
  onSchedule: (scheduledAt: string) => Promise<void>
}

async function readError(response: Response): Promise<string | undefined> {
  const detail = (await response.json().catch(() => ({}))) as { error?: string }
  return detail.error
}

export function usePostMutations({
  postId,
  hasTitle,
  hasCover,
  flush,
  onStatusChange,
}: UsePostMutationsParams): UsePostMutationsResult {
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [manualSaving, setManualSaving] = useState(false)

  async function onManualSave() {
    if (!hasTitle) {
      toast.error('Adicione um título antes de salvar')
      return
    }
    setManualSaving(true)
    try {
      await flush()
      toast.success('Rascunho salvo')
    } catch (error) {
      toast.error('Falha ao salvar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setManualSaving(false)
    }
  }

  async function onPublishNow() {
    if (!hasTitle) {
      toast.error('Adicione um título antes de publicar')
      return
    }
    if (!hasCover) {
      toast.error('Capa obrigatória', {
        description: 'Envie uma imagem de capa antes de publicar.',
      })
      return
    }
    setPublishing(true)
    try {
      await flush()
      const response = await fetch(`/api/admin/posts/${postId}/publish`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error((await readError(response)) ?? 'Falha ao publicar')
      }
      onStatusChange('published')
      toast.success('Post publicado')
      router.refresh()
    } catch (error) {
      toast.error('Falha ao publicar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setPublishing(false)
    }
  }

  async function onSchedule(scheduledAt: string) {
    if (!hasTitle) {
      toast.error('Adicione um título antes de agendar')
      return
    }
    if (!hasCover) {
      toast.error('Capa obrigatória', {
        description: 'Envie uma imagem de capa antes de agendar.',
      })
      return
    }
    setScheduling(true)
    try {
      await flush()
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'scheduled',
          scheduled_at: scheduledAt,
        }),
      })
      if (!response.ok) {
        throw new Error((await readError(response)) ?? 'Falha ao agendar')
      }
      onStatusChange('scheduled')
      toast.success('Post agendado')
      router.refresh()
    } catch (error) {
      toast.error('Falha ao agendar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setScheduling(false)
    }
  }

  return {
    publishing,
    scheduling,
    manualSaving,
    onManualSave,
    onPublishNow,
    onSchedule,
  }
}

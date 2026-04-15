'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  delayMs?: number
  enabled?: boolean
}

interface UseAutoSaveResult {
  status: AutoSaveStatus
  /** Timestamp do último save bem-sucedido (Date) ou null. */
  lastSavedAt: Date | null
  /** Label formatado: 'Salvando...' / 'Salvo 14:32' / 'Erro ao salvar'. */
  label: string
  /** Força save imediato (ex: ao publicar). */
  flush: () => Promise<void>
}

/**
 * Debounce auto-save. Usado no editor: dispara onSave depois de
 * `delayMs` (default 10s) sem mudanças. Evita loop quando `data`
 * não mudou por referência/igualdade.
 */
export function useAutoSave<T>({
  data,
  onSave,
  delayMs = 10_000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveResult {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedSnapshotRef = useRef<string>(JSON.stringify(data))
  const onSaveRef = useRef(onSave)

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  const runSave = useCallback(async (snapshot: T) => {
    setStatus('saving')
    try {
      await onSaveRef.current(snapshot)
      savedSnapshotRef.current = JSON.stringify(snapshot)
      setLastSavedAt(new Date())
      setStatus('saved')
    } catch (error) {
      console.error('[useAutoSave]', error)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const serialized = JSON.stringify(data)
    if (serialized === savedSnapshotRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void runSave(data)
    }, delayMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, delayMs, enabled, runSave])

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    await runSave(data)
  }, [data, runSave])

  const label = (() => {
    if (status === 'saving') return 'Salvando...'
    if (status === 'error') return 'Erro ao salvar'
    if (lastSavedAt) {
      const hh = String(lastSavedAt.getHours()).padStart(2, '0')
      const mm = String(lastSavedAt.getMinutes()).padStart(2, '0')
      return `Salvo ${hh}:${mm}`
    }
    return ''
  })()

  return { status, lastSavedAt, label, flush }
}

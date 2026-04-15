'use client'

import { useEffect, useState } from 'react'

/**
 * Retorna um valor "debounced": só é atualizado depois que `value`
 * parou de mudar por `delayMs` ms. Útil pra buscas (ex: input →
 * chamar API só quando usuário parar de digitar).
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

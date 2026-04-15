'use client'

import { useEffect, useState } from 'react'

/**
 * Barra fina no topo (position: fixed) que reflete o progresso
 * de scroll da página atual. Usa rAF pra evitar thrashing.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0

    function compute() {
      const doc = document.documentElement
      const scrollTop = doc.scrollTop || document.body.scrollTop
      const height = doc.scrollHeight - doc.clientHeight
      const pct = height > 0 ? (scrollTop / height) * 100 : 0
      setProgress(Math.min(100, Math.max(0, pct)))
    }

    function onScroll() {
      if (raf) return
      raf = requestAnimationFrame(() => {
        compute()
        raf = 0
      })
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
      role="progressbar"
      aria-label="Progresso de leitura"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

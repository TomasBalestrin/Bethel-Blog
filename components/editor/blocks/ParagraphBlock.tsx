'use client'

import { useEffect, useRef } from 'react'

import type { ParagraphBlock as ParagraphBlockData } from '@/types/post-blocks'

interface ParagraphBlockProps {
  block: ParagraphBlockData
  onChange: (patch: Partial<ParagraphBlockData>) => void
  actions: React.ReactNode
}

export function ParagraphBlock({ block, onChange, actions }: ParagraphBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [block.text])

  return (
    <div className="relative space-y-1">
      {actions}
      <textarea
        ref={textareaRef}
        value={block.text}
        onChange={(event) => onChange({ text: event.target.value })}
        placeholder="Escreva aqui. Use **negrito**, *itálico* e [links](https://...)."
        maxLength={5000}
        rows={3}
        aria-label="Texto do parágrafo"
        className="w-full resize-none bg-transparent text-base leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      />
      <p className="text-[11px] text-muted-foreground">
        Markdown inline: <code>**negrito**</code>, <code>*itálico*</code>,{' '}
        <code>[link](url)</code>
      </p>
    </div>
  )
}

'use client'

import type { HeadingBlock as HeadingBlockData } from '@/types/post-blocks'

interface HeadingBlockProps {
  block: HeadingBlockData
  onChange: (patch: Partial<HeadingBlockData>) => void
  actions: React.ReactNode
}

export function HeadingBlock({ block, onChange, actions }: HeadingBlockProps) {
  return (
    <div className="relative">
      {actions}
      <input
        type="text"
        value={block.text}
        onChange={(event) => onChange({ text: event.target.value })}
        placeholder="Subtítulo da seção"
        maxLength={200}
        aria-label="Texto do título"
        className="w-full bg-transparent font-serif text-2xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      />
    </div>
  )
}

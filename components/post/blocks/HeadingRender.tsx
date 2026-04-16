import type { HeadingBlock } from '@/types/post-blocks'

interface HeadingRenderProps {
  block: HeadingBlock
}

export function HeadingRender({ block }: HeadingRenderProps) {
  const text = block.text.trim()
  if (!text) return null

  return (
    <h2 className="mb-4 mt-10 font-serif text-2xl font-bold tracking-tight md:text-3xl">
      {text}
    </h2>
  )
}

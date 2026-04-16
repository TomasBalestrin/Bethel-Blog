import { PostContentSchema } from '@/types/post-blocks'
import type { Block, PostContent } from '@/types/post-blocks'

import { HeadingRender } from './blocks/HeadingRender'
import { ImageRender } from './blocks/ImageRender'
import { ParagraphRender } from './blocks/ParagraphRender'
import { VideoRender } from './blocks/VideoRender'

interface BlockRendererProps {
  content: PostContent | unknown
}

export function BlockRenderer({ content }: BlockRendererProps) {
  const parsed = PostContentSchema.safeParse(content)
  if (!parsed.success) {
    console.error('[BlockRenderer] content inválido', parsed.error.flatten())
    return (
      <div className="mx-auto max-w-[720px] rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Conteúdo indisponível.
      </div>
    )
  }

  const { blocks } = parsed.data
  if (blocks.length === 0) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-8 text-center text-sm text-muted-foreground">
        (sem conteúdo)
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-1 px-4">
      {blocks.map((block) => (
        <BlockSwitch key={block.id} block={block} />
      ))}
    </div>
  )
}

function BlockSwitch({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return <HeadingRender block={block} />
    case 'paragraph':
      return <ParagraphRender block={block} />
    case 'image':
      return <ImageRender block={block} />
    case 'video':
      return <VideoRender block={block} />
  }
}

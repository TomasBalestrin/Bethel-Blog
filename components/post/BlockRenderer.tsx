import { z } from 'zod'

import type { Block, PostContent } from '@/types/post-blocks'

import { HeadingRender } from './blocks/HeadingRender'
import { ImageRender } from './blocks/ImageRender'
import { ParagraphRender } from './blocks/ParagraphRender'
import { VideoRender } from './blocks/VideoRender'

// Schema de validação em runtime. Definido localmente pra manter o
// escopo desta tarefa fechado (types/post-blocks.ts não é editado).
const BaseBlockSchema = z.object({ id: z.string().min(1) })

const HeadingSchema = BaseBlockSchema.extend({
  type: z.literal('heading'),
  text: z.string(),
})
const ParagraphSchema = BaseBlockSchema.extend({
  type: z.literal('paragraph'),
  text: z.string(),
})
const ImageSchema = BaseBlockSchema.extend({
  type: z.literal('image'),
  url: z.string().url().nullable(),
  alt: z.string(),
  caption: z.string().optional(),
})
const VideoSchema = BaseBlockSchema.extend({
  type: z.literal('video'),
  provider: z.literal('youtube'),
  videoId: z.string().nullable(),
  caption: z.string().optional(),
})

const BlockSchema = z.discriminatedUnion('type', [
  HeadingSchema,
  ParagraphSchema,
  ImageSchema,
  VideoSchema,
])

const PostContentSchema = z.object({
  version: z.literal(1),
  blocks: z.array(BlockSchema),
})

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

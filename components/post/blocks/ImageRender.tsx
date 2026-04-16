import { BlogImage } from '@/components/shared/BlogImage'
import type { ImageBlock } from '@/types/post-blocks'

interface ImageRenderProps {
  block: ImageBlock
}

export function ImageRender({ block }: ImageRenderProps) {
  if (!block.url) return null

  const caption = block.caption?.trim()

  return (
    <figure className="my-8">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
        <BlogImage
          src={block.url}
          alt={block.alt || ''}
          fill
          sizes="(min-width: 1024px) 720px, 100vw"
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

import { getYouTubeEmbedUrl } from '@/lib/blocks/youtube'
import type { VideoBlock } from '@/types/post-blocks'

interface VideoRenderProps {
  block: VideoBlock
}

export function VideoRender({ block }: VideoRenderProps) {
  if (!block.videoId) return null

  const caption = block.caption?.trim()
  const src = getYouTubeEmbedUrl(block.videoId)

  return (
    <figure className="my-8">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <iframe
          src={src}
          title={caption || 'Vídeo do YouTube'}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
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

'use client'

import { useEffect, useRef, useState } from 'react'

import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/blocks/youtube'
import type { VideoBlock as VideoBlockData } from '@/types/post-blocks'

interface VideoBlockProps {
  block: VideoBlockData
  onChange: (patch: Partial<VideoBlockData>) => void
  actions: React.ReactNode
}

export function VideoBlock({ block, onChange, actions }: VideoBlockProps) {
  const [raw, setRaw] = useState(
    block.videoId ? `https://youtu.be/${block.videoId}` : ''
  )
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!raw.trim()) {
        setError(null)
        if (block.videoId !== null) onChange({ videoId: null })
        return
      }
      const videoId = extractYouTubeId(raw)
      if (!videoId) {
        setError('URL inválida. Cole um link do YouTube.')
        return
      }
      setError(null)
      if (videoId !== block.videoId) {
        onChange({ provider: 'youtube', videoId })
      }
    }, 400)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [raw, block.videoId, onChange])

  return (
    <div className="relative space-y-3">
      {actions}
      <label className="block text-xs">
        <span className="mb-1 block font-medium">URL do YouTube</span>
        <input
          type="url"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder="https://youtu.be/abc123..."
          aria-invalid={error ? 'true' : 'false'}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {error && (
          <span className="mt-1 block text-destructive">{error}</span>
        )}
      </label>

      {block.videoId && !error && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getYouTubeThumbnail(block.videoId)}
            alt="Thumbnail do vídeo"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      )}

      <label className="block text-xs">
        <span className="mb-1 block font-medium">Legenda (opcional)</span>
        <input
          type="text"
          value={block.caption ?? ''}
          onChange={(event) => onChange({ caption: event.target.value })}
          maxLength={200}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
    </div>
  )
}

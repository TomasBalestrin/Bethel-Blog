'use client'

import Image from 'next/image'

import { ImageUploader } from '@/components/admin/ImageUploader'
import type { ImageBlock as ImageBlockData } from '@/types/post-blocks'

interface ImageBlockProps {
  block: ImageBlockData
  onChange: (patch: Partial<ImageBlockData>) => void
  actions: React.ReactNode
}

export function ImageBlock({ block, onChange, actions }: ImageBlockProps) {
  const altMissing = Boolean(block.url) && !block.alt.trim()

  return (
    <div className="relative space-y-3">
      {actions}
      {!block.url ? (
        <ImageUploader
          value={null}
          onUploaded={(uploaded) => onChange({ url: uploaded.large })}
          label="Enviar imagem"
        />
      ) : (
        <div className="space-y-3">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={block.url}
              alt={block.alt || 'Pré-visualização'}
              fill
              sizes="(min-width: 1024px) 720px, 100vw"
              className="object-cover"
            />
          </div>
          <ImageUploader
            value={block.url}
            onUploaded={(uploaded) => onChange({ url: uploaded.large })}
            onRemove={() => onChange({ url: null, alt: '', caption: '' })}
            label="Trocar imagem"
          />
          <label className="block text-xs">
            <span className="mb-1 block font-medium">
              Texto alternativo * <span className="text-muted-foreground">(obrigatório)</span>
            </span>
            <input
              type="text"
              value={block.alt}
              onChange={(event) => onChange({ alt: event.target.value })}
              placeholder="Descreva a imagem pra acessibilidade"
              maxLength={200}
              aria-invalid={altMissing ? 'true' : 'false'}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {altMissing && (
              <span className="mt-1 block text-destructive">
                Alt text é obrigatório antes de publicar.
              </span>
            )}
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium">Legenda (opcional)</span>
            <input
              type="text"
              value={block.caption ?? ''}
              onChange={(event) => onChange({ caption: event.target.value })}
              placeholder="Legenda exibida abaixo da imagem"
              maxLength={200}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>
      )}
    </div>
  )
}

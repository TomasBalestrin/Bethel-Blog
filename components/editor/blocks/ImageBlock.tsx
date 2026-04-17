'use client'

import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

import { ImageUploader } from '@/components/admin/ImageUploader'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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

          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                <span>Informações da imagem</span>
                {altMissing && (
                  <span className="ml-auto text-xs text-destructive">
                    Alt obrigatório
                  </span>
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <label className="block text-xs">
                <span className="mb-1 block font-medium">
                  Texto alternativo <span className="text-destructive">*</span>
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
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  )
}

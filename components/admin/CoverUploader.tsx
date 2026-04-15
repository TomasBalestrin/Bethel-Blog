'use client'

import { ImageUploader, type UploadedImage } from './ImageUploader'

interface CoverUploaderProps {
  value: string | null
  onChange: (url: string | null) => void
  alt?: string | null
  onAltChange?: (alt: string) => void
}

export function CoverUploader({ value, onChange, alt, onAltChange }: CoverUploaderProps) {
  function handleUploaded(image: UploadedImage) {
    onChange(image.large)
  }

  return (
    <div className="space-y-3">
      <ImageUploader
        value={value}
        onUploaded={handleUploaded}
        onRemove={() => onChange(null)}
        label={value ? 'Substituir capa' : 'Enviar capa'}
      />
      {value && onAltChange && (
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Texto alternativo (acessibilidade)</span>
          <input
            type="text"
            value={alt ?? ''}
            onChange={(event) => onAltChange(event.target.value)}
            placeholder="Descrição breve da imagem"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={200}
          />
        </label>
      )}
    </div>
  )
}

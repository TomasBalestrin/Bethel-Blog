'use client'

import { useCallback, useRef, useState } from 'react'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { MAX_UPLOAD_BYTES } from '@/lib/image/variants'
import { cn } from '@/lib/utils/cn'

export interface UploadedImage {
  thumb: string
  medium: string
  large: string
  original: string
}

interface ImageUploaderProps {
  onUploaded: (image: UploadedImage) => void
  value?: string | null
  label?: string
  onRemove?: () => void
  className?: string
}

export function ImageUploader({
  onUploaded,
  value,
  label = 'Enviar imagem',
  onRemove,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const uploadFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error('Arquivo muito grande', {
          description: `Máximo ${MAX_UPLOAD_BYTES / 1024 / 1024}MB.`,
        })
        return
      }

      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string
          }
          throw new Error(payload.error ?? 'Falha no upload')
        }

        const payload = (await response.json()) as { data: UploadedImage }
        onUploaded(payload.data)
        toast.success('Imagem enviada')
      } catch (error) {
        toast.error('Falha no upload', {
          description: error instanceof Error ? error.message : undefined,
        })
      } finally {
        setIsUploading(false)
      }
    },
    [onUploaded]
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) void uploadFile(file)
    event.target.value = ''
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      void uploadFile(file)
    }
  }

  return (
    <div className={className}>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border px-4 py-8 text-sm text-muted-foreground transition-colors',
          isDragging && 'border-primary bg-accent',
          value && 'py-4'
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Preview"
            className="max-h-48 rounded-md object-cover"
          />
        ) : (
          <>
            <ImageIcon className="h-8 w-8" />
            <p>Arraste uma imagem ou clique pra selecionar</p>
            <p className="text-xs">
              JPG, PNG, WebP, HEIC, AVIF — até {MAX_UPLOAD_BYTES / 1024 / 1024}MB
            </p>
          </>
        )}

        <div className="mt-2 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? 'Enviando...' : label}
          </Button>
          {value && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
              Remover
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  )
}

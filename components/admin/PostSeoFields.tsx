'use client'

import type { UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SeoFields {
  meta_title?: string
  meta_description?: string
}

interface PostSeoFieldsProps {
  register: UseFormRegister<SeoFields>
}

/**
 * Bloco colapsável de SEO (meta_title + meta_description).
 * Extraído de PostForm pra manter o componente principal enxuto.
 */
export function PostSeoFields({ register }: PostSeoFieldsProps) {
  return (
    <details className="rounded-md border border-border p-4">
      <summary className="cursor-pointer text-sm font-medium">
        SEO (opcional)
      </summary>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="meta_title">Meta title</Label>
          <Input id="meta_title" maxLength={70} {...register('meta_title')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta_description">Meta description</Label>
          <Input
            id="meta_description"
            maxLength={160}
            {...register('meta_description')}
          />
        </div>
      </div>
    </details>
  )
}

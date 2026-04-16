'use client'

import { Controller, type Control, type UseFormRegister } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { autoExcerpt } from '@/lib/blocks/excerpt'
import type { PostContent } from '@/types/post-blocks'

import { CategorySelector, type CategoryOption } from './CategorySelector'
import { InstructorSelect, type InstructorOption } from './InstructorSelect'

interface FieldsShape {
  excerpt?: string
  instructor_id?: string
}

interface PostMetadataFieldsProps {
  register: UseFormRegister<FieldsShape>
  control: Control<FieldsShape>
  content: PostContent
  categoryIds: string[]
  onCategoriesChange: (ids: string[]) => void
  categories: CategoryOption[]
  instructors: InstructorOption[]
}

/**
 * Extraído de PostForm pra manter o componente principal ≤ 200
 * linhas. Agrupa os campos que acompanham o editor de conteúdo:
 * excerpt, instrutor e categorias.
 */
export function PostMetadataFields({
  register,
  control,
  content,
  categoryIds,
  onCategoriesChange,
  categories,
  instructors,
}: PostMetadataFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="excerpt">
          Excerpt{' '}
          <span className="text-xs font-normal text-muted-foreground">
            (vazio = auto-gerado)
          </span>
        </Label>
        <textarea
          id="excerpt"
          {...register('excerpt')}
          rows={3}
          maxLength={500}
          placeholder={
            autoExcerpt(content) || 'Resumo dos primeiros parágrafos'
          }
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructor_id">
          Instrutor <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="instructor_id"
          render={({ field, fieldState }) => (
            <InstructorSelect
              options={instructors}
              value={field.value ?? null}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Categorias</Label>
        <CategorySelector
          options={categories}
          value={categoryIds}
          onChange={onCategoriesChange}
        />
      </div>
    </div>
  )
}

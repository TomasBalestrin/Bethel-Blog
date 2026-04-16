'use client'

import { useState } from 'react'
import { Controller, useForm, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { BlockBuilder } from '@/components/editor/BlockBuilder'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAutoSave } from '@/hooks/useAutoSave'
import { usePostMutations } from '@/hooks/usePostMutations'
import { usePostPersist } from '@/hooks/usePostPersist'
import { normalizeContent } from '@/lib/blocks/excerpt'
import type { PostContent } from '@/types/post-blocks'

import { type CategoryOption } from './CategorySelector'
import { CoverUploader } from './CoverUploader'
import { type InstructorOption } from './InstructorSelect'
import { PostMetadataFields } from './PostMetadataFields'
import { PostSeoFields } from './PostSeoFields'
import { PublishControls } from './PublishControls'

const FormSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  excerpt: z.string().max(500).optional().default(''),
  cover_url: z.string().url().optional().nullable(),
  cover_alt: z.string().max(200).optional().default(''),
  instructor_id: z.string().uuid('Selecione um instrutor'),
  meta_title: z.string().max(70).optional().default(''),
  meta_description: z.string().max(160).optional().default(''),
})

type FormValues = z.infer<typeof FormSchema>
type SeoRegister = UseFormRegister<{ meta_title?: string; meta_description?: string }>
type MetaFieldsShape = { excerpt?: string; instructor_id?: string }

export interface PostInitialData {
  id: string
  title: string
  slug: string
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  excerpt: string | null
  cover_url: string | null
  cover_alt: string | null
  content: unknown
  meta_title: string | null
  meta_description: string | null
  scheduled_at: string | null
  published_at: string | null
  category_ids: string[]
  instructor_id: string | null
}

interface PostFormProps {
  post: PostInitialData
  categories: CategoryOption[]
  instructors: InstructorOption[]
}

export function PostForm({ post, categories, instructors }: PostFormProps) {
  const { control, register, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: post.title,
      excerpt: post.excerpt ?? '',
      cover_url: post.cover_url,
      cover_alt: post.cover_alt ?? '',
      instructor_id: post.instructor_id ?? undefined,
      meta_title: post.meta_title ?? '',
      meta_description: post.meta_description ?? '',
    },
  })

  const [content, setContent] = useState<PostContent>(() => normalizeContent(post.content))
  const [categoryIds, setCategoryIds] = useState<string[]>(post.category_ids)
  const [status, setStatus] = useState(post.status)

  const values = watch()

  const payload = {
    title: values.title ?? '',
    excerpt: values.excerpt ?? '',
    cover_url: values.cover_url ?? null,
    cover_alt: values.cover_alt ?? '',
    meta_title: values.meta_title ?? '',
    meta_description: values.meta_description ?? '',
    content,
    category_ids: categoryIds,
    instructor_id: values.instructor_id ?? null,
  }

  const { slug, persist } = usePostPersist(post.id, post.slug)

  const autoSave = useAutoSave({ data: payload, onSave: persist, delayMs: 10_000 })

  const mutations = usePostMutations({
    postId: post.id,
    hasTitle: !!payload.title.trim(),
    hasCover: !!payload.cover_url,
    flush: autoSave.flush,
    onStatusChange: setStatus,
  })

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Título do post"
            className="!h-12 !text-2xl font-semibold"
            aria-invalid={errors.title ? 'true' : 'false'}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Capa</Label>
          <Controller
            control={control}
            name="cover_url"
            render={({ field }) => (
              <Controller
                control={control}
                name="cover_alt"
                render={({ field: altField }) => (
                  <CoverUploader
                    value={field.value ?? null}
                    onChange={(url) => field.onChange(url)}
                    alt={altField.value ?? ''}
                    onAltChange={(alt) => altField.onChange(alt)}
                  />
                )}
              />
            )}
          />
        </div>

        <PostMetadataFields
          register={register as unknown as UseFormRegister<MetaFieldsShape>}
          control={control as unknown as Parameters<typeof PostMetadataFields>[0]['control']}
          content={content}
          categoryIds={categoryIds}
          onCategoriesChange={setCategoryIds}
          categories={categories}
          instructors={instructors}
        />

        <div className="space-y-2">
          <Label>Conteúdo</Label>
          <BlockBuilder value={content} onChange={setContent} />
        </div>

        <PostSeoFields register={register as unknown as SeoRegister} />
      </div>

      <PublishControls
        slug={slug}
        status={status}
        saveLabel={autoSave.label || (status === 'draft' ? 'Rascunho' : '')}
        saving={mutations.manualSaving || autoSave.status === 'saving'}
        publishing={mutations.publishing}
        scheduling={mutations.scheduling}
        onSave={() => void mutations.onManualSave()}
        onPublish={() => void mutations.onPublishNow()}
        onSchedule={(at) => void mutations.onSchedule(at)}
      />
    </div>
  )
}

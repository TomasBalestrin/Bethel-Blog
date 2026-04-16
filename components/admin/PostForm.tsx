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
import { autoExcerpt, normalizeContent } from '@/lib/blocks/excerpt'
import type { PostContent } from '@/types/post-blocks'

import { CategorySelector, type CategoryOption } from './CategorySelector'
import { CoverUploader } from './CoverUploader'
import { PostSeoFields } from './PostSeoFields'
import { PublishControls } from './PublishControls'

const FormSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  excerpt: z.string().max(500).optional().default(''),
  cover_url: z.string().url().optional().nullable(),
  cover_alt: z.string().max(200).optional().default(''),
  meta_title: z.string().max(70).optional().default(''),
  meta_description: z.string().max(160).optional().default(''),
})

type FormValues = z.infer<typeof FormSchema>
type SeoRegister = UseFormRegister<{ meta_title?: string; meta_description?: string }>

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
}

interface PostFormProps {
  post: PostInitialData
  categories: CategoryOption[]
}

export function PostForm({ post, categories }: PostFormProps) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: post.title,
      excerpt: post.excerpt ?? '',
      cover_url: post.cover_url,
      cover_alt: post.cover_alt ?? '',
      meta_title: post.meta_title ?? '',
      meta_description: post.meta_description ?? '',
    },
  })

  const [content, setContent] = useState<PostContent>(() =>
    normalizeContent(post.content)
  )
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
  }

  const { slug, persist } = usePostPersist(post.id, post.slug)

  const autoSave = useAutoSave({
    data: payload,
    onSave: persist,
    delayMs: 10_000,
  })

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
            <Label>Categorias</Label>
            <CategorySelector
              options={categories}
              value={categoryIds}
              onChange={setCategoryIds}
            />
          </div>
        </div>

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

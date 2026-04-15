'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { JSONContent } from '@tiptap/react'
import { z } from 'zod'

import { BlockEditorDynamic } from '@/components/editor/BlockEditorDynamic'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAutoSave } from '@/hooks/useAutoSave'

import { CategorySelector, type CategoryOption } from './CategorySelector'
import { CoverUploader } from './CoverUploader'
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

export interface PostInitialData {
  id: string
  title: string
  slug: string
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  excerpt: string | null
  cover_url: string | null
  cover_alt: string | null
  content: JSONContent | null
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

function extractPlainText(node: unknown, limit = 500): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) {
    let acc = ''
    for (const child of node) {
      acc += extractPlainText(child, limit - acc.length)
      if (acc.length >= limit) break
      acc += ' '
    }
    return acc
  }
  if (typeof node === 'object') {
    const n = node as { text?: unknown; content?: unknown }
    const self = typeof n.text === 'string' ? n.text : ''
    const rest = n.content ? extractPlainText(n.content, limit - self.length) : ''
    return self + (self && rest ? ' ' : '') + rest
  }
  return ''
}

function autoExcerpt(content: JSONContent | null): string {
  const text = extractPlainText(content).trim().replace(/\s+/g, ' ')
  return text.length > 160 ? `${text.slice(0, 157)}...` : text
}

interface SavePayload {
  title: string
  excerpt: string
  cover_url: string | null
  cover_alt: string
  meta_title: string
  meta_description: string
  content: JSONContent
  category_ids: string[]
}

export function PostForm({ post, categories }: PostFormProps) {
  const router = useRouter()

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

  const [content, setContent] = useState<JSONContent>(
    post.content ?? { type: 'doc', content: [{ type: 'paragraph' }] }
  )
  const [categoryIds, setCategoryIds] = useState<string[]>(post.category_ids)
  const [status, setStatus] = useState(post.status)
  const [slug, setSlug] = useState(post.slug)

  const [publishing, setPublishing] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [manualSaving, setManualSaving] = useState(false)

  const values = watch()

  const payload: SavePayload = {
    title: values.title ?? '',
    excerpt: values.excerpt ?? '',
    cover_url: values.cover_url ?? null,
    cover_alt: values.cover_alt ?? '',
    meta_title: values.meta_title ?? '',
    meta_description: values.meta_description ?? '',
    content,
    category_ids: categoryIds,
  }

  const persist = useCallback(
    async (data: SavePayload) => {
      if (!data.title.trim()) return // não salva sem título
      const effectiveExcerpt = data.excerpt || autoExcerpt(data.content)

      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          excerpt: effectiveExcerpt || null,
          cover_url: data.cover_url,
          cover_alt: data.cover_alt || null,
          content: data.content,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
          category_ids: data.category_ids,
        }),
      })
      if (!response.ok) {
        const detail = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(detail.error ?? 'Falha ao salvar')
      }
      const { data: updated } = (await response.json()) as {
        data: { slug: string }
      }
      if (updated?.slug) setSlug(updated.slug)
    },
    [post.id]
  )

  const autoSave = useAutoSave({
    data: payload,
    onSave: persist,
    delayMs: 10_000,
  })

  const isTitleValid = !!payload.title.trim()

  async function onManualSave() {
    if (!isTitleValid) {
      toast.error('Adicione um título antes de salvar')
      return
    }
    setManualSaving(true)
    try {
      await autoSave.flush()
      toast.success('Rascunho salvo')
    } catch (error) {
      toast.error('Falha ao salvar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setManualSaving(false)
    }
  }

  async function onPublishNow() {
    if (!isTitleValid) {
      toast.error('Adicione um título antes de publicar')
      return
    }
    if (!payload.cover_url) {
      toast.error('Capa obrigatória', {
        description: 'Envie uma imagem de capa antes de publicar.',
      })
      return
    }
    setPublishing(true)
    try {
      await autoSave.flush()
      const response = await fetch(`/api/admin/posts/${post.id}/publish`, {
        method: 'POST',
      })
      if (!response.ok) {
        const detail = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(detail.error ?? 'Falha ao publicar')
      }
      setStatus('published')
      toast.success('Post publicado')
      router.refresh()
    } catch (error) {
      toast.error('Falha ao publicar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setPublishing(false)
    }
  }

  async function onSchedule(scheduledAt: string) {
    if (!isTitleValid) {
      toast.error('Adicione um título antes de agendar')
      return
    }
    if (!payload.cover_url) {
      toast.error('Capa obrigatória', {
        description: 'Envie uma imagem de capa antes de agendar.',
      })
      return
    }
    setScheduling(true)
    try {
      await autoSave.flush()
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'scheduled',
          scheduled_at: scheduledAt,
        }),
      })
      if (!response.ok) {
        const detail = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(detail.error ?? 'Falha ao agendar')
      }
      setStatus('scheduled')
      toast.success('Post agendado')
      router.refresh()
    } catch (error) {
      toast.error('Falha ao agendar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setScheduling(false)
    }
  }

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
              placeholder={autoExcerpt(content) || 'Resumo dos primeiros parágrafos'}
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
          <BlockEditorDynamic
            initialContent={post.content ?? undefined}
            onChange={setContent}
          />
        </div>

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
      </div>

      <PublishControls
        slug={slug}
        status={status}
        saveLabel={autoSave.label || (status === 'draft' ? 'Rascunho' : '')}
        saving={manualSaving || autoSave.status === 'saving'}
        publishing={publishing}
        scheduling={scheduling}
        onSave={() => void onManualSave()}
        onPublish={() => void onPublishNow()}
        onSchedule={(at) => void onSchedule(at)}
      />
    </div>
  )
}

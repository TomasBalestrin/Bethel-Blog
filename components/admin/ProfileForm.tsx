'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  UpdateProfileSchema,
  type UpdateProfileInput,
} from '@/lib/schemas/profile'

import { CoverUploader } from './CoverUploader'

export interface ProfileInitialData {
  name: string
  avatar_url: string
  bio: string | null
  blog_title: string
  blog_description: string | null
}

interface ProfileFormProps {
  profile: ProfileInitialData
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: profile.name,
      avatar_url: profile.avatar_url,
      bio: profile.bio ?? '',
      blog_title: profile.blog_title,
      blog_description: profile.blog_description ?? '',
    },
  })

  async function onSubmit(data: UpdateProfileInput) {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const detail = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(detail.error ?? 'Falha ao salvar')
      }
      toast.success('Configurações salvas')
      reset(data)
      router.refresh()
    } catch (error) {
      toast.error('Não foi possível salvar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Perfil</h2>
          <p className="text-sm text-muted-foreground">
            Visível no header público, bio do autor e OG images.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Avatar *</Label>
          <Controller
            control={control}
            name="avatar_url"
            render={({ field }) => (
              <CoverUploader
                value={field.value ?? null}
                onChange={(url) => field.onChange(url ?? '')}
              />
            )}
          />
          {errors.avatar_url && (
            <p className="text-sm text-destructive">
              {errors.avatar_url.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" maxLength={50} {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            rows={4}
            maxLength={500}
            {...register('bio')}
            placeholder="Breve descrição sobre você"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {errors.bio && (
            <p className="text-sm text-destructive">{errors.bio.message}</p>
          )}
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <div>
          <h2 className="text-lg font-semibold">Blog</h2>
          <p className="text-sm text-muted-foreground">
            Título e descrição exibidos na home e metadata.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="blog_title">Título do blog *</Label>
          <Input
            id="blog_title"
            maxLength={50}
            {...register('blog_title')}
          />
          {errors.blog_title && (
            <p className="text-sm text-destructive">
              {errors.blog_title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="blog_description">Descrição</Label>
          <textarea
            id="blog_description"
            rows={2}
            maxLength={200}
            {...register('blog_description')}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {errors.blog_description && (
            <p className="text-sm text-destructive">
              {errors.blog_description.message}
            </p>
          )}
        </div>
      </section>

      <div className="flex justify-end border-t border-border pt-6">
        <Button type="submit" disabled={saving || !isDirty}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </form>
  )
}

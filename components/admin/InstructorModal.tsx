'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { ImageUploader } from '@/components/admin/ImageUploader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CreateInstructorSchema,
  type CreateInstructorInput,
} from '@/lib/schemas/instructor'
import { generateSlug } from '@/lib/utils/slug'
import type { Instructor } from '@/types/instructor'

interface InstructorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instructor?: Instructor | null
}

export function InstructorModal({
  open,
  onOpenChange,
  instructor,
}: InstructorModalProps) {
  const router = useRouter()
  const isEditing = Boolean(instructor)
  const slugManuallyEdited = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateInstructorInput>({
    resolver: zodResolver(CreateInstructorSchema),
    defaultValues: { name: '', slug: '', avatar_url: '', bio: '' },
  })

  useEffect(() => {
    if (!open) return
    slugManuallyEdited.current = isEditing
    reset({
      name: instructor?.name ?? '',
      slug: instructor?.slug ?? '',
      avatar_url: instructor?.avatar_url ?? '',
      bio: instructor?.bio ?? '',
    })
  }, [open, instructor, isEditing, reset])

  const avatarUrl = watch('avatar_url')

  function handleNameBlur(event: React.FocusEvent<HTMLInputElement>) {
    if (slugManuallyEdited.current) return
    const generated = generateSlug(event.target.value)
    if (generated) setValue('slug', generated, { shouldValidate: true })
  }

  async function onSubmit(data: CreateInstructorInput) {
    try {
      const url = isEditing
        ? `/api/admin/instructors/${instructor!.id}`
        : '/api/admin/instructors'
      const method = isEditing ? 'PATCH' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const detail = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(detail.error ?? 'Falha na operação')
      }
      toast.success(isEditing ? 'Instrutor atualizado' : 'Instrutor criado')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast.error('Falha', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar instrutor' : 'Novo instrutor'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inst-name">Nome *</Label>
            <Input
              id="inst-name"
              maxLength={100}
              autoFocus
              {...register('name', { onBlur: handleNameBlur })}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inst-slug">Slug *</Label>
            <Input
              id="inst-slug"
              maxLength={100}
              className="font-mono"
              {...register('slug', {
                onChange: () => {
                  slugManuallyEdited.current = true
                },
              })}
              aria-invalid={errors.slug ? 'true' : 'false'}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Avatar *</Label>
            {avatarUrl && (
              <div className="flex justify-center">
                <Image src={avatarUrl} alt="Pré-visualização" width={80} height={80} className="h-20 w-20 rounded-full object-cover" />
              </div>
            )}
            <ImageUploader
              value={avatarUrl || null}
              onUploaded={(image) => setValue('avatar_url', image.thumb, { shouldValidate: true })}
              onRemove={() => setValue('avatar_url', '', { shouldValidate: true })}
              label={avatarUrl ? 'Trocar avatar' : 'Enviar avatar'}
            />
            {errors.avatar_url && <p className="text-sm text-destructive">{errors.avatar_url.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inst-bio">Bio</Label>
            <textarea
              id="inst-bio"
              rows={3}
              maxLength={500}
              {...register('bio')}
              placeholder="Breve descrição do instrutor"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

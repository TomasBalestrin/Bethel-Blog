'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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
import { CreateCategorySchema, type CreateCategoryInput } from '@/lib/schemas/category'

export interface CategoryRow {
  id: string
  name: string
  slug: string
  color: string
}

interface CategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: CategoryRow | null
}

export function CategoryModal({ open, onOpenChange, category }: CategoryModalProps) {
  const router = useRouter()
  const isEditing = Boolean(category)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: '',
      color: '#1A5CE6',
      slug: undefined,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: category?.name ?? '',
      color: category?.color ?? '#1A5CE6',
      slug: category?.slug,
    })
  }, [open, category, reset])

  const color = watch('color')

  async function onSubmit(data: CreateCategoryInput) {
    try {
      const url = isEditing
        ? `/api/admin/categories/${category!.id}`
        : '/api/admin/categories'
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
      toast.success(isEditing ? 'Categoria atualizada' : 'Categoria criada')
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
            {isEditing ? 'Editar categoria' : 'Nova categoria'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nome *</Label>
            <Input
              id="cat-name"
              maxLength={50}
              autoFocus
              {...register('name')}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-color">Cor</Label>
            <div className="flex items-center gap-3">
              <input
                id="cat-color"
                type="color"
                value={color}
                onChange={(event) => setValue('color', event.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent"
                aria-label="Cor da categoria"
              />
              <Input
                value={color}
                maxLength={7}
                onChange={(event) => setValue('color', event.target.value)}
                className="w-32 font-mono"
              />
              <span
                className="inline-flex h-9 flex-1 items-center rounded-md px-3 text-sm font-medium"
                style={{ backgroundColor: `${color}22`, color }}
              >
                Prévia
              </span>
            </div>
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
          </div>

          {isEditing && (
            <p className="text-xs text-muted-foreground">
              Slug atual: <code className="rounded bg-muted px-1">{category?.slug}</code>
              . Mudar o nome regenera automaticamente.
            </p>
          )}

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

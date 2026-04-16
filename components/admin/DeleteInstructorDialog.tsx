'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Instructor } from '@/types/instructor'

interface DeleteInstructorDialogProps {
  target: Instructor | null
  onClose: () => void
}

export function DeleteInstructorDialog({
  target,
  onClose,
}: DeleteInstructorDialogProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!target) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/instructors/${target.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const detail = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(detail.error ?? 'Falha ao deletar')
      }
      toast.success('Instrutor removido')
      onClose()
      router.refresh()
    } catch (error) {
      toast.error('Não foi possível deletar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog
      open={target !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remover {target?.name ?? 'instrutor'}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleDelete()
            }}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

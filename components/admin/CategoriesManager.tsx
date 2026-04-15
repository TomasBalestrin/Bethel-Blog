'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { CategoryModal, type CategoryRow } from './CategoryModal'

export interface CategoryWithCount extends CategoryRow {
  postsCount: number
}

interface CategoriesManagerProps {
  categories: CategoryWithCount[]
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryWithCount | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openNew() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(category: CategoryRow) {
    setEditing(category)
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const detail = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(detail.error ?? 'Falha ao deletar')
      }
      toast.success('Categoria deletada')
      setDeleteTarget(null)
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
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            {categories.length}{' '}
            {categories.length === 1 ? 'categoria' : 'categorias'}
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Nenhuma categoria cadastrada.
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-md border border-border md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Cor</th>
                  <th className="px-3 py-2 text-right">Posts</th>
                  <th className="w-24 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-muted/50">
                    <td className="px-3 py-2 font-medium">{category.name}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {category.slug}
                    </td>
                    <td className="px-3 py-2">
                      <ColorChip color={category.color} />
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {category.postsCount}
                    </td>
                    <td className="px-3 py-2">
                      <RowActions
                        onEdit={() => openEdit(category)}
                        onDelete={() => setDeleteTarget(category)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-2 md:hidden">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <ColorChip color={category.color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{category.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {category.slug} · {category.postsCount}{' '}
                    {category.postsCount === 1 ? 'post' : 'posts'}
                  </p>
                </div>
                <RowActions
                  onEdit={() => openEdit(category)}
                  onDelete={() => setDeleteTarget(category)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editing}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar “{deleteTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Categorias com posts vinculados
              não podem ser deletadas.
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
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ColorChip({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs">
      <span
        className="h-4 w-4 rounded-full border border-border"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {color.toUpperCase()}
    </span>
  )
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Editar"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Deletar"
        onClick={onDelete}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

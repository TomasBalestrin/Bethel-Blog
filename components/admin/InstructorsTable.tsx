'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pencil, Plus, Search, Trash2, UserCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/EmptyState'
import { useDebounce } from '@/hooks/useDebounce'
import type { Instructor } from '@/types/instructor'

import { DeleteInstructorDialog } from './DeleteInstructorDialog'
import { InstructorModal } from './InstructorModal'

interface InstructorsTableProps {
  data: Instructor[]
}

function truncate(value: string | null, max = 60): string {
  if (!value) return '—'
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function formatDate(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy', { locale: ptBR })
}

interface RowActionsProps {
  onEdit: () => void
  onDelete: () => void
}

function RowActions({ onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" aria-label="Editar" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Remover"
        onClick={onDelete}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function InstructorsTable({ data }: InstructorsTableProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Instructor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Instructor | null>(null)
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 300)

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return data
    return data.filter((inst) => inst.name.toLowerCase().includes(q))
  }, [data, debounced])

  function openNew() {
    setEditing(null)
    setModalOpen(true)
  }
  function openEdit(inst: Instructor) {
    setEditing(inst)
    setModalOpen(true)
  }

  if (data.length === 0) {
    return (
      <>
        <EmptyState
          icon={UserCircle2}
          title="Nenhum instrutor cadastrado"
          description="Cadastre instrutores pra atribuí-los aos posts."
          action={
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" />
              Criar primeiro instrutor
            </Button>
          }
        />
        <InstructorModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          instructor={editing}
        />
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome..."
            className="pl-9"
            aria-label="Buscar instrutor"
          />
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo instrutor
        </Button>
      </div>

      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-md border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-16 px-3 py-2"></th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Bio</th>
              <th className="px-3 py-2">Criado em</th>
              <th className="w-24 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((inst) => (
              <tr key={inst.id} className="hover:bg-muted/50">
                <td className="px-3 py-2">
                  <Image
                    src={inst.avatar_url}
                    alt={inst.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </td>
                <td className="px-3 py-2 font-semibold">{inst.name}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                  {inst.slug}
                </td>
                <td className="px-3 py-2 text-sm text-muted-foreground">
                  {truncate(inst.bio)}
                </td>
                <td className="px-3 py-2 text-sm text-muted-foreground">
                  {formatDate(inst.created_at)}
                </td>
                <td className="px-3 py-2">
                  <RowActions
                    onEdit={() => openEdit(inst)}
                    onDelete={() => setDeleteTarget(inst)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-2 md:hidden">
        {filtered.map((inst) => (
          <div key={inst.id} className="flex items-center gap-3 rounded-md border border-border p-3">
            <Image src={inst.avatar_url} alt={inst.name} width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{inst.name}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">{inst.slug}</p>
            </div>
            <RowActions onEdit={() => openEdit(inst)} onDelete={() => setDeleteTarget(inst)} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && query && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum instrutor bate com “{query}”.
        </p>
      )}

      <InstructorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        instructor={editing}
      />
      <DeleteInstructorDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  )
}

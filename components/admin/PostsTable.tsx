'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Archive,
  Copy,
  Eye,
  FileText,
  Heart,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
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
import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/cn'
import type { PostStatus } from '@/types/database'

export interface PostRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  content: unknown
  content_html: string | null
  status: PostStatus
  scheduled_at: string | null
  published_at: string | null
  views_count: number
  likes_count: number
  meta_title: string | null
  meta_description: string | null
  cover_alt: string | null
  created_at: string
  updated_at: string
  post_categories: {
    category_id: string
    categories: {
      id: string
      name: string
      slug: string
      color: string
    } | null
  }[]
}

interface PostsTableProps {
  posts: PostRow[]
}

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  published: 'Publicado',
  archived: 'Arquivado',
}

const STATUS_VARIANTS: Record<PostStatus, 'default' | 'secondary' | 'outline' | 'gold'> = {
  draft: 'secondary',
  scheduled: 'gold',
  published: 'default',
  archived: 'outline',
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return format(new Date(iso), "d MMM yyyy", { locale: ptBR })
}

export function PostsTable({ posts }: PostsTableProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhum post por aqui"
        description="Crie o primeiro post ou ajuste os filtros pra ver outros status."
        action={
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Novo post
          </Link>
        }
      />
    )
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-md border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-14 px-3 py-2"></th>
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Categorias</th>
              <th className="px-3 py-2 text-right">Views</th>
              <th className="px-3 py-2 text-right">Likes</th>
              <th className="px-3 py-2">Atualizado</th>
              <th className="w-10 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((post) => (
              <PostRowDesktop key={post.id} post={post} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {posts.map((post) => (
          <PostRowMobile key={post.id} post={post} />
        ))}
      </div>
    </>
  )
}

function PostRowDesktop({ post }: { post: PostRow }) {
  return (
    <tr className="hover:bg-muted/50">
      <td className="px-3 py-2">
        <Thumb url={post.cover_url} alt={post.cover_alt ?? post.title} />
      </td>
      <td className="px-3 py-2">
        <Link
          href={`/admin/posts/${post.id}/edit`}
          className="font-medium hover:underline"
        >
          {post.title}
        </Link>
        <p className="truncate text-xs text-muted-foreground">/p/{post.slug}</p>
      </td>
      <td className="px-3 py-2">
        <Badge variant={STATUS_VARIANTS[post.status]}>{STATUS_LABELS[post.status]}</Badge>
      </td>
      <td className="px-3 py-2">
        <CategoryChips categories={post.post_categories} />
      </td>
      <td className="px-3 py-2 text-right tabular-nums">{post.views_count}</td>
      <td className="px-3 py-2 text-right tabular-nums">{post.likes_count}</td>
      <td className="px-3 py-2 text-muted-foreground">{formatDate(post.updated_at)}</td>
      <td className="px-3 py-2 text-right">
        <RowActions post={post} />
      </td>
    </tr>
  )
}

function PostRowMobile({ post }: { post: PostRow }) {
  return (
    <div className="flex gap-3 rounded-md border border-border p-3">
      <Thumb url={post.cover_url} alt={post.cover_alt ?? post.title} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="min-w-0 flex-1 font-medium hover:underline"
          >
            <p className="truncate">{post.title}</p>
            <p className="truncate text-xs text-muted-foreground">/p/{post.slug}</p>
          </Link>
          <RowActions post={post} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={STATUS_VARIANTS[post.status]}>{STATUS_LABELS[post.status]}</Badge>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {post.views_count}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {post.likes_count}
          </span>
          <span>{formatDate(post.updated_at)}</span>
        </div>
        <CategoryChips categories={post.post_categories} />
      </div>
    </div>
  )
}

function Thumb({ url, alt }: { url: string | null; alt: string }) {
  if (!url) {
    return (
      <div className="h-10 w-10 rounded-md bg-muted" aria-hidden />
    )
  }
  return (
    <Image
      src={url}
      alt={alt}
      width={40}
      height={40}
      className="h-10 w-10 rounded-md object-cover"
    />
  )
}

function CategoryChips({ categories }: { categories: PostRow['post_categories'] }) {
  const visible = categories.filter((c) => c.categories)
  if (visible.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {visible.slice(0, 3).map((c) => (
        <span
          key={c.category_id}
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
          )}
          style={{
            backgroundColor: `${c.categories?.color}22`,
            color: c.categories?.color,
          }}
        >
          {c.categories?.name}
        </span>
      ))}
      {visible.length > 3 && (
        <span className="text-xs text-muted-foreground">
          +{visible.length - 3}
        </span>
      )}
    </div>
  )
}

function RowActions({ post }: { post: PostRow }) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, setPending] = useState<null | 'duplicate' | 'archive' | 'delete'>(null)

  async function handleDuplicate() {
    setPending('duplicate')
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: `${post.title} (cópia)`,
          slug: `${post.slug}-copia`,
          excerpt: post.excerpt,
          cover_url: post.cover_url,
          cover_alt: post.cover_alt,
          content: post.content ?? {},
          status: 'draft',
          category_ids: post.post_categories
            .map((c) => c.category_id)
            .filter(Boolean),
          meta_title: post.meta_title,
          meta_description: post.meta_description,
        }),
      })
      if (!response.ok) throw new Error('Falha ao duplicar')
      toast.success('Post duplicado como rascunho')
      router.refresh()
    } catch (error) {
      toast.error('Falha ao duplicar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setPending(null)
    }
  }

  async function handleArchive() {
    setPending('archive')
    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      })
      if (!response.ok) throw new Error('Falha ao arquivar')
      toast.success('Post arquivado')
      router.refresh()
    } catch (error) {
      toast.error('Falha ao arquivar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setPending(null)
    }
  }

  async function handleDelete() {
    setPending('delete')
    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Falha ao deletar')
      toast.success('Post deletado')
      router.refresh()
    } catch (error) {
      toast.error('Falha ao deletar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setPending(null)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Ações do post">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/admin/posts/${post.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void handleDuplicate()} disabled={pending !== null}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicar
          </DropdownMenuItem>
          {post.status !== 'archived' && (
            <DropdownMenuItem onSelect={() => void handleArchive()} disabled={pending !== null}>
              <Archive className="mr-2 h-4 w-4" />
              Arquivar
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              setConfirmDelete(true)
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar “{post.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              O post vai ser movido pra lixeira (soft delete). Não aparece mais
              no admin nem no público.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending === 'delete'}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={pending === 'delete'}
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

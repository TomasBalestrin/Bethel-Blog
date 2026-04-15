import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { PostsFilterTabs } from '@/components/admin/PostsFilterTabs'
import { PostsTable, type PostRow } from '@/components/admin/PostsTable'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils/cn'
import type { PostStatus } from '@/types/database'

export const metadata: Metadata = {
  title: 'Posts — Admin Bethel Blog',
  robots: { index: false, follow: false },
}

const PAGE_SIZE = 20
const VALID_STATUSES: PostStatus[] = ['draft', 'scheduled', 'published', 'archived']

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}

export default async function AdminPostsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const statusParam = params.status
  const currentStatus =
    statusParam && VALID_STATUSES.includes(statusParam as PostStatus)
      ? (statusParam as PostStatus)
      : 'all'
  const query = params.q?.trim() ?? ''
  const page = Math.max(1, Number(params.page ?? '1') || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  let listQuery = supabase
    .from('posts')
    .select(
      'id, title, slug, excerpt, cover_url, cover_alt, content, content_html, status, scheduled_at, published_at, views_count, likes_count, meta_title, meta_description, created_at, updated_at, post_categories(category_id, categories(id, name, slug, color))',
      { count: 'exact' }
    )
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (currentStatus !== 'all') {
    listQuery = listQuery.eq('status', currentStatus)
  }
  if (query) {
    listQuery = listQuery.ilike('title', `%${query}%`)
  }

  const { data, count, error } = await listQuery
  if (error) {
    console.error('[/admin/posts]', error)
  }

  const posts = (data ?? []) as unknown as PostRow[]
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'post' : 'posts'}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4" />
            Novo Post
          </Link>
        </Button>
      </div>

      <PostsFilterTabs currentStatus={currentStatus} currentQuery={query} />

      <PostsTable posts={posts} />

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} params={params} />
      )}
    </div>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  params: Awaited<PageProps['searchParams']>
}

function Pagination({ currentPage, totalPages, params }: PaginationProps) {
  function buildHref(page: number) {
    const next = new URLSearchParams()
    if (params.status) next.set('status', params.status)
    if (params.q) next.set('q', params.q)
    if (page > 1) next.set('page', String(page))
    const qs = next.toString()
    return qs ? `/admin/posts?${qs}` : '/admin/posts'
  }

  const prev = Math.max(1, currentPage - 1)
  const next = Math.min(totalPages, currentPage + 1)

  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-between border-t border-border pt-4 text-sm"
    >
      <Link
        href={buildHref(prev)}
        aria-disabled={currentPage === 1}
        className={cn(
          'text-muted-foreground transition-colors hover:text-foreground',
          currentPage === 1 && 'pointer-events-none opacity-50'
        )}
      >
        ← Anterior
      </Link>
      <span className="text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>
      <Link
        href={buildHref(next)}
        aria-disabled={currentPage === totalPages}
        className={cn(
          'text-muted-foreground transition-colors hover:text-foreground',
          currentPage === totalPages && 'pointer-events-none opacity-50'
        )}
      >
        Próxima →
      </Link>
    </nav>
  )
}

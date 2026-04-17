import type { Metadata } from 'next'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import {
  PostListItem,
  type PostListItemData,
} from '@/components/post/PostListItem'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Artigos — Bethel Blog',
  description: 'Todos os artigos publicados no Bethel Blog.',
}

interface JoinedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  published_at: string | null
  likes_count: number
  instructor: { name: string } | null
}

export default async function ArtigosPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, title, slug, excerpt, cover_url, published_at, likes_count, instructor:instructors(name)'
    )
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('[/artigos]', error)
  }

  const posts = (data ?? []) as unknown as JoinedPost[]

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-muted-foreground">
          Nenhum artigo publicado ainda.
        </p>
      </div>
    )
  }

  const grouped = new Map<string, PostListItemData[]>()
  for (const post of posts) {
    const key = post.published_at
      ? format(new Date(post.published_at), 'MMMM yyyy', {
          locale: ptBR,
        }).toUpperCase()
      : 'SEM DATA'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      cover_url: post.cover_url,
      published_at: post.published_at,
      likes_count: post.likes_count,
      instructor: post.instructor,
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-serif text-3xl font-bold">Artigos</h1>

      {Array.from(grouped.entries()).map(([monthYear, monthPosts], gi) => (
        <section key={monthYear}>
          <div className={`border-t border-border pb-2 pt-4 ${gi === 0 ? 'mt-6' : 'mt-10'}`}>
            <span className="text-sm font-semibold uppercase tracking-wide text-foreground/70">
              {monthYear}
            </span>
          </div>

          <div className="divide-y divide-border">
            {monthPosts.map((post) => (
              <PostListItem key={post.id} post={post} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

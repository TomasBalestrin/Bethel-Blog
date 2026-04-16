import type { Metadata } from 'next'
import { Search as SearchIcon } from 'lucide-react'

import { PostCard, type PostCardData } from '@/components/post/PostCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { SearchBar } from '@/components/shared/SearchBar'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Buscar — Bethel Blog',
}

interface JoinedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  cover_alt: string | null
  published_at: string | null
  reading_time: number | null
  views_count: number
  likes_count: number
  instructor:
    | { id: string; name: string; slug: string; avatar_url: string }
    | null
  post_categories:
    | {
        categories: { id: string; name: string; slug: string; color: string } | null
      }[]
    | null
}

function toCardData(post: JoinedPost): PostCardData {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    cover_url: post.cover_url,
    cover_alt: post.cover_alt,
    published_at: post.published_at,
    reading_time: post.reading_time,
    views_count: post.views_count,
    likes_count: post.likes_count,
    instructor: post.instructor,
    categories: (post.post_categories ?? [])
      .map((pc) => pc.categories)
      .filter((c): c is NonNullable<typeof c> => c !== null),
  }
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''

  let results: PostCardData[] = []
  if (query) {
    const supabase = await createClient()
    const pattern = `%${query}%`
    const { data, error } = await supabase
      .from('posts')
      .select(
        'id, title, slug, excerpt, cover_url, cover_alt, published_at, reading_time, views_count, likes_count, instructor:instructors(id, name, slug, avatar_url), post_categories(categories(id, name, slug, color))'
      )
      .eq('status', 'published')
      .is('deleted_at', null)
      .or(`title.ilike.${pattern},excerpt.ilike.${pattern}`)
      .order('published_at', { ascending: false })
      .limit(20)
    if (error) {
      console.error('[/search]', error)
    }
    results = ((data ?? []) as unknown as JoinedPost[]).map(toCardData)
  }

  return (
    <div className="container max-w-4xl space-y-8 py-8 md:py-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Buscar
        </h1>
        <SearchBar initialQuery={query} inline />
      </header>

      {!query && (
        <EmptyState
          icon={SearchIcon}
          title="Digite pra buscar"
          description="Tente por título ou por uma palavra do resumo do post."
        />
      )}

      {query && results.length === 0 && (
        <EmptyState
          icon={SearchIcon}
          title={`Nenhum resultado para "${query}"`}
          description="Tente uma palavra-chave diferente."
        />
      )}

      {results.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? 'resultado' : 'resultados'}{' '}
            para “{query}”
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            {results.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}


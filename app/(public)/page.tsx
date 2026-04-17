import type { Metadata } from 'next'

import { FeaturedPost } from '@/components/post/FeaturedPost'
import { PostCard, type PostCardData } from '@/components/post/PostCard'
import { PostGrid } from '@/components/post/PostGrid'
import { PopularSidebar, type PopularPost } from '@/components/post/PopularSidebar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Bethel Blog',
  description: 'Insights sobre produto, sistemas e empreendedorismo por Bethel.',
}

const TOP_LIMIT = 3
const LIST_PAGE_SIZE = 10

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
        category_id: string
        categories:
          | { id: string; name: string; slug: string; color: string }
          | null
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

export default async function HomePage() {
  const supabase = await createClient()

  const postsSelect =
    'id, title, slug, excerpt, cover_url, cover_alt, published_at, reading_time, views_count, likes_count, instructor:instructors(id, name, slug, avatar_url), post_categories(category_id, categories(id, name, slug, color))'

  const [topResult, listResult, popularResult] = await Promise.all([
    supabase
      .from('posts')
      .select(postsSelect)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .range(0, TOP_LIMIT - 1),
    supabase
      .from('posts')
      .select(postsSelect, { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .range(0, LIST_PAGE_SIZE - 1),
    supabase
      .from('v_popular_posts')
      .select('id, title, slug, cover_url')
      .limit(5),
  ])

  const top = (topResult.data ?? []) as unknown as JoinedPost[]
  const listPosts = (listResult.data ?? []) as unknown as JoinedPost[]
  const listTotal = listResult.count ?? 0
  const popularData = (popularResult.data ?? []) as unknown as (PopularPost & {
    id: string | null
    slug: string | null
    title: string | null
  })[]

  const featured = top[0] ? toCardData(top[0]) : null
  const recent = top.slice(1).map(toCardData)
  const listCards = listPosts.map(toCardData)
  const totalPages = Math.max(0, Math.ceil(listTotal / LIST_PAGE_SIZE))

  const popularPosts: PopularPost[] = popularData
    .filter((p): p is PopularPost => Boolean(p.id && p.slug && p.title))
    .map((p) => ({ id: p.id, slug: p.slug, title: p.title, cover_url: p.cover_url }))

  if (!featured) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-serif text-3xl font-bold">Bethel Blog</h1>
        <p className="mt-3 text-muted-foreground">Em breve.</p>
      </div>
    )
  }

  return (
    <div className="container space-y-12 py-10 md:py-14">
      {/* Hero grid: 3 cols */}
      <section className="grid gap-10 lg:grid-cols-[280px_1fr_280px]">
        <div className="order-2 space-y-8 lg:order-1">
          {recent.map((post) => (
            <PostCard key={post.id} post={post} variant="compact" />
          ))}
        </div>
        <div className="order-1 lg:order-2">
          <FeaturedPost post={featured} />
        </div>
        <div className="order-3">
          <PopularSidebar posts={popularPosts} />
        </div>
      </section>

      {/* Divider + Tabs */}
      <div className="border-t border-border pt-8">
        <Tabs defaultValue="recent">
          <TabsList className="bg-transparent p-0 gap-2">
            <TabsTrigger value="recent" className="rounded-full data-[state=active]:bg-muted data-[state=active]:shadow-none">
              Mais recentes
            </TabsTrigger>
            <TabsTrigger value="top" disabled className="rounded-full">
              Principais
            </TabsTrigger>
            <TabsTrigger value="discussions" disabled className="rounded-full">
              Discussões
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chronological list */}
      <section>
        <PostGrid
          initialPosts={listCards}
          initialPage={1}
          totalPages={totalPages}
          pageSize={LIST_PAGE_SIZE}
        />
      </section>
    </div>
  )
}

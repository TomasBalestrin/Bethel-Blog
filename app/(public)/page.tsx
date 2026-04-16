import type { Metadata } from 'next'

import { FeaturedPost } from '@/components/post/FeaturedPost'
import { PostCard, type PostCardData } from '@/components/post/PostCard'
import { PostGrid } from '@/components/post/PostGrid'
import { PopularSidebar, type PopularPost } from '@/components/post/PopularSidebar'
import {
  CategoryFilters,
  type CategoryFiltersItem,
} from '@/components/shared/CategoryFilters'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Bethel Blog',
  description:
    'Insights sobre produto, sistemas e empreendedorismo por Bethel.',
}

const TOP_LIMIT = 3 // 1 featured + 2 recentes compactos
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

  const [profileResult, topResult, listResult, popularResult, categoriesResult] =
    await Promise.all([
      supabase
        .from('profile')
        .select('name, avatar_url')
        .limit(1)
        .maybeSingle<{ name: string; avatar_url: string }>(),
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
      supabase
        .from('categories')
        .select('id, name, slug, color')
        .order('name'),
    ])

  const profile = profileResult.data
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

  const categories: CategoryFiltersItem[] = (categoriesResult.data ?? []).map(
    (c) => ({ id: c.id, name: c.name, slug: c.slug, color: c.color })
  )

  const popularPosts: PopularPost[] = popularData
    .filter((p): p is PopularPost => Boolean(p.id && p.slug && p.title))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      cover_url: p.cover_url,
    }))

  if (!featured) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Bethel Blog
        </h1>
        <p className="mt-3 text-muted-foreground">
          Em breve. Nenhum post publicado ainda.
        </p>
      </div>
    )
  }

  return (
    <div className="container space-y-10 py-8 md:py-12">
      {/* Hero grid */}
      <section className="grid gap-8 lg:grid-cols-12">
        <div className="order-2 space-y-6 lg:order-1 lg:col-span-4">
          {recent.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              variant="compact"
              authorName={profile?.name}
              authorAvatar={profile?.avatar_url}
            />
          ))}
        </div>

        <div className="order-1 lg:order-2 lg:col-span-5">
          <FeaturedPost
            post={featured}
            authorName={profile?.name}
            authorAvatar={profile?.avatar_url}
          />
        </div>

        <div className="order-3 lg:col-span-3">
          <PopularSidebar posts={popularPosts} />
        </div>
      </section>

      {/* Filters + Tabs */}
      <section className="space-y-4">
        <CategoryFilters categories={categories} />
        <Tabs defaultValue="recent">
          <TabsList>
            <TabsTrigger value="recent">Mais recentes</TabsTrigger>
            <TabsTrigger value="top" disabled>
              Principais
            </TabsTrigger>
            <TabsTrigger value="discussions" disabled>
              Discussões
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Chronological list */}
      <section>
        <PostGrid
          initialPosts={listCards}
          initialPage={1}
          totalPages={totalPages}
          pageSize={LIST_PAGE_SIZE}
          authorName={profile?.name}
          authorAvatar={profile?.avatar_url}
        />
      </section>
    </div>
  )
}

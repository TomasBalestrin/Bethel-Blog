import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FolderOpen } from 'lucide-react'

import { PostCard, type PostCardData } from '@/components/post/PostCard'
import { CategoryChip } from '@/components/shared/CategoryChip'
import { EmptyState } from '@/components/shared/EmptyState'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
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
    categories: (post.post_categories ?? [])
      .map((pc) => pc.categories)
      .filter((c): c is NonNullable<typeof c> => c !== null),
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', slug)
    .maybeSingle<{ name: string }>()
  if (!data) return { title: 'Categoria — Bethel Blog' }
  return {
    title: `${data.name} — Bethel Blog`,
    description: `Posts da categoria ${data.name} no Bethel Blog.`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug, color')
    .eq('slug', slug)
    .maybeSingle<{ id: string; name: string; slug: string; color: string }>()
  if (catError) console.error('[/category]', catError)
  if (!category) notFound()

  const [postsResult, otherCategoriesResult] = await Promise.all([
    supabase
      .from('posts')
      .select(
        'id, title, slug, excerpt, cover_url, cover_alt, published_at, reading_time, views_count, likes_count, post_categories!inner(category_id, categories(id, name, slug, color))'
      )
      .eq('status', 'published')
      .is('deleted_at', null)
      .eq('post_categories.category_id', category.id)
      .order('published_at', { ascending: false })
      .limit(30),
    supabase
      .from('categories')
      .select('id, name, slug, color')
      .neq('id', category.id)
      .order('name'),
  ])

  if (postsResult.error) console.error('[/category posts]', postsResult.error)

  const posts = ((postsResult.data ?? []) as unknown as JoinedPost[]).map(toCardData)
  const otherCategories = otherCategoriesResult.data ?? []

  return (
    <div className="space-y-10">
      <header
        className="-mt-0 border-b border-border"
        style={{ backgroundColor: `${category.color}14` }}
      >
        <div className="container max-w-4xl py-10 md:py-14">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: category.color }}
                aria-hidden
              />
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: category.color }}
              >
                Categoria
              </p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              {category.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {posts.length}{' '}
              {posts.length === 1 ? 'post publicado' : 'posts publicados'}
            </p>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl pb-16">
        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title={`Nenhum post em ${category.name} ainda`}
            description="Enquanto isso, explore outras categorias:"
            action={
              otherCategories.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {otherCategories.map((c) => (
                    <CategoryChip
                      key={c.id}
                      name={c.name}
                      slug={c.slug}
                      color={c.color}
                      size="md"
                    />
                  ))}
                </div>
              ) : null
            }
          />
        )}
      </div>
    </div>
  )
}

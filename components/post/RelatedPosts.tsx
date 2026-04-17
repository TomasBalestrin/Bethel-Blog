import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { createClient } from '@/lib/supabase/server'

interface RelatedPost {
  id: string
  title: string
  slug: string
  cover_url: string | null
  excerpt: string | null
  published_at: string | null
  instructor: { name: string } | null
}

interface RelatedPostsProps {
  currentPostId: string
}

function formatMeta(date: string | null, name: string | null): string {
  const parts: string[] = []
  if (date) {
    parts.push(format(new Date(date), "MMM d", { locale: ptBR }).toUpperCase())
  }
  if (name) parts.push(name.toUpperCase())
  return parts.join(' · ')
}

export async function RelatedPosts({ currentPostId }: RelatedPostsProps) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select(
      'id, title, slug, cover_url, excerpt, published_at, instructor:instructors(name)'
    )
    .eq('status', 'published')
    .is('deleted_at', null)
    .neq('id', currentPostId)
    .order('published_at', { ascending: false })
    .limit(8)

  const posts = (data ?? []) as unknown as RelatedPost[]
  if (posts.length === 0) return null

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="mb-6 font-serif text-xl font-bold">Mais artigos</h2>
      <div className="scrollbar-thin flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group w-[260px] min-w-[260px] flex-shrink-0 snap-start"
          >
            <Link href={`/p/${post.slug}`} className="block">
              {post.cover_url && (
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={post.cover_url}
                    alt={post.title}
                    fill
                    sizes="260px"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                </div>
              )}
              <h3 className="mt-3 line-clamp-2 font-serif text-base font-bold leading-tight transition-colors duration-200 group-hover:text-foreground/60">
                {post.title}
              </h3>
            </Link>
            {post.excerpt && (
              <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">
                {post.excerpt}
              </p>
            )}
            <p className="mt-2 text-[11px] tracking-wider text-muted-foreground">
              {formatMeta(post.published_at, post.instructor?.name ?? null)}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

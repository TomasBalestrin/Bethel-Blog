import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface PostCardData {
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
  categories?: { id: string; name: string; slug: string; color: string }[]
  instructor?: {
    id: string
    name: string
    slug: string
    avatar_url: string
  } | null
}

interface PostCardProps {
  post: PostCardData
  variant?: 'default' | 'compact'
  authorName?: string
  authorAvatar?: string | null
}

function formatMeta(date: string | null, name: string | null): string {
  const parts: string[] = []
  if (date) {
    parts.push(format(new Date(date), "MMM d", { locale: ptBR }).toUpperCase())
  }
  if (name) parts.push(name.toUpperCase())
  return parts.join(' · ')
}

export function PostCard({ post, variant = 'default', authorName }: PostCardProps) {
  const href = `/p/${post.slug}`
  const displayName = post.instructor?.name ?? authorName ?? null

  if (variant === 'compact') {
    return (
      <article>
        <Link href={href} className="group block">
          {post.cover_url && (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
              <Image
                src={post.cover_url}
                alt={post.cover_alt ?? post.title}
                fill
                sizes="280px"
                className="object-cover"
              />
            </div>
          )}
          <h3 className="mt-3 font-serif text-lg font-bold leading-tight">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        <p className="mt-2 text-xs tracking-wider text-muted-foreground">
          {formatMeta(post.published_at, displayName)}
        </p>
      </article>
    )
  }

  return (
    <article>
      <Link href={href} className="group block">
        {post.cover_url && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={post.cover_url}
              alt={post.cover_alt ?? post.title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
        <h2 className="mt-4 font-serif text-xl font-bold leading-tight">
          {post.title}
        </h2>
      </Link>
      {post.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {post.excerpt}
        </p>
      )}
      <p className="mt-3 text-xs tracking-wider text-muted-foreground">
        {formatMeta(post.published_at, displayName)}
      </p>
    </article>
  )
}

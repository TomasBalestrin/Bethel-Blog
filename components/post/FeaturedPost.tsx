import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { PostCardData } from './PostCard'

interface FeaturedPostProps {
  post: PostCardData
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

export function FeaturedPost({ post, authorName }: FeaturedPostProps) {
  const href = `/p/${post.slug}`
  const displayName = post.instructor?.name ?? authorName ?? null

  return (
    <article className="flex h-full flex-col">
      <Link href={href} className="group block flex-1">
        {post.cover_url && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={post.cover_url}
              alt={post.cover_alt ?? post.title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="object-cover"
            />
          </div>
        )}
        <h1 className="mt-5 font-serif text-2xl font-bold leading-tight md:text-4xl">
          {post.title}
        </h1>
      </Link>
      {post.excerpt && (
        <p className="mt-3 line-clamp-3 text-base text-muted-foreground">
          {post.excerpt}
        </p>
      )}
      <p className="mt-3 text-xs tracking-wider text-muted-foreground">
        {formatMeta(post.published_at, displayName)}
      </p>
    </article>
  )
}

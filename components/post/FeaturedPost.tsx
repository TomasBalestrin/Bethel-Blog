import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Heart } from 'lucide-react'

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
    <article className="group flex h-full flex-col">
      <Link href={href} className="block flex-1">
        {post.cover_url && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={post.cover_url}
              alt={post.cover_alt ?? post.title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
            {post.likes_count > 0 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <Heart className="h-3.5 w-3.5 fill-white" />
                <span>{post.likes_count}</span>
              </div>
            )}
          </div>
        )}
        <h1 className="mt-4 font-serif text-xl font-bold leading-tight transition-colors duration-200 group-hover:text-foreground/60 md:text-3xl">
          {post.title}
        </h1>
      </Link>
      {post.excerpt && (
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
      )}
      <p className="mt-2 text-[11px] tracking-wider text-muted-foreground">
        {formatMeta(post.published_at, displayName)}
      </p>
    </article>
  )
}

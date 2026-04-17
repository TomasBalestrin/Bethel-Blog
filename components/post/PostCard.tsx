import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Heart } from 'lucide-react'

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

function CoverImage({ post }: { post: PostCardData }) {
  if (!post.cover_url) return null
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
      <Image
        src={post.cover_url}
        alt={post.cover_alt ?? post.title}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
      />
      {post.likes_count > 0 && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          <Heart className="h-3.5 w-3.5 fill-white" />
          <span>{post.likes_count}</span>
        </div>
      )}
    </div>
  )
}

export function PostCard({ post, variant = 'default', authorName }: PostCardProps) {
  const href = `/p/${post.slug}`
  const displayName = post.instructor?.name ?? authorName ?? null

  if (variant === 'compact') {
    return (
      <article className="group">
        <Link href={href} className="block">
          <CoverImage post={post} />
          <h3 className="mt-3 font-serif text-base font-bold leading-tight">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{post.excerpt}</p>
        )}
        <p className="mt-2 text-[11px] tracking-wider text-muted-foreground">
          {formatMeta(post.published_at, displayName)}
        </p>
      </article>
    )
  }

  return (
    <article className="group">
      <Link href={href} className="block">
        <CoverImage post={post} />
        <h2 className="mt-3 font-serif text-[17px] font-bold leading-tight">
          {post.title}
        </h2>
      </Link>
      {post.excerpt && (
        <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">{post.excerpt}</p>
      )}
      <p className="mt-2 text-[11px] tracking-wider text-muted-foreground">
        {formatMeta(post.published_at, displayName)}
      </p>
    </article>
  )
}

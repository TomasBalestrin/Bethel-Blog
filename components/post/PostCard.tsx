import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, Heart } from 'lucide-react'

import { CategoryChip } from '@/components/shared/CategoryChip'
import { cn } from '@/lib/utils/cn'

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
}

interface PostCardProps {
  post: PostCardData
  variant?: 'default' | 'compact'
  authorName?: string
  authorAvatar?: string | null
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  return format(new Date(iso), "d 'de' MMM", { locale: ptBR })
}

export function PostCard({
  post,
  variant = 'default',
  authorName,
  authorAvatar,
}: PostCardProps) {
  const href = `/p/${post.slug}`
  const primaryCategory = post.categories?.[0]

  if (variant === 'compact') {
    return (
      <article className="group flex gap-3">
        {post.cover_url && (
          <Link
            href={href}
            className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-muted"
          >
            <Image
              src={post.cover_url}
              alt={post.cover_alt ?? post.title}
              fill
              sizes="96px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </Link>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          {primaryCategory && (
            <CategoryChip
              name={primaryCategory.name}
              slug={primaryCategory.slug}
              color={primaryCategory.color}
            />
          )}
          <Link href={href} className="block">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight transition-colors group-hover:text-primary">
              {post.title}
            </h3>
          </Link>
          <PostMeta
            date={post.published_at}
            readingTime={post.reading_time}
            views={post.views_count}
            likes={post.likes_count}
            dense
          />
        </div>
      </article>
    )
  }

  return (
    <article className="group">
      {post.cover_url && (
        <Link
          href={href}
          className={cn(
            'relative block overflow-hidden rounded-lg bg-muted',
            'aspect-[16/9]'
          )}
        >
          <Image
            src={post.cover_url}
            alt={post.cover_alt ?? post.title}
            fill
            sizes="(min-width: 1024px) 700px, 100vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        </Link>
      )}
      <div className="mt-3 space-y-2">
        {primaryCategory && (
          <CategoryChip
            name={primaryCategory.name}
            slug={primaryCategory.slug}
            color={primaryCategory.color}
          />
        )}
        <Link href={href}>
          <h2 className="text-xl font-bold tracking-tight transition-colors group-hover:text-primary md:text-2xl">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3">
          {authorAvatar && (
            <Image
              src={authorAvatar}
              alt={authorName ?? ''}
              width={24}
              height={24}
              className="h-6 w-6 rounded-full object-cover"
            />
          )}
          {authorName && (
            <span className="text-xs font-medium">{authorName}</span>
          )}
          <PostMeta
            date={post.published_at}
            readingTime={post.reading_time}
            views={post.views_count}
            likes={post.likes_count}
          />
        </div>
      </div>
    </article>
  )
}

interface PostMetaProps {
  date: string | null
  readingTime: number | null
  views: number
  likes: number
  dense?: boolean
}

function PostMeta({ date, readingTime, views, likes, dense }: PostMetaProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 text-xs text-muted-foreground',
        dense && 'gap-2'
      )}
    >
      {date && <span>{formatDate(date)}</span>}
      {readingTime && <span>· {readingTime} min de leitura</span>}
      {views > 0 && (
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {views}
        </span>
      )}
      {likes > 0 && (
        <span className="inline-flex items-center gap-1">
          <Heart className="h-3 w-3" />
          {likes}
        </span>
      )}
    </div>
  )
}

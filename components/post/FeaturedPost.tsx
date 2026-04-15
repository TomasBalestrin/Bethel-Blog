import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { CategoryChip } from '@/components/shared/CategoryChip'

import type { PostCardData } from './PostCard'

interface FeaturedPostProps {
  post: PostCardData
  authorName?: string
  authorAvatar?: string | null
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  return format(new Date(iso), "d 'de' MMMM", { locale: ptBR })
}

export function FeaturedPost({ post, authorName, authorAvatar }: FeaturedPostProps) {
  const href = `/p/${post.slug}`
  const primaryCategory = post.categories?.[0]

  return (
    <article className="group flex h-full flex-col">
      {post.cover_url && (
        <Link
          href={href}
          className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-muted"
        >
          <Image
            src={post.cover_url}
            alt={post.cover_alt ?? post.title}
            fill
            sizes="(min-width: 1024px) 42vw, 100vw"
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      )}
      <div className="mt-4 space-y-3">
        {primaryCategory && (
          <CategoryChip
            name={primaryCategory.name}
            slug={primaryCategory.slug}
            color={primaryCategory.color}
            size="md"
          />
        )}
        <Link href={href}>
          <h1 className="text-2xl font-extrabold tracking-tight transition-colors group-hover:text-primary md:text-4xl">
            {post.title}
          </h1>
        </Link>
        {post.excerpt && (
          <p className="line-clamp-3 text-base text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 text-sm">
          {authorAvatar && (
            <Image
              src={authorAvatar}
              alt={authorName ?? ''}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          {authorName && <span className="font-medium">{authorName}</span>}
          <span className="text-muted-foreground">
            {formatDate(post.published_at)}
          </span>
          {post.reading_time && (
            <span className="text-muted-foreground">
              · {post.reading_time} min
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

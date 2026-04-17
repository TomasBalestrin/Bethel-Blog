import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { CategoryChip } from '@/components/shared/CategoryChip'

export interface PostHeroInstructor {
  id: string
  name: string
  slug: string
  avatar_url: string
}

export interface PostHeroData {
  title: string
  excerpt: string | null
  cover_url: string | null
  cover_alt: string | null
  published_at: string | null
  reading_time: number | null
  categories: { id: string; name: string; slug: string; color: string }[]
  instructor?: PostHeroInstructor | null
}

interface PostHeroProps {
  post: PostHeroData
  authorName?: string
  authorAvatar?: string | null
}

export function PostHero({ post, authorName, authorAvatar }: PostHeroProps) {
  const displayName = post.instructor?.name ?? authorName ?? null
  const displayAvatar = post.instructor?.avatar_url ?? authorAvatar ?? null

  const dateLabel = post.published_at
    ? format(new Date(post.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : ''

  return (
    <header className="space-y-5">
      {post.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.categories.map((c) => (
            <CategoryChip key={c.id} name={c.name} slug={c.slug} color={c.color} size="sm" />
          ))}
        </div>
      )}

      <h1 className="font-serif text-3xl font-bold leading-[1.15] md:text-4xl">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="text-lg text-muted-foreground">{post.excerpt}</p>
      )}

      <div className="flex items-center gap-3">
        {displayAvatar && (
          <Image src={displayAvatar} alt={displayName ?? ''} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
        )}
        <div>
          {displayName && (
            <p className="text-xs font-bold uppercase tracking-wider">{displayName}</p>
          )}
          {dateLabel && (
            <p className="text-xs text-muted-foreground">{dateLabel}</p>
          )}
        </div>
      </div>

      <div className="border-t border-border" />
    </header>
  )
}

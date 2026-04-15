import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { CategoryChip } from '@/components/shared/CategoryChip'

export interface PostHeroData {
  title: string
  excerpt: string | null
  cover_url: string | null
  cover_alt: string | null
  published_at: string | null
  reading_time: number | null
  categories: { id: string; name: string; slug: string; color: string }[]
}

interface PostHeroProps {
  post: PostHeroData
  authorName: string
  authorAvatar?: string | null
}

export function PostHero({ post, authorName, authorAvatar }: PostHeroProps) {
  const dateLabel = post.published_at
    ? format(new Date(post.published_at), "d 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    : ''

  return (
    <header className="space-y-6">
      {post.cover_url && (
        <div className="relative -mx-4 aspect-[16/9] overflow-hidden bg-muted md:mx-0 md:rounded-xl">
          <Image
            src={post.cover_url}
            alt={post.cover_alt ?? post.title}
            fill
            sizes="(min-width: 1024px) 960px, 100vw"
            priority
            className="object-cover"
          />
        </div>
      )}

      <div className="space-y-4">
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <CategoryChip
                key={category.id}
                name={category.name}
                slug={category.slug}
                color={category.color}
                size="md"
              />
            ))}
          </div>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-muted-foreground md:text-xl">
            {post.excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {authorAvatar && (
            <Image
              src={authorAvatar}
              alt={authorName}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          )}
          <span className="font-medium text-foreground">{authorName}</span>
          {dateLabel && <span>· {dateLabel}</span>}
          {post.reading_time && <span>· {post.reading_time} min de leitura</span>}
        </div>
      </div>
    </header>
  )
}

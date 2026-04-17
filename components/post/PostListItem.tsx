import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface PostListItemData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  published_at: string | null
  likes_count: number
  instructor?: { name: string } | null
}

interface PostListItemProps {
  post: PostListItemData
}

export function PostListItem({ post }: PostListItemProps) {
  const date = post.published_at
    ? format(new Date(post.published_at), "MMM d, yyyy", { locale: ptBR }).toUpperCase()
    : ''
  const author = post.instructor?.name?.toUpperCase()

  return (
    <Link href={`/p/${post.slug}`} className="group block py-7">
      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 font-serif text-xl font-bold leading-snug transition-colors duration-200 group-hover:text-foreground/60">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            {[date, author].filter(Boolean).join(' · ')}
          </p>
        </div>

        {post.cover_url && (
          <div className="relative hidden h-28 w-40 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
            <Image
              src={post.cover_url}
              alt={post.title}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </div>
        )}
      </div>
    </Link>
  )
}

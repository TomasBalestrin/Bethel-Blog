import Image from 'next/image'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export interface PopularPost {
  id: string
  title: string
  slug: string
  cover_url: string | null
}

interface PopularSidebarProps {
  posts: PopularPost[]
}

export function PopularSidebar({ posts }: PopularSidebarProps) {
  if (posts.length === 0) return null

  return (
    <aside className="rounded-xl border border-border bg-card p-4">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5" />
        Mais popular
      </h3>
      <ol className="mt-4 space-y-4">
        {posts.map((post, index) => (
          <li key={post.id}>
            <Link
              href={`/p/${post.slug}`}
              className="group flex items-start gap-3"
            >
              <span className="font-serif text-2xl font-bold tabular-nums text-muted-foreground/60 group-hover:text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                  {post.title}
                </p>
              </div>
              {post.cover_url && (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={post.cover_url}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  )
}

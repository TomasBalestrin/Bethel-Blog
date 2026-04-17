import Image from 'next/image'
import Link from 'next/link'

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
    <aside>
      <h3 className="font-serif text-lg font-bold">Mais Popular</h3>

      <div className="mt-5 space-y-7">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/p/${post.slug}`}
            className="group flex items-start gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-serif text-[15px] font-bold leading-snug transition-colors duration-200 group-hover:text-foreground/60">
                {post.title}
              </p>
            </div>
            {post.cover_url && (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={post.cover_url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}
          </Link>
        ))}
      </div>
    </aside>
  )
}

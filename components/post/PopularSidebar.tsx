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
      <h3 className="font-serif text-base font-bold">Mais Popular</h3>

      <div className="mt-4 space-y-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/p/${post.slug}`} className="group flex items-start gap-3">
            <p className="min-w-0 flex-1 line-clamp-2 font-serif text-sm font-bold leading-snug transition-colors duration-200 group-hover:text-foreground/60">
              {post.title}
            </p>
            {post.cover_url && (
              <div className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={post.cover_url} alt="" fill sizes="56px" className="object-cover" />
              </div>
            )}
          </Link>
        ))}
      </div>
    </aside>
  )
}

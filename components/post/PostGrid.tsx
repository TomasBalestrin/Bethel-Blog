'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { PostCard, type PostCardData } from './PostCard'

interface PostGridProps {
  initialPosts: PostCardData[]
  initialPage: number
  totalPages: number
  pageSize: number
  authorName?: string
  authorAvatar?: string | null
}

interface ApiPost {
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
  post_categories: {
    category_id: string
    categories: { id: string; name: string; slug: string; color: string } | null
  }[]
}

function mapApiPost(post: ApiPost): PostCardData {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    cover_url: post.cover_url,
    cover_alt: post.cover_alt,
    published_at: post.published_at,
    reading_time: post.reading_time,
    views_count: post.views_count,
    likes_count: post.likes_count,
    categories: (post.post_categories ?? [])
      .map((pc) => pc.categories)
      .filter((c): c is NonNullable<typeof c> => c !== null),
  }
}

export function PostGrid({
  initialPosts,
  initialPage,
  totalPages,
  pageSize,
  authorName,
  authorAvatar,
}: PostGridProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)

  const hasMore = page < totalPages

  async function loadMore() {
    setLoading(true)
    try {
      const next = page + 1
      const response = await fetch(`/api/posts?page=${next}&limit=${pageSize}`)
      if (!response.ok) throw new Error('Falha ao carregar')
      const payload = (await response.json()) as { data: ApiPost[] }
      setPosts((current) => [...current, ...payload.data.map(mapApiPost)])
      setPage(next)
    } catch (error) {
      toast.error('Não foi possível carregar mais posts', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        Nenhum post ainda.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            authorName={authorName}
            authorAvatar={authorAvatar}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => void loadMore()}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/post/BlockRenderer'
import { PostActions } from '@/components/post/PostActions'
import { PostHero, type PostHeroData } from '@/components/post/PostHero'
import { ReadingProgress } from '@/components/post/ReadingProgress'
import { RelatedPosts } from '@/components/post/RelatedPosts'
import { ViewTracker } from '@/components/post/ViewTracker'
import { buildArticleJsonLd } from '@/lib/seo/jsonld'
import { buildPostMetadata } from '@/lib/seo/metadata'
import { createClient } from '@/lib/supabase/server'
import { PostContentSchema } from '@/types/post-blocks'

export const revalidate = 60

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function fetchPost(slug: string) {
  const supabase = await createClient()
  const [postResult, profileResult] = await Promise.all([
    supabase
      .from('posts')
      .select(
        'id, title, slug, excerpt, cover_url, cover_alt, content, published_at, updated_at, reading_time, views_count, likes_count, meta_title, meta_description, instructor:instructors(id, name, slug, avatar_url), post_categories(categories(id, name, slug, color))'
      )
      .eq('status', 'published')
      .is('deleted_at', null)
      .eq('slug', slug)
      .maybeSingle(),
    supabase
      .from('profile')
      .select('name, avatar_url')
      .limit(1)
      .maybeSingle<{ name: string; avatar_url: string }>(),
  ])

  if (postResult.error) {
    console.error('[/p/slug]', postResult.error)
  }

  return {
    post: postResult.data,
    profile: profileResult.data,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { post, profile } = await fetchPost(slug)
  if (!post) {
    return { title: 'Post não encontrado' }
  }

  return buildPostMetadata({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    cover_url: post.cover_url,
    cover_alt: post.cover_alt,
    published_at: post.published_at,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    // Prefere instrutor do post como autor no meta; fallback profile
    authorName: post.instructor?.name ?? profile?.name,
  })
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const { post, profile } = await fetchPost(slug)
  if (!post) {
    notFound()
  }

  const parsedContent = PostContentSchema.safeParse(post.content)
  if (!parsedContent.success) {
    console.warn(
      '[post-render] content inválido no slug',
      slug,
      parsedContent.error.flatten()
    )
  }

  const profileName = profile?.name ?? 'Bethel'
  const profileAvatar = profile?.avatar_url
  const instructor = post.instructor ?? null
  const url = `${SITE_URL}/p/${post.slug}`

  const categories = (post.post_categories ?? [])
    .map((pc) => pc.categories)
    .filter((c): c is NonNullable<typeof c> => c !== null)

  const heroData: PostHeroData = {
    title: post.title,
    excerpt: post.excerpt,
    cover_url: post.cover_url,
    cover_alt: post.cover_alt,
    published_at: post.published_at,
    reading_time: post.reading_time,
    categories,
    instructor,
  }

  // JSON-LD: autor é o instrutor (se houver), senão o profile do blog
  const jsonLdAuthorName = instructor?.name ?? profileName
  const jsonLdAuthorAvatar = instructor?.avatar_url ?? profileAvatar ?? null

  const jsonLd = buildArticleJsonLd({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    cover_url: post.cover_url,
    published_at: post.published_at,
    updated_at: post.updated_at,
    authorName: jsonLdAuthorName,
    authorAvatar: jsonLdAuthorAvatar,
  })

  return (
    <>
      <ReadingProgress />
      <ViewTracker postId={post.id} />

      <article className="container max-w-[720px] py-8 md:py-12">
        <PostHero
          post={heroData}
          authorName={profileName}
          authorAvatar={profileAvatar}
        />

        <PostActions
          postId={post.id}
          initialLikes={post.likes_count}
          url={url}
          title={post.title}
          excerpt={post.excerpt}
        />

        <div className="mt-10">
          <BlockRenderer
            content={parsedContent.success ? parsedContent.data : post.content}
          />
        </div>

        <RelatedPosts currentPostId={post.id} />
      </article>

      <script
        type="application/ld+json"
        // JSON-LD é texto puro, sem interpretação; safe.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}

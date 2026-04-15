import type { Metadata } from 'next'

export interface PostMetadataInput {
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  cover_alt: string | null
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  authorName?: string
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export function buildPostMetadata(post: PostMetadataInput): Metadata {
  const title = post.meta_title || post.title
  const description =
    post.meta_description ||
    post.excerpt ||
    'Leia no Bethel Blog.'
  const url = `${SITE_URL}/p/${post.slug}`
  const images = post.cover_url
    ? [
        {
          url: post.cover_url,
          alt: post.cover_alt ?? post.title,
          width: 1200,
          height: 630,
        },
      ]
    : undefined

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: 'Bethel Blog',
      locale: 'pt_BR',
      images,
      publishedTime: post.published_at ?? undefined,
      authors: post.authorName ? [post.authorName] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_url ? [post.cover_url] : undefined,
    },
  }
}

export interface ArticleJsonLdInput {
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  published_at: string | null
  updated_at?: string | null
  authorName: string
  authorAvatar?: string | null
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export function buildArticleJsonLd(post: ArticleJsonLdInput) {
  const url = `${SITE_URL}/p/${post.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_url ? [post.cover_url] : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    author: {
      '@type': 'Person',
      name: post.authorName,
      image: post.authorAvatar ?? undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bethel Blog',
      url: SITE_URL,
    },
    url,
  }
}

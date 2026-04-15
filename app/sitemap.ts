import type { MetadataRoute } from 'next'

import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [postsResult, categoriesResult] = await Promise.all([
    supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .is('deleted_at', null),
    supabase
      .from('categories')
      .select('slug, updated_at'),
  ])

  const now = new Date()
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  for (const post of postsResult.data ?? []) {
    const updated = post.updated_at ?? post.published_at
    entries.push({
      url: `${SITE_URL}/p/${post.slug}`,
      lastModified: updated ? new Date(updated) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  for (const category of categoriesResult.data ?? []) {
    entries.push({
      url: `${SITE_URL}/category/${category.slug}`,
      lastModified: category.updated_at ? new Date(category.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.5,
    })
  }

  return entries
}

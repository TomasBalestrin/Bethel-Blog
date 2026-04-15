import type { Metadata } from 'next'

import {
  CategoriesManager,
  type CategoryWithCount,
} from '@/components/admin/CategoriesManager'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Categorias — Admin Bethel Blog',
  robots: { index: false, follow: false },
}

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, color, post_categories(count)')
    .order('name')

  if (error) {
    console.error('[/admin/categories]', error)
  }

  const categories: CategoryWithCount[] = (data ?? []).map((row) => {
    const rel = row.post_categories as unknown
    const firstCount = Array.isArray(rel) && rel[0] ? (rel[0] as { count?: number }).count : undefined
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      color: row.color,
      postsCount: firstCount ?? 0,
    }
  })

  return (
    <div className="space-y-6">
      <CategoriesManager categories={categories} />
    </div>
  )
}

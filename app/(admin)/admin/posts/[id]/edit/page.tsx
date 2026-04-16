import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { CategoryOption } from '@/components/admin/CategorySelector'
import type { InstructorOption } from '@/components/admin/InstructorSelect'
import { PostForm, type PostInitialData } from '@/components/admin/PostForm'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Editar post — Admin Bethel Blog',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: post, error: postError },
    { data: categoriesData },
    { data: instructorsData },
  ] = await Promise.all([
    supabase
      .from('posts')
      .select(
        'id, title, slug, status, excerpt, cover_url, cover_alt, content, meta_title, meta_description, scheduled_at, published_at, instructor_id, post_categories(category_id)'
      )
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle(),
    supabase.from('categories').select('id, name, color').order('name'),
    supabase
      .from('instructors')
      .select('id, name, slug, avatar_url')
      .order('name', { ascending: true }),
  ])

  if (postError) {
    console.error('[/admin/posts/edit]', postError)
  }
  if (!post) {
    notFound()
  }

  const categories: CategoryOption[] = (categoriesData ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
  }))

  const instructors: InstructorOption[] = (instructorsData ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    slug: i.slug,
    avatar_url: i.avatar_url,
  }))

  const initialPost: PostInitialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    excerpt: post.excerpt,
    cover_url: post.cover_url,
    cover_alt: post.cover_alt,
    content: (post.content as PostInitialData['content']) ?? null,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    scheduled_at: post.scheduled_at,
    published_at: post.published_at,
    instructor_id: post.instructor_id ?? null,
    category_ids: (post.post_categories ?? [])
      .map((pc: { category_id: string }) => pc.category_id)
      .filter(Boolean),
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PostForm
        post={initialPost}
        categories={categories}
        instructors={instructors}
      />
    </div>
  )
}

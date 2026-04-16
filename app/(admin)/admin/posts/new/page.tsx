import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { ensureUniqueSlug, generateSlug } from '@/lib/utils/slug'
import type { Json } from '@/types/database'
import { createEmptyContent } from '@/types/post-blocks'

export const metadata = {
  title: 'Novo post — Admin Bethel Blog',
  robots: { index: false, follow: false },
}

// Cria um rascunho em branco e redireciona para a tela de edição.
// A inserção acontece no server (uso de RSC como "action" one-shot);
// cada visita a /admin/posts/new cria um draft novo.
export default async function NewPostPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?next=/admin/posts/new')
  }

  const base = generateSlug(`rascunho-${Date.now().toString(36)}`)
  const slug = await ensureUniqueSlug(supabase, base)

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      title: 'Rascunho sem título',
      slug,
      content: createEmptyContent() as unknown as Json,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[/admin/posts/new]', error)
    redirect('/admin/posts?error=new_failed')
  }

  redirect(`/admin/posts/${data.id}/edit`)
}

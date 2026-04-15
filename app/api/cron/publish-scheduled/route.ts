import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyCronAuth } from '@/lib/utils/cron-auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  try {
    // Busca posts a publicar ANTES de disparar a função, pra invalidar
    // cache das páginas específicas (revalidatePath por slug).
    const { data: pending, error: selectError } = await supabaseAdmin
      .from('posts')
      .select('id, slug')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())
      .is('deleted_at', null)
    if (selectError) throw selectError

    // Função Postgres: UPDATE posts SET status='published',
    // published_at=NOW() WHERE status='scheduled' AND scheduled_at<=NOW()
    const { data, error } = await supabaseAdmin.rpc('publish_scheduled_posts')
    if (error) throw error

    // Invalida caches afetados
    revalidatePath('/')
    for (const post of pending ?? []) {
      revalidatePath(`/p/${post.slug}`)
    }

    const published = typeof data === 'number' ? data : (pending?.length ?? 0)
    return NextResponse.json({ data: { published } })
  } catch (error) {
    console.error('[cron publish-scheduled]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Vercel Cron dispara via GET por default; aceitamos ambos.
export const GET = POST

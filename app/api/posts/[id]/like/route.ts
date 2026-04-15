import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import {
  getIdentifier,
  rateLimit,
  tooManyRequestsResponse,
} from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, hashIdentifier } from '@/lib/utils/hash'

const LikeSchema = z.object({
  client_uuid: z.string().uuid(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

function getSalt(): string | null {
  return process.env.LIKE_HASH_SALT ?? null
}

async function fetchLikesCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('likes_count')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle<{ likes_count: number }>()
  if (error) throw error
  return data?.likes_count ?? null
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const rl = await rateLimit('like', getIdentifier(request))
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfter)

    const body = await request.json().catch(() => null)
    const parsed = LikeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const salt = getSalt()
    if (!salt) {
      console.error('[like] LIKE_HASH_SALT ausente no ambiente')
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      )
    }

    const ip = getClientIp(request)
    const hash = hashIdentifier([parsed.data.client_uuid, ip], salt)

    const supabase = await createClient()

    // Upsert idempotente (UNIQUE post_id, identifier_hash)
    const { error: insertError } = await supabase.from('post_likes').upsert(
      { post_id: id, identifier_hash: hash },
      { onConflict: 'post_id,identifier_hash', ignoreDuplicates: true }
    )
    if (insertError) throw insertError

    const count = await fetchLikesCount(supabase, id)
    if (count === null) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ data: { liked: true, count } })
  } catch (error) {
    console.error('[POST /api/posts/[id]/like]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const rl = await rateLimit('like', getIdentifier(request))
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfter)

    const body = await request.json().catch(() => null)
    const parsed = LikeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const salt = getSalt()
    if (!salt) {
      console.error('[like] LIKE_HASH_SALT ausente no ambiente')
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      )
    }

    const ip = getClientIp(request)
    const hash = hashIdentifier([parsed.data.client_uuid, ip], salt)

    const supabase = await createClient()

    const { error: deleteError } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', id)
      .eq('identifier_hash', hash)
    if (deleteError) throw deleteError

    const count = await fetchLikesCount(supabase, id)
    if (count === null) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ data: { liked: false, count } })
  } catch (error) {
    console.error('[DELETE /api/posts/[id]/like]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

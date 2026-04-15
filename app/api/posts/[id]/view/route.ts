import { randomUUID } from 'node:crypto'

import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { hashIdentifier } from '@/lib/utils/hash'

const COOKIE_NAME = '_session_id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 ano

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const salt = process.env.LIKE_HASH_SALT
    if (!salt) {
      console.error('[view] LIKE_HASH_SALT ausente no ambiente')
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      )
    }

    let sessionId = request.cookies.get(COOKIE_NAME)?.value
    const shouldSet = !sessionId
    if (!sessionId) {
      sessionId = randomUUID()
    }

    const hash = hashIdentifier([sessionId], salt)
    const referrer = request.headers.get('referer')

    const supabase = await createClient()
    // ON CONFLICT DO NOTHING via upsert idempotente
    const { error: upsertError } = await supabase.from('post_views').upsert(
      {
        post_id: id,
        session_hash: hash,
        referrer: referrer && referrer.length <= 500 ? referrer : null,
      },
      { onConflict: 'post_id,session_hash', ignoreDuplicates: true }
    )
    if (upsertError) throw upsertError

    const response = NextResponse.json({ data: { ok: true } })
    if (shouldSet && sessionId) {
      response.cookies.set(COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
      })
    }
    return response
  } catch (error) {
    console.error('[POST /api/posts/[id]/view]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

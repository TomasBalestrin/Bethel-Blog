import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.auth.signOut()
    }

    return NextResponse.redirect(new URL('/', request.url), { status: 303 })
  } catch (error) {
    console.error('[POST /api/auth/signout]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import 'server-only'

import { NextResponse } from 'next/server'

/**
 * Valida o header Authorization contra CRON_SECRET. Retorna
 * NextResponse com 401 se falhar, ou null se ok. Ver security.md §4.
 */
export function verifyCronAuth(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron] CRON_SECRET ausente no ambiente')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  const header = request.headers.get('authorization')
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

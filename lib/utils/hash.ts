import 'server-only'

import { createHash } from 'node:crypto'

/**
 * Hash estável SHA-256 de várias partes + salt do ambiente.
 * Usado pra identifier_hash de post_likes e session_hash de
 * post_views (ver security.md §6 — IP/UUID não são armazenados
 * em claro).
 */
export function hashIdentifier(parts: Array<string | undefined | null>, salt: string): string {
  const joined = parts.filter(Boolean).join('|')
  return createHash('sha256').update(`${joined}|${salt}`).digest('hex')
}

export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) {
    const first = fwd.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}

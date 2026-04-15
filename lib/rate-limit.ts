import 'server-only'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

export interface LimitResult {
  success: boolean
  retryAfter: number // segundos
  remaining: number
  limit: number
}

export type LimitKind =
  | 'like'
  | 'view'
  | 'upload'
  | 'search'
  | 'auth'
  | 'admin'

const WINDOWS: Record<LimitKind, { count: number; window: `${number} s` | `${number} m` | `${number} h`; prefix: string }> = {
  like: { count: 10, window: '1 m', prefix: 'rl:like' },
  view: { count: 60, window: '1 m', prefix: 'rl:view' },
  upload: { count: 10, window: '1 m', prefix: 'rl:upload' },
  search: { count: 30, window: '1 m', prefix: 'rl:search' },
  auth: { count: 5, window: '1 m', prefix: 'rl:auth' },
  admin: { count: 60, window: '1 m', prefix: 'rl:admin' },
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

// Cache de instâncias Ratelimit por kind (reuso entre requests do mesmo worker)
const cache = new Map<LimitKind, Ratelimit>()

function getLimiter(kind: LimitKind): Ratelimit | null {
  const cached = cache.get(kind)
  if (cached) return cached

  const redis = getRedis()
  if (!redis) return null

  const config = WINDOWS[kind]
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.count, config.window),
    analytics: false,
    prefix: config.prefix,
  })
  cache.set(kind, limiter)
  return limiter
}

/**
 * Retorna o IP identificador pra rate limiting. Usa x-forwarded-for
 * (primeira parte) → x-real-ip → 'anonymous' como fallback.
 */
export function getIdentifier(request: Request, suffix?: string): string {
  const fwd = request.headers.get('x-forwarded-for')
  const ip = (fwd?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'anonymous')
  return suffix ? `${ip}:${suffix}` : ip
}

/**
 * Aplica rate limit. Se Upstash não está configurado, passa direto
 * (dev mode). Em produção sem Upstash, logs um warning uma vez.
 */
let warnedMissing = false
export async function rateLimit(
  kind: LimitKind,
  identifier: string
): Promise<LimitResult> {
  const limiter = getLimiter(kind)
  if (!limiter) {
    if (!warnedMissing && process.env.NODE_ENV === 'production') {
      console.warn('[rate-limit] Upstash Redis não configurado — rate limit desativado')
      warnedMissing = true
    }
    return { success: true, retryAfter: 0, remaining: Infinity, limit: Infinity }
  }

  const result = await limiter.limit(identifier)
  const retryAfter = result.success
    ? 0
    : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
  return {
    success: result.success,
    retryAfter,
    remaining: result.remaining,
    limit: result.limit,
  }
}

/**
 * Helper pra retornar response 429 padronizada com Retry-After.
 */
export function tooManyRequestsResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests', retryAfter },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    }
  )
}

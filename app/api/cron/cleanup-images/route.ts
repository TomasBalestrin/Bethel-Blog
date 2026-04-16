import { NextResponse, type NextRequest } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyCronAuth } from '@/lib/utils/cron-auth'

export const runtime = 'nodejs'

const BUCKET = 'blog-images'
const ORPHAN_MIN_AGE_DAYS = 30
const LIST_PAGE_SIZE = 1000

/**
 * Extrai o path da Storage (bucket-relative) de uma URL pública do
 * Supabase. Ex: `${url}/storage/v1/object/public/blog-images/2026/04/abc.webp`
 * → `2026/04/abc.webp`. Retorna null se não for URL do bucket.
 */
function extractStoragePath(url: string | null | undefined): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

/**
 * Walker recursivo do JSON do post coletando URLs de imagem. Tolera
 * formato novo (blocks) e estruturas ad-hoc: qualquer node.attrs.src
 * em type='image' conta.
 */
function collectImageUrls(node: unknown, acc: Set<string>): void {
  if (!node) return
  if (Array.isArray(node)) {
    node.forEach((child) => collectImageUrls(child, acc))
    return
  }
  if (typeof node !== 'object') return
  const n = node as {
    type?: unknown
    attrs?: { src?: unknown }
    content?: unknown
    marks?: unknown
  }
  if (n.type === 'image' && typeof n.attrs?.src === 'string') {
    acc.add(n.attrs.src)
  }
  if (n.content) collectImageUrls(n.content, acc)
  if (n.marks) collectImageUrls(n.marks, acc)
}

async function listBucketFiles(prefix = ''): Promise<
  { path: string; created_at: string | null }[]
> {
  const files: { path: string; created_at: string | null }[] = []

  const { data: entries, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .list(prefix, { limit: LIST_PAGE_SIZE, sortBy: { column: 'name', order: 'asc' } })
  if (error) throw error

  for (const entry of entries ?? []) {
    // entries sem id são "pastas" (objetos sintéticos do Supabase).
    const isFolder = entry.id === null || entry.id === undefined
    const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name
    if (isFolder) {
      const nested = await listBucketFiles(fullPath)
      files.push(...nested)
    } else {
      files.push({
        path: fullPath,
        created_at: (entry.created_at as string | null) ?? null,
      })
    }
  }

  return files
}

export async function POST(request: NextRequest) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  try {
    // 1. Coleta URLs referenciadas em posts (cover_url + imagens no content)
    const referenced = new Set<string>()

    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('cover_url, content')
      .is('deleted_at', null)
    if (postsError) throw postsError

    for (const post of posts ?? []) {
      const coverPath = extractStoragePath(post.cover_url)
      if (coverPath) referenced.add(coverPath)
      const srcs = new Set<string>()
      collectImageUrls(post.content, srcs)
      for (const src of srcs) {
        const p = extractStoragePath(src)
        if (p) referenced.add(p)
      }
    }

    // Também preserva avatares do profile.
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profile')
      .select('avatar_url')
    if (profileError) throw profileError
    for (const profile of profiles ?? []) {
      const p = extractStoragePath(profile.avatar_url)
      if (p) referenced.add(p)
    }

    // 2. Lista arquivos do bucket
    const files = await listBucketFiles()

    // 3. Identifica órfãs com idade > 30 dias
    const cutoff = Date.now() - ORPHAN_MIN_AGE_DAYS * 24 * 60 * 60 * 1000
    const orphansToDelete: string[] = []

    for (const file of files) {
      if (referenced.has(file.path)) continue

      // Só deleta se conseguir provar que é antiga. Sem created_at,
      // preserva (fail-safe).
      if (!file.created_at) continue
      const age = new Date(file.created_at).getTime()
      if (isNaN(age) || age > cutoff) continue

      orphansToDelete.push(file.path)
    }

    // 4. Deleta em batches (limite da API ~ 100 por chamada)
    let deleted = 0
    const BATCH = 100
    for (let i = 0; i < orphansToDelete.length; i += BATCH) {
      const batch = orphansToDelete.slice(i, i + BATCH)
      const { error } = await supabaseAdmin.storage.from(BUCKET).remove(batch)
      if (error) throw error
      deleted += batch.length
    }

    return NextResponse.json({
      data: {
        totalFiles: files.length,
        referenced: referenced.size,
        orphansDeleted: deleted,
      },
    })
  } catch (error) {
    console.error('[cron cleanup-images]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = POST

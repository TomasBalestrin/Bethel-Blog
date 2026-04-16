import { PostContentSchema, type PostContent } from '@/types/post-blocks'

/** Strip de markdown inline (bold, itálico, link). */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
}

const EMPTY: PostContent = { version: 1, blocks: [] }

/**
 * Aceita conteúdo vindo do banco (JSONB) e retorna PostContent
 * válido. Conteúdo legado (Tiptap, formato inválido, null) → vazio.
 */
export function normalizeContent(raw: unknown): PostContent {
  if (raw === null || raw === undefined) return EMPTY
  const parsed = PostContentSchema.safeParse(raw)
  return parsed.success ? parsed.data : EMPTY
}

/**
 * Excerpt automático: primeiros ~160 chars do PRIMEIRO bloco
 * paragraph (com strip de markdown). Se não tiver paragraph,
 * retorna string vazia.
 */
export function autoExcerpt(content: PostContent): string {
  const first = content.blocks.find((b) => b.type === 'paragraph')
  if (!first || first.type !== 'paragraph') return ''
  const clean = stripMarkdown(first.text).trim().replace(/\s+/g, ' ')
  return clean.length > 160 ? `${clean.slice(0, 157)}...` : clean
}

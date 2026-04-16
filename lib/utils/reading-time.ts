import type { PostContent } from '@/types/post-blocks'

const WORDS_PER_MINUTE = 200
/** Aproximação pt-BR: ~5 chars/palavra (incluindo espaço). */
const CHARS_PER_WORD = 5

/**
 * Strip de markdown inline simples (bold, itálico, link). Aceita
 * **txt**, *txt*, [label](url) → mantém apenas o conteúdo legível.
 */
function stripMarkdownInline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
}

function isBlocksContent(value: unknown): value is PostContent {
  if (!value || typeof value !== 'object') return false
  const v = value as { version?: unknown; blocks?: unknown }
  return v.version === 1 && Array.isArray(v.blocks)
}

/**
 * Tempo estimado de leitura em minutos (mínimo 1).
 *
 * Aceita o novo formato block-based (PostContent v1). Pra blocks
 * heading/paragraph soma o texto cru sem markdown; outros tipos
 * (image/video) não contam.
 *
 * Tolerante a content legado (Tiptap JSON antigo) — faz extract
 * recursivo de qualquer node.text. Posts greenfield sempre passam
 * pelo formato novo.
 */
export function calculateReadingTime(content: unknown): number {
  let plain: string

  if (isBlocksContent(content)) {
    plain = content.blocks
      .map((block) => {
        if (block.type === 'heading' || block.type === 'paragraph') {
          return stripMarkdownInline(block.text)
        }
        return ''
      })
      .filter(Boolean)
      .join(' ')
  } else {
    plain = extractTextLegacy(content)
  }

  const chars = plain.trim().length
  if (chars === 0) return 1
  const words = chars / CHARS_PER_WORD
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

function extractTextLegacy(node: unknown): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractTextLegacy).join(' ')
  if (typeof node === 'object') {
    const n = node as { text?: unknown; content?: unknown }
    const self = typeof n.text === 'string' ? n.text : ''
    const rest = n.content ? extractTextLegacy(n.content) : ''
    return [self, rest].filter(Boolean).join(' ')
  }
  return ''
}

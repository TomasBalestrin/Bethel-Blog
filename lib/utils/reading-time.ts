const WORDS_PER_MINUTE = 200

/**
 * Extrai texto plano de um nó Tiptap JSON (content do post) e retorna
 * o tempo estimado de leitura em minutos (mínimo 1).
 */
export function calculateReadingTime(content: unknown): number {
  const text = extractText(content)
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

function extractText(node: unknown): string {
  if (!node) return ''
  if (typeof node === 'string') return node

  if (Array.isArray(node)) {
    return node.map(extractText).join(' ')
  }

  if (typeof node === 'object') {
    const n = node as { text?: unknown; content?: unknown }
    const self = typeof n.text === 'string' ? n.text : ''
    const children = n.content ? extractText(n.content) : ''
    return [self, children].filter(Boolean).join(' ')
  }

  return ''
}

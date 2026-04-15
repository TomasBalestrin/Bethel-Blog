import { generateHTML } from '@tiptap/html'
import type { JSONContent } from '@tiptap/react'

import { buildExtensions } from '@/components/editor/extensions'

const extensions = buildExtensions()

/**
 * Renderiza JSON Tiptap em HTML server-side. Usar ao salvar post
 * pra cachear em posts.content_html (ver Task D1.1 PATCH hook).
 */
export function renderTiptapToHtml(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  return generateHTML(content as JSONContent, extensions)
}

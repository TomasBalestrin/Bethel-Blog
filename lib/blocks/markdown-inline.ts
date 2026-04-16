/**
 * Parser de markdown INLINE minimalista. Suporta apenas:
 *   - **negrito** → <strong>
 *   - *itálico*  → <em>
 *   - [texto](https://url) → <a href> (só http/https/mailto)
 *
 * Não renderiza blocos (#, listas, código). Escapa HTML primeiro
 * pra evitar XSS — só depois interpreta a sintaxe markdown.
 *
 * Uso: chame renderMarkdownInline() no server-side pro conteúdo
 * público; o admin editor só mostra o texto cru (textarea).
 */

const ALLOWED_PROTOCOLS = /^(https?:|mailto:)/i

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!ALLOWED_PROTOCOLS.test(trimmed)) return null
  return trimmed
}

export function renderMarkdownInline(text: string): string {
  if (!text) return ''
  let html = escapeHtml(text)

  // Links [label](url) — antes de negrito/itálico pra não conflitar.
  html = html.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_match, label: string, rawUrl: string) => {
      const url = sanitizeUrl(rawUrl)
      if (!url) return label
      return `<a href="${url}" rel="noopener noreferrer" target="_blank">${label}</a>`
    }
  )

  // Negrito: **texto**
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')

  // Itálico: *texto* (apenas quando não é parte de **)
  html = html.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')

  return html
}

/**
 * Extrai o videoId canônico de uma URL do YouTube. Suporta:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube.com/shorts/ID
 *
 * Retorna null se a URL não for parseável ou o id tiver formato
 * inválido (tem que bater /^[A-Za-z0-9_-]{11}$/).
 */
const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/

export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Se já é um id puro
  if (YOUTUBE_ID_REGEX.test(trimmed)) return trimmed

  let url: URL
  try {
    url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '')
  let id: string | null = null

  if (host === 'youtu.be') {
    id = url.pathname.slice(1).split('/')[0] ?? null
  } else if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (url.pathname === '/watch') {
      id = url.searchParams.get('v')
    } else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)
      id = match?.[1] ?? null
    }
  }

  if (!id) return null
  return YOUTUBE_ID_REGEX.test(id) ? id : null
}

/**
 * URL pública da thumbnail do vídeo (hqdefault — sempre disponível).
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

/**
 * URL de embed privacy-friendly (youtube-nocookie.com).
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}

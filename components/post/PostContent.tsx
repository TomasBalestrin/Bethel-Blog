import { renderTiptapToHtml } from '@/lib/utils/tiptap-renderer'
import { cn } from '@/lib/utils/cn'

interface PostContentProps {
  contentHtml: string | null
  contentJson: unknown
  className?: string
}

/**
 * Renderiza o corpo do post. Se `content_html` estiver em cache
 * (gerado server-side no save), usa direto. Senão renderiza on-demand
 * a partir do JSON Tiptap — o HTML produzido vem do Tiptap
 * (allowlist de nodes/marks), não de input cru do usuário.
 */
export function PostContent({ contentHtml, contentJson, className }: PostContentProps) {
  const html = contentHtml?.trim() || renderTiptapToHtml(contentJson)

  if (!html) {
    return (
      <div className="py-8 text-sm text-muted-foreground">
        (sem conteúdo)
      </div>
    )
  }

  return (
    <div
      className={cn(
        'post-content space-y-5 text-base leading-relaxed md:text-lg',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

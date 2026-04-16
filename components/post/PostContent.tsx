/**
 * @deprecated Não importar em código novo. Renderiza HTML do Tiptap
 * legado via dangerouslySetInnerHTML — incompatível com o novo
 * formato block-based (PostContent v1 de @/types/post-blocks).
 *
 * Use {@link BlockRenderer} de @/components/post/BlockRenderer.
 *
 * Arquivo mantido no repo como proteção contra imports esquecidos
 * até a task de cleanup final do Tiptap. NÃO é importado em nenhum
 * lugar em runtime desde a Tarefa 2.4.
 */
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
    <>
      <div
        className={cn(
          'post-content space-y-5 text-base leading-relaxed md:text-lg',
          className
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {/* prefers-reduced-motion: neutraliza transições e animações
          em imagens/elementos injetados via HTML do usuário. */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .post-content img,
          .post-content * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </>
  )
}

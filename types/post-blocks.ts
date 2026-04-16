/**
 * Modelo de conteúdo block-based do post. Substitui o JSON Tiptap.
 * Versionado pra permitir migração futura (ex: v2 com colunas,
 * embeds extras, etc).
 *
 * IMPORTANTE: 4 tipos apenas na v1 — heading, paragraph, image, video.
 */

export type BlockType = 'heading' | 'paragraph' | 'image' | 'video'

export interface BaseBlock {
  id: string
  type: BlockType
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  text: string
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  /** Markdown inline: **negrito**, *itálico*, [link](url). */
  text: string
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  url: string | null
  /** Alt text (obrigatório ao publicar). */
  alt: string
  caption?: string
}

export interface VideoBlock extends BaseBlock {
  type: 'video'
  provider: 'youtube'
  videoId: string | null
  caption?: string
}

export type Block = HeadingBlock | ParagraphBlock | ImageBlock | VideoBlock

export interface PostContent {
  version: 1
  blocks: Block[]
}

export const EMPTY_POST_CONTENT: PostContent = { version: 1, blocks: [] }

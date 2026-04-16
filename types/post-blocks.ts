/**
 * Modelo de conteúdo block-based do post. Substitui o JSON Tiptap.
 * Versionado pra permitir migração futura (ex: v2 com colunas,
 * embeds extras, etc).
 *
 * IMPORTANTE: 4 tipos apenas na v1 — heading, paragraph, image, video.
 */

import { nanoid } from 'nanoid'
import { z } from 'zod'

// ──────────────────────────────────────────────────────────────────
// Tipos TS (autoridade para autocomplete e props de componentes)
// ──────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────
// Zod schemas (runtime — usados em API routes + render público)
// ──────────────────────────────────────────────────────────────────

const BaseBlockSchema = z.object({ id: z.string().min(1) })

export const HeadingBlockSchema = BaseBlockSchema.extend({
  type: z.literal('heading'),
  text: z.string().max(200),
})

export const ParagraphBlockSchema = BaseBlockSchema.extend({
  type: z.literal('paragraph'),
  text: z.string().max(5000),
})

export const ImageBlockSchema = BaseBlockSchema.extend({
  type: z.literal('image'),
  url: z.string().url().nullable(),
  alt: z.string().max(200),
  caption: z.string().max(300).optional(),
})

export const VideoBlockSchema = BaseBlockSchema.extend({
  type: z.literal('video'),
  provider: z.literal('youtube'),
  videoId: z.string().nullable(),
  caption: z.string().max(300).optional(),
})

export const BlockSchema = z.discriminatedUnion('type', [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  ImageBlockSchema,
  VideoBlockSchema,
])

export const PostContentSchema = z.object({
  version: z.literal(1),
  blocks: z.array(BlockSchema).max(500),
})

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

export const EMPTY_POST_CONTENT: PostContent = { version: 1, blocks: [] }

export function createEmptyContent(): PostContent {
  return { version: 1, blocks: [] }
}

export function createBlock(type: BlockType): Block {
  const id = nanoid(10)
  switch (type) {
    case 'heading':
      return { id, type, text: '' }
    case 'paragraph':
      return { id, type, text: '' }
    case 'image':
      return { id, type, url: null, alt: '' }
    case 'video':
      return { id, type, provider: 'youtube', videoId: null }
  }
}

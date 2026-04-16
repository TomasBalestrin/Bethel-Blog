import { z } from 'zod'

import { EMPTY_POST_CONTENT, PostContentSchema } from '@/types/post-blocks'

const SlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const PostStatusSchema = z.enum([
  'draft',
  'scheduled',
  'published',
  'archived',
])

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(SlugRegex, 'Slug inválido (use letras minúsculas, números e hifens)')
    .optional(),
  excerpt: z.string().max(500).optional().nullable(),
  cover_url: z.string().url('URL de capa inválida').optional().nullable(),
  cover_alt: z.string().max(200).optional().nullable(),
  content: PostContentSchema.default(EMPTY_POST_CONTENT),
  status: PostStatusSchema.default('draft'),
  scheduled_at: z.string().datetime().optional().nullable(),
  category_ids: z.array(z.string().uuid()).max(5).default([]),
  instructor_id: z.string().uuid('Selecione um instrutor'),
  meta_title: z.string().max(70).optional().nullable(),
  meta_description: z.string().max(160).optional().nullable(),
})

// instructor_id é OBRIGATÓRIO no Create (regra de negócio: todo post
// precisa ter instrutor atribuído ao salvar/publicar). No Update,
// vira OPCIONAL via .partial() — PATCH parcial (só status, só
// scheduled_at) continua funcionando e não precisa reenviar o campo.
// A obrigatoriedade é enforçada no form pelo Create path + pelo
// CHECK constraint implícito do negócio (sem instructor_id, o post
// fica num estado parcial até a primeira edição completa).
export const UpdatePostSchema = CreatePostSchema.partial()

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>

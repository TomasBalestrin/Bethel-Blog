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

// Todos os campos opcionais exceto instructor_id — regra de negócio:
// todo save de post (exceto drafts em branco) precisa ter instrutor.
// Ver Tarefa 3.4 pra integração no form.
export const UpdatePostSchema = CreatePostSchema.partial().extend({
  instructor_id: z.string().uuid('Selecione um instrutor'),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>

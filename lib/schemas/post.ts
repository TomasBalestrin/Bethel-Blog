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
  // instructor_id é OPCIONAL no server schema — permite criar draft
  // em branco sem instrutor atribuído. A obrigatoriedade de negócio
  // é enforçada no CLIENT pelo FormSchema local do PostForm (RHF +
  // zodResolver), que bloqueia salvar/publicar sem instrutor.
  // DB column também é nullable (ver migration 0002).
  instructor_id: z.string().uuid().optional().nullable(),
  meta_title: z.string().max(70).optional().nullable(),
  meta_description: z.string().max(160).optional().nullable(),
})

export const UpdatePostSchema = CreatePostSchema.partial()

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>

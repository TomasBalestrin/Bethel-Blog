import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50),
  avatar_url: z.string().url('URL do avatar inválida'),
  bio: z.string().max(500).optional().nullable(),
  blog_title: z.string().min(1, 'Título do blog obrigatório').max(50),
  blog_description: z.string().max(200).optional().nullable(),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

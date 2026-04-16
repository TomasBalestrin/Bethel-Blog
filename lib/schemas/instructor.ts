import { z } from 'zod'

const SlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const CreateInstructorSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(SlugRegex, 'Slug inválido: use minúsculas, números e hífen'),
  avatar_url: z.string().url('URL do avatar inválida'),
  bio: z.string().max(500).optional().nullable(),
})

export const UpdateInstructorSchema = CreateInstructorSchema.partial()

export type CreateInstructorInput = z.infer<typeof CreateInstructorSchema>
export type UpdateInstructorInput = z.infer<typeof UpdateInstructorSchema>

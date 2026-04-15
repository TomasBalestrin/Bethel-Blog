import { z } from 'zod'

const HexColorRegex = /^#[0-9a-fA-F]{6}$/
const SlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(SlugRegex, 'Slug inválido (letras minúsculas, números e hifens)')
    .optional(),
  color: z
    .string()
    .regex(HexColorRegex, 'Cor precisa ser hex #RRGGBB')
    .default('#1A5CE6'),
})

export const UpdateCategorySchema = CreateCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>

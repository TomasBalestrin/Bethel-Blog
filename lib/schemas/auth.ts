import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
  password: z.string().min(6, 'Senha precisa ter pelo menos 6 caracteres'),
})

export type LoginInput = z.infer<typeof LoginSchema>

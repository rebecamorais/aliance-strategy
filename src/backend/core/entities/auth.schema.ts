import { z } from "zod"

export const signUpSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(72, "A senha não pode exceder 72 caracteres"),
  fullName: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(120, "O nome não pode exceder 120 caracteres")
    .optional(),
})

export const signInSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe sua senha"),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>

export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().nullable(),
})

export type AuthUser = z.infer<typeof authUserSchema>

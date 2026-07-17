import { z } from "zod"

export const createNoticeSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(100, "O título não pode exceder 100 caracteres"),
  content: z
    .string()
    .min(5, "O conteúdo deve ter pelo menos 5 caracteres")
    .max(1000, "O conteúdo não pode exceder 1000 caracteres"),
})

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>

export const noticeSchema = createNoticeSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(),
})

export type Notice = z.infer<typeof noticeSchema>

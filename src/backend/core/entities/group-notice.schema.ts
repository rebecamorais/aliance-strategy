import { z } from "zod"

export const createGroupNoticeSchema = z.object({
  content: z
    .string()
    .min(3, "Notice must be at least 3 characters long")
    .max(1000, "Notice must be at most 1000 characters long")
    .trim(),
})
export type CreateGroupNoticeInput = z.infer<typeof createGroupNoticeSchema>

export interface GroupNotice {
  id: string
  groupId: string
  profileId: string
  content: string
  createdAt: string
  profile: {
    full_name: string | null
    email: string
  }
}

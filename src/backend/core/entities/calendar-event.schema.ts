import { z } from "zod"

export const createCalendarEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters long")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters long")
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  startTime: z
    .string()
    .datetime({ message: "Start time must be a valid ISO datetime" }),
  endTime: z
    .string()
    .datetime({ message: "End time must be a valid ISO datetime" }),
  isAllDay: z.boolean().default(false),
  groupId: z.string().uuid("Invalid group ID"),
})

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  isAllDay: boolean
  groupId: string | null
  createdBy: string
}

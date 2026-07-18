import { z } from "zod"

export const groupRoleSchema = z.enum(["CREATOR", "OFFICIAL", "MEMBER"])
export type GroupRole = z.infer<typeof groupRoleSchema>

export const applicationStatusSchema = z.enum(["PENDING", "ACCEPTED", "REJECTED"])
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must be at most 50 characters long")
    .trim(),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters long")
    .max(500, "Description must be at most 500 characters long")
    .trim(),
})
export type CreateGroupInput = z.infer<typeof createGroupSchema>

export interface Group {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  profileId: string
  groupId: string
  role: GroupRole
  joinedAt: string
}

export interface Application {
  id: string
  profileId: string
  groupId: string
  status: ApplicationStatus
  createdAt: string
}

export interface GroupWithMemberCount extends Group {
  member_count: number
  is_member: boolean
  has_pending_application: boolean
}
export interface GroupDetails extends Group {
  members: Array<{
    id: string
    profileId: string
    role: GroupRole
    joinedAt: string
    profile: {
      email: string
      full_name: string | null
    }
  }>
  applications?: Array<{
    id: string
    profileId: string
    status: ApplicationStatus
    createdAt: string
    profile: {
      email: string
      full_name: string | null
    }
  }>
}

export interface GroupManagementMember {
  profile_id: string
  role: GroupRole
  joined_at: string
  main_account: string
  email: string
}

export interface GroupManagementApplication {
  id: string
  profile_id: string
  created_at: string
  main_account: string
  email: string
}

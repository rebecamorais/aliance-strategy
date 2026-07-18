export type LogAction = "APPLIED" | "ACCEPTED" | "REJECTED" | "REMOVED" | "LEFT"

export interface GroupLog {
  id: string
  groupId: string
  action: LogAction
  targetId: string
  targetName: string
  actorId: string | null
  actorName: string | null
  createdAt: string
}

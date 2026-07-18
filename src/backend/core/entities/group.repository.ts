import { Group, CreateGroupInput, GroupWithMemberCount, GroupRole } from "./group.schema"
import { GroupNotice } from "./group-notice.schema"

export interface GroupRepository {
  create(input: CreateGroupInput, creatorProfileId: string): Promise<Group>
  isMember(profileId: string, groupId: string): Promise<boolean>
  hasPendingApplication(profileId: string, groupId: string): Promise<boolean>
  apply(profileId: string, groupId: string): Promise<void>
  listAll(profileId: string): Promise<GroupWithMemberCount[]>
  getUserRole(profileId: string, groupId: string): Promise<GroupRole | null>
  createNotice(groupId: string, profileId: string, content: string): Promise<void>
  listNotices(groupId: string): Promise<GroupNotice[]>
  getGroupDetails(groupId: string): Promise<Group | null>
}

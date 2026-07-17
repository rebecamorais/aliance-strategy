import { Group, CreateGroupInput, GroupWithMemberCount } from "./group.schema"

export interface GroupRepository {
  create(input: CreateGroupInput, creatorProfileId: string): Promise<Group>
  isMember(profileId: string, groupId: string): Promise<boolean>
  hasPendingApplication(profileId: string, groupId: string): Promise<boolean>
  apply(profileId: string, groupId: string): Promise<void>
  listAll(profileId: string): Promise<GroupWithMemberCount[]>
}

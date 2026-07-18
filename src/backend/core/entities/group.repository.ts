import { Group, CreateGroupInput, GroupWithMemberCount, GroupRole, GroupManagementMember, GroupManagementApplication, MyGroupDetails } from "./group.schema"
import { GroupNotice } from "./group-notice.schema"
import { GroupLog } from "./group-log.schema"
import { CalendarEvent, CreateCalendarEventInput } from "./calendar-event.schema"

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
  handleApplication(applicationId: string, accept: boolean, actorProfileId: string): Promise<string>
  removeMember(groupId: string, targetProfileId: string, actorProfileId: string): Promise<void>
  listGroupLogs(groupId: string): Promise<GroupLog[]>
  listGroupApplications(groupId: string): Promise<GroupManagementApplication[]>
  listGroupMembers(groupId: string): Promise<GroupManagementMember[]>
  leaveGroup(groupId: string, profileId: string): Promise<void>
  deleteGroup(groupId: string, profileId: string): Promise<void>
  listMyGroups(profileId: string): Promise<MyGroupDetails[]>
  deleteNotice(noticeId: string, profileId: string): Promise<void>
  listCalendarEvents(groupId: string, start: Date, end: Date): Promise<CalendarEvent[]>
  createCalendarEvent(input: CreateCalendarEventInput, profileId: string): Promise<CalendarEvent>
  deleteCalendarEvent(eventId: string, profileId: string): Promise<void>
  updateMemberRole(groupId: string, targetProfileId: string, role: GroupRole, actorProfileId: string): Promise<void>
}

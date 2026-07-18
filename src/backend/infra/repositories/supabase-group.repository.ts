import { GroupRepository } from "@backend/core/entities/group.repository"
import { Group, CreateGroupInput, GroupWithMemberCount, GroupRole, GroupManagementMember, GroupManagementApplication, MyGroupDetails } from "@backend/core/entities/group.schema"
import { GroupNotice } from "@backend/core/entities/group-notice.schema"
import { GroupLog, LogAction } from "@backend/core/entities/group-log.schema"
import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "@backend/infra/supabase/types"

export class SupabaseGroupRepository implements GroupRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async create(input: CreateGroupInput, creatorProfileId: string): Promise<Group> {
    const { data: groupData, error: groupError } = await this.supabase
      .from("groups")
      .insert({
        name: input.name,
        description: input.description,
      })
      .select()
      .single()

    if (groupError) {
      throw new Error(`Failed to create group: ${groupError.message}`)
    }

    const { error: memberError } = await this.supabase
      .from("group_members")
      .insert({
        group_id: groupData.id,
        profile_id: creatorProfileId,
        role: "CREATOR",
      })

    if (memberError) {
      await this.supabase.from("groups").delete().eq("id", groupData.id)
      throw new Error(`Failed to associate group creator: ${memberError.message}`)
    }

    return {
      id: groupData.id,
      name: groupData.name,
      description: groupData.description,
      created_at: groupData.created_at,
      updated_at: groupData.updated_at,
    }
  }

  async isMember(profileId: string, groupId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("group_members")
      .select("id")
      .eq("profile_id", profileId)
      .eq("group_id", groupId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to check membership: ${error.message}`)
    }

    return !!data
  }

  async hasPendingApplication(profileId: string, groupId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("applications")
      .select("id")
      .eq("profile_id", profileId)
      .eq("group_id", groupId)
      .eq("status", "PENDING")
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to check pending application: ${error.message}`)
    }

    return !!data
  }

  async apply(profileId: string, groupId: string): Promise<void> {
    const { error } = await this.supabase
      .from("applications")
      .insert({
        profile_id: profileId,
        group_id: groupId,
        status: "PENDING",
      })

    if (error) {
      throw new Error(`Failed to apply to group: ${error.message}`)
    }

    const { data: profile } = await this.supabase
      .from("profiles")
      .select("main_account")
      .eq("id", profileId)
      .maybeSingle()

    const { error: logError } = await this.supabase
      .from("group_logs")
      .insert({
        group_id: groupId,
        action: "APPLIED",
        target_id: profileId,
        target_name: profile?.main_account || "Unknown User",
        actor_id: profileId,
        actor_name: profile?.main_account || "Unknown User",
      })

    if (logError) {
      console.error("Failed to write application log:", logError.message)
    }
  }

  async listAll(profileId: string): Promise<GroupWithMemberCount[]> {
    const { data: groups, error: groupsError } = await this.supabase
      .from("groups")
      .select("*")
      .order("name", { ascending: true })

    if (groupsError) {
      throw new Error(`Failed to list groups: ${groupsError.message}`)
    }

    if (!groups || groups.length === 0) {
      return []
    }

    const { data: members, error: membersError } = await this.supabase
      .from("group_members")
      .select("group_id, profile_id")

    if (membersError) {
      throw new Error(`Failed to fetch memberships: ${membersError.message}`)
    }

    const { data: apps, error: appsError } = await this.supabase
      .from("applications")
      .select("group_id, status")
      .eq("profile_id", profileId)

    if (appsError) {
      throw new Error(`Failed to fetch user applications: ${appsError.message}`)
    }

    const membersByGroup = (members || []).reduce((acc, curr) => {
      acc[curr.group_id] = acc[curr.group_id] || []
      acc[curr.group_id].push(curr.profile_id)
      return acc
    }, {} as Record<string, string[]>)

    const pendingAppsByGroup = new Set(
      (apps || [])
        .filter((app) => app.status === "PENDING")
        .map((app) => app.group_id)
    )

    return groups.map((g) => {
      const groupMembers = membersByGroup[g.id] || []
      const isMember = groupMembers.includes(profileId)
      const hasPending = pendingAppsByGroup.has(g.id)

      return {
        id: g.id,
        name: g.name,
        description: g.description,
        created_at: g.created_at,
        updated_at: g.updated_at,
        member_count: groupMembers.length,
        is_member: isMember,
        has_pending_application: hasPending,
      }
    })
  }

  async getUserRole(profileId: string, groupId: string): Promise<GroupRole | null> {
    const { data, error } = await this.supabase
      .from("group_members")
      .select("role")
      .eq("profile_id", profileId)
      .eq("group_id", groupId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to check user role: ${error.message}`)
    }

    return data ? (data.role as GroupRole) : null
  }

  async createNotice(groupId: string, profileId: string, content: string): Promise<void> {
    const { error } = await this.supabase
      .from("group_notices")
      .insert({
        group_id: groupId,
        profile_id: profileId,
        content: content,
      })

    if (error) {
      throw new Error(`Failed to post group notice: ${error.message}`)
    }
  }

  async listNotices(groupId: string): Promise<GroupNotice[]> {
    const { data, error } = await this.supabase
       .from("group_notices")
       .select(`
         id,
         group_id,
         profile_id,
         content,
         created_at,
         profiles (
           full_name,
           nickname,
           main_account
         )
       `)
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to list group notices: ${error.message}`)
    }

    return (data || []).map((row) => {
      const profiles = row.profiles as unknown as { full_name: string | null; nickname: string | null; main_account: string } | null
      return {
        id: row.id,
        groupId: row.group_id,
        profileId: row.profile_id,
        content: row.content,
        createdAt: row.created_at,
        profile: {
          full_name: profiles?.full_name || null,
          nickname: profiles?.nickname || null,
          main_account: profiles?.main_account || "Unknown User",
        },
      }
    })
  }

  async getGroupDetails(groupId: string): Promise<Group | null> {
    const { data, error } = await this.supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch group details: ${error.message}`)
    }

    if (!data) return null

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  }

  async handleApplication(applicationId: string, accept: boolean, actorProfileId: string): Promise<string> {
    const { data: app, error: appError } = await this.supabase
      .from("applications")
      .select(`
        *,
        profiles (
          main_account
        )
      `)
      .eq("id", applicationId)
      .maybeSingle()

    if (appError || !app) {
      throw new Error("Application not found.")
    }

    const groupId = app.group_id
    const targetProfileId = app.profile_id
    const candidateProfile = app.profiles as unknown as { main_account: string } | null
    const targetName = candidateProfile?.main_account || "Unknown User"

    const { data: actorMember, error: roleError } = await this.supabase
      .from("group_members")
      .select("role")
      .eq("profile_id", actorProfileId)
      .eq("group_id", groupId)
      .maybeSingle()

    if (roleError || !actorMember || (actorMember.role !== "CREATOR" && actorMember.role !== "OFFICIAL")) {
      throw new Error("Forbidden: You do not have officer permissions in this group.")
    }

    const { data: actorProfile } = await this.supabase
      .from("profiles")
      .select("main_account")
      .eq("id", actorProfileId)
      .maybeSingle()

    if (accept) {
      const { error: insertError } = await this.supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          profile_id: targetProfileId,
          role: "MEMBER",
        })

      if (insertError) {
        throw new Error(`Failed to add group member: ${insertError.message}`)
      }
    }

    const { error: deleteError } = await this.supabase
      .from("applications")
      .delete()
      .eq("id", applicationId)

    if (deleteError) {
      throw new Error(`Failed to clear application: ${deleteError.message}`)
    }

    const { error: logError } = await this.supabase
      .from("group_logs")
      .insert({
        group_id: groupId,
        action: accept ? "ACCEPTED" : "REJECTED",
        target_id: targetProfileId,
        target_name: targetName,
        actor_id: actorProfileId,
        actor_name: actorProfile?.main_account || "Unknown Officer",
      })

    if (logError) {
      console.error("Failed to write audit log:", logError.message)
    }

    return groupId
  }

  async removeMember(groupId: string, targetProfileId: string, actorProfileId: string): Promise<void> {
    const [actorRes, targetRes] = await Promise.all([
      this.supabase
        .from("group_members")
        .select("role")
        .eq("profile_id", actorProfileId)
        .eq("group_id", groupId)
        .maybeSingle(),
      this.supabase
        .from("group_members")
        .select(`
          role,
          profiles (
            main_account
          )
        `)
        .eq("profile_id", targetProfileId)
        .eq("group_id", groupId)
        .maybeSingle(),
    ])

    if (actorRes.error || !actorRes.data || targetRes.error || !targetRes.data) {
      throw new Error("Invalid member or group relation.")
    }

    const actorRole = actorRes.data.role
    const targetRole = targetRes.data.role
    const targetProfile = targetRes.data.profiles as unknown as { main_account: string } | null
    const targetName = targetProfile?.main_account || "Member"

    if (actorRole === "MEMBER") {
      throw new Error("Forbidden: Access Denied.")
    }
    if (actorRole === "OFFICIAL" && (targetRole === "CREATOR" || targetRole === "OFFICIAL")) {
      throw new Error("Forbidden: Officers cannot remove other Officers or the group Creator.")
    }

    const { data: actorProfile } = await this.supabase
      .from("profiles")
      .select("main_account")
      .eq("id", actorProfileId)
      .maybeSingle()

    const { error: deleteError } = await this.supabase
      .from("group_members")
      .delete()
      .eq("profile_id", targetProfileId)
      .eq("group_id", groupId)

    if (deleteError) {
      throw new Error(`Failed to remove member: ${deleteError.message}`)
    }

    const { error: logError } = await this.supabase
      .from("group_logs")
      .insert({
        group_id: groupId,
        action: "REMOVED",
        target_id: targetProfileId,
        target_name: targetName,
        actor_id: actorProfileId,
        actor_name: actorProfile?.main_account || "Unknown Officer",
      })

    if (logError) {
      console.error("Failed to write removal log:", logError.message)
    }
  }

  async listGroupLogs(groupId: string): Promise<GroupLog[]> {
    const { data, error } = await this.supabase
      .from("group_logs")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    return (data || []).map((row) => ({
      id: row.id,
      groupId: row.group_id,
      action: row.action as LogAction,
      targetId: row.target_id,
      targetName: row.target_name,
      actorId: row.actor_id,
      actorName: row.actor_name,
      createdAt: row.created_at,
    }))
  }

  async listGroupApplications(groupId: string): Promise<GroupManagementApplication[]> {
    const { data, error } = await this.supabase
      .from("applications")
      .select(`
        id,
        profile_id,
        created_at,
        profiles (
          main_account,
          nickname,
          full_name
        )
      `)
      .eq("group_id", groupId)
      .eq("status", "PENDING")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to list group applications: ${error.message}`)
    }

    return (data || []).map((row) => {
      const profile = row.profiles as unknown as { main_account: string; nickname: string | null; full_name: string | null } | null
      return {
        id: row.id,
        profile_id: row.profile_id,
        created_at: row.created_at,
        main_account: profile?.main_account || "Unknown User",
        nickname: profile?.nickname || null,
        full_name: profile?.full_name || null,
      }
    })
  }

  async listGroupMembers(groupId: string): Promise<GroupManagementMember[]> {
    const { data, error } = await this.supabase
      .from("group_members")
      .select(`
        profile_id,
        role,
        joined_at,
        profiles (
          main_account,
          nickname,
          full_name
        )
      `)
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true })

    if (error) {
      throw new Error(`Failed to list group members: ${error.message}`)
    }

    return (data || []).map((row) => {
      const profile = row.profiles as unknown as { main_account: string; nickname: string | null; full_name: string | null } | null
      return {
        profile_id: row.profile_id,
        role: row.role as GroupRole,
        joined_at: row.joined_at,
        main_account: profile?.main_account || "Unknown User",
        nickname: profile?.nickname || null,
        full_name: profile?.full_name || null,
      }
    })
  }

  async leaveGroup(groupId: string, profileId: string): Promise<void> {
    const role = await this.getUserRole(profileId, groupId)
    if (!role) {
      throw new Error("You are not a member of this group.")
    }
    if (role === "CREATOR") {
      throw new Error("Creator cannot leave the group. You must delete the group instead.")
    }

    const { data: profile } = await this.supabase
      .from("profiles")
      .select("main_account")
      .eq("id", profileId)
      .maybeSingle()

    const { error: deleteError } = await this.supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("profile_id", profileId)

    if (deleteError) {
      throw new Error(`Failed to leave group: ${deleteError.message}`)
    }

    const { error: logError } = await this.supabase
      .from("group_logs")
      .insert({
        group_id: groupId,
        action: "LEFT",
        target_id: profileId,
        target_name: profile?.main_account || "Unknown User",
        actor_id: profileId,
        actor_name: profile?.main_account || "Unknown User",
      })

    if (logError) {
      console.error("Failed to write leave log:", logError.message)
    }
  }

  async deleteGroup(groupId: string, profileId: string): Promise<void> {
    const role = await this.getUserRole(profileId, groupId)
    if (!role || role !== "CREATOR") {
      throw new Error("Forbidden: Only the group Creator can delete this group.")
    }

    const { error } = await this.supabase
      .from("groups")
      .delete()
      .eq("id", groupId)

    if (error) {
      throw new Error(`Failed to delete group: ${error.message}`)
    }
  }

  async listMyGroups(profileId: string): Promise<MyGroupDetails[]> {
    const allGroups = await this.listAll(profileId)
    const myGroups = allGroups.filter((g) => g.is_member || g.has_pending_application)

    if (myGroups.length === 0) return []

    const groupIds = myGroups.map((g) => g.id)
    const { data: memberRoles } = await this.supabase
      .from("group_members")
      .select("group_id, role")
      .eq("profile_id", profileId)
      .in("group_id", groupIds)

    const roleMap = (memberRoles || []).reduce((acc, curr) => {
      acc[curr.group_id] = curr.role
      return acc
    }, {} as Record<string, string>)

    return myGroups.map((g) => ({
      ...g,
      role: (roleMap[g.id] as GroupRole) || null,
    }))
  }

  async deleteNotice(noticeId: string, profileId: string): Promise<void> {
    const { data: notice, error: fetchError } = await this.supabase
      .from("group_notices")
      .select("group_id, profile_id")
      .eq("id", noticeId)
      .maybeSingle()

    if (fetchError || !notice) {
      throw new Error("Notice not found.")
    }

    if (notice.profile_id !== profileId) {
      const role = await this.getUserRole(profileId, notice.group_id)
      if (role !== "CREATOR" && role !== "OFFICIAL") {
        throw new Error("Forbidden: You do not have permission to delete this notice.")
      }
    }

    const { error: deleteError } = await this.supabase
      .from("group_notices")
      .delete()
      .eq("id", noticeId)

    if (deleteError) {
      throw new Error(`Failed to delete notice: ${deleteError.message}`)
    }
  }
}

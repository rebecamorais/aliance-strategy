import { GroupRepository } from "@backend/core/entities/group.repository"
import { Group, CreateGroupInput, GroupWithMemberCount } from "@backend/core/entities/group.schema"
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
}

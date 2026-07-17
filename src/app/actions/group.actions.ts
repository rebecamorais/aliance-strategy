"use server"

import { createClient } from "@/utils/supabase/server"
import { SupabaseGroupRepository } from "@backend/infra/repositories/supabase-group.repository"
import { CreateGroupUseCase } from "@backend/core/use-cases/create-group.use-case"
import { ApplyToGroupUseCase } from "@backend/core/use-cases/apply-to-group.use-case"
import { createGroupSchema, GroupWithMemberCount } from "@backend/core/entities/group.schema"
import type { ActionResponse } from "@shared/action-response"
import { revalidatePath } from "next/cache"
import { isSupabasePlaceholder } from "@shared/supabase-config"

export async function createGroupAction(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  const validation = createGroupSchema.safeParse({ name, description })

  if (!validation.success) {
    return {
      success: false,
      message: "Invalid form data.",
      errors: validation.error.flatten().fieldErrors,
    }
  }

  if (isSupabasePlaceholder()) {
    return {
      success: false,
      message: "Demo mode: local database is offline. Start Supabase to create groups.",
    }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: "Unauthorized." }
    }

    const repository = new SupabaseGroupRepository(supabase)
    const useCase = new CreateGroupUseCase(repository)
    const group = await useCase.execute(validation.data, user.id)

    revalidatePath("/dashboard/explore")
    
    return {
      success: true,
      message: "Group created successfully!",
      data: group,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create group."
    return {
      success: false,
      message: message.includes("duplicate key") || message.includes("unique constraint")
        ? "This group name is already in use."
        : message,
    }
  }
}

export async function applyToGroupAction(groupId: string): Promise<ActionResponse> {
  if (isSupabasePlaceholder()) {
    return {
      success: false,
      message: "Demo mode: local database is offline.",
    }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Unauthorized." }
    }

    const repository = new SupabaseGroupRepository(supabase)
    const useCase = new ApplyToGroupUseCase(repository)
    await useCase.execute(user.id, groupId)

    revalidatePath("/dashboard/explore")

    return {
      success: true,
      message: "Application submitted successfully!",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to apply to group.",
    }
  }
}

export async function listGroupsAction(): Promise<GroupWithMemberCount[]> {
  if (isSupabasePlaceholder()) {
    return []
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const repository = new SupabaseGroupRepository(supabase)
    return await repository.listAll(user.id)
  } catch {
    return []
  }
}

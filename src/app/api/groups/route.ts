import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { SupabaseGroupRepository } from "@backend/infra/repositories/supabase-group.repository"
import { CreateGroupUseCase } from "@backend/core/use-cases/create-group.use-case"
import { createGroupSchema } from "@backend/core/entities/group.schema"
import { isSupabasePlaceholder } from "@shared/supabase-config"

export async function POST(request: Request) {
  if (isSupabasePlaceholder()) {
    return NextResponse.json(
      { success: false, message: "Demo mode: local database is offline." },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const validation = createGroupSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid form data.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      )
    }

    const repository = new SupabaseGroupRepository(supabase)
    const useCase = new CreateGroupUseCase(repository)
    const group = await useCase.execute(validation.data, user.id)

    return NextResponse.json(
      {
        success: true,
        message: "Group created successfully!",
        data: group,
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create group."
    const isDuplicate = message.includes("duplicate key") || message.includes("unique constraint")
    return NextResponse.json(
      {
        success: false,
        message: isDuplicate ? "This group name is already in use." : message,
      },
      { status: isDuplicate ? 409 : 500 }
    )
  }
}

export async function GET() {
  if (isSupabasePlaceholder()) {
    return NextResponse.json([])
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      )
    }

    const repository = new SupabaseGroupRepository(supabase)
    const groups = await repository.listAll(user.id)

    return NextResponse.json(groups)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch groups.",
      },
      { status: 500 }
    )
  }
}

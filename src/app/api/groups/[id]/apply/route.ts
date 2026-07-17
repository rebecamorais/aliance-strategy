import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { SupabaseGroupRepository } from "@backend/infra/repositories/supabase-group.repository"
import { ApplyToGroupUseCase } from "@backend/core/use-cases/apply-to-group.use-case"
import { isSupabasePlaceholder } from "@shared/supabase-config"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isSupabasePlaceholder()) {
    return NextResponse.json(
      { success: false, message: "Demo mode: local database is offline." },
      { status: 503 }
    )
  }

  try {
    const { id: groupId } = await params
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
    const useCase = new ApplyToGroupUseCase(repository)
    await useCase.execute(user.id, groupId)

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply to group."
    const isConflict = message.includes("already")
    return NextResponse.json(
      { success: false, message },
      { status: isConflict ? 409 : 500 }
    )
  }
}

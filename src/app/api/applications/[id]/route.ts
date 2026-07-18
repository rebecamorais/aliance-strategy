import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { SupabaseGroupRepository } from "@backend/infra/repositories/supabase-group.repository"
import { isSupabasePlaceholder } from "@shared/supabase-config"

export async function PUT(
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
    const { id: applicationId } = await params
    const body = await request.json()
    const { accept } = body

    if (typeof accept !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid payload: 'accept' must be a boolean." },
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
    const groupId = await repository.handleApplication(applicationId, accept, user.id)

    return NextResponse.json({
      success: true,
      message: accept ? "Application approved!" : "Application rejected.",
      groupId,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to process application.",
      },
      { status: 500 }
    )
  }
}

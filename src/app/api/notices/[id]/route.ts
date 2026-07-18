import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { SupabaseGroupRepository } from "@backend/infra/repositories/supabase-group.repository"
import { isSupabasePlaceholder } from "@shared/supabase-config"

export async function DELETE(
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
    const { id: noticeId } = await params
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
    await repository.deleteNotice(noticeId, user.id)

    return NextResponse.json({
      success: true,
      message: "Notice deleted successfully.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete notice.",
      },
      { status: 500 }
    )
  }
}

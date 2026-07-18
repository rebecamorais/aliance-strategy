import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { SupabaseGroupRepository } from "@backend/infra/repositories/supabase-group.repository"
import { isSupabasePlaceholder } from "@shared/supabase-config"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; profileId: string }> }
) {
  if (isSupabasePlaceholder()) {
    return NextResponse.json(
      { success: false, message: "Demo mode: local database is offline." },
      { status: 503 }
    )
  }

  try {
    const { id: groupId, profileId: targetProfileId } = await params
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
    await repository.removeMember(groupId, targetProfileId, user.id)

    return NextResponse.json({
      success: true,
      message: "Member removed successfully.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove member.",
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; profileId: string }> }
) {
  if (isSupabasePlaceholder()) {
    return NextResponse.json(
      { success: false, message: "Demo mode: local database is offline." },
      { status: 503 }
    )
  }

  try {
    const { id: groupId, profileId: targetProfileId } = await params
    const { role } = await request.json()
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

    if (!role || (role !== "OFFICIAL" && role !== "MEMBER")) {
      return NextResponse.json(
        { success: false, message: "Invalid role specified." },
        { status: 400 }
      )
    }

    const repository = new SupabaseGroupRepository(supabase)
    await repository.updateMemberRole(groupId, targetProfileId, role, user.id)

    return NextResponse.json({
      success: true,
      message: `Member successfully ${role === "OFFICIAL" ? "promoted to Officer" : "demoted to Member"}.`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update member role.",
      },
      { status: 500 }
    )
  }
}

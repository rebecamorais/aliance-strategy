import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { SupabaseGroupRepository } from "@backend/infra/repositories/supabase-group.repository"
import { createGroupNoticeSchema } from "@backend/core/entities/group-notice.schema"
import { isSupabasePlaceholder } from "@shared/supabase-config"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isSupabasePlaceholder()) {
    return NextResponse.json([])
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
    const isMember = await repository.isMember(user.id, groupId)

    if (!isMember) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You are not a member of this group." },
        { status: 403 }
      )
    }

    const notices = await repository.listNotices(groupId)
    return NextResponse.json(notices)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load timeline feed.",
      },
      { status: 500 }
    )
  }
}

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
    const body = await request.json()
    const validation = createGroupNoticeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid notice content.",
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
    const userRole = await repository.getUserRole(user.id, groupId)

    if (!userRole || (userRole !== "CREATOR" && userRole !== "OFFICIAL")) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only group Officers can post notices." },
        { status: 403 }
      )
    }

    await repository.createNotice(groupId, user.id, validation.data.content)

    return NextResponse.json(
      { success: true, message: "Announcement posted successfully!" },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to post notice.",
      },
      { status: 500 }
    )
  }
}

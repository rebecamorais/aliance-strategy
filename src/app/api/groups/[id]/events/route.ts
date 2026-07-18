import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { SupabaseGroupRepository } from "@backend/infra/repositories/supabase-group.repository"
import { isSupabasePlaceholder } from "@shared/supabase-config"
import { createCalendarEventSchema } from "@backend/core/entities/calendar-event.schema"

export async function GET(
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
    const { searchParams } = new URL(request.url)
    const startStr = searchParams.get("start")
    const endStr = searchParams.get("end")

    if (!startStr || !endStr) {
      return NextResponse.json(
        { success: false, message: "Missing start or end query parameters." },
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
    const events = await repository.listCalendarEvents(
      groupId,
      new Date(startStr),
      new Date(endStr)
    )

    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch events.",
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

    const body = await request.json()
    const result = createCalendarEventSchema.safeParse({
      ...body,
      groupId,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const repository = new SupabaseGroupRepository(supabase)
    const event = await repository.createCalendarEvent(result.data, user.id)

    return NextResponse.json({
      success: true,
      message: "Event created successfully.",
      event,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create event.",
      },
      { status: 500 }
    )
  }
}

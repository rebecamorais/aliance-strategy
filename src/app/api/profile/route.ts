import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { isSupabasePlaceholder } from "@shared/supabase-config"
import { z } from "zod"

const updateProfileSchema = z.object({
  nickname: z
    .string()
    .max(30, "Nickname must be at most 30 characters long")
    .trim()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
})

export async function PUT(request: Request) {
  if (isSupabasePlaceholder()) {
    return NextResponse.json(
      { success: false, message: "Demo mode: local database is offline." },
      { status: 503 }
    )
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

    const body = await request.json()
    const result = updateProfileSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { nickname } = result.data

    const { error } = await supabase
      .from("profiles")
      .update({ nickname })
      .eq("id", user.id)

    if (error) {
      return NextResponse.json(
        { success: false, message: `Failed to update profile: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred.",
      },
      { status: 500 }
    )
  }
}

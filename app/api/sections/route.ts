import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: sections, error } = await supabase
      .from("sections")
      .select(`
        section_id,
        semester,
        year,
        capacity,
        registered_count,
        registration_deadline,
        users:users!professor_id(
          full_name,
          user_id
        ),
        courses(
          course_id,
          title,
          credits,
          departments(
            name
          )
        )
      `)
      .order("year", { ascending: false })
      .order("semester")

    if (error) {
      console.error("Error fetching sections:", error)
      return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 })
    }

    return NextResponse.json({ sections })
  } catch (error) {
    console.error("Error in sections API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
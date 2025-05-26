import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Fetch course details including department information
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select(`
        course_id,
        title,
        description,
        credits,
        departments!inner(
          name
        )
      `)
      .eq("course_id", id)
      .single()

    if (courseError) {
      if (courseError.code === "PGRST116") {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }
      throw courseError
    }

    // Format the response to include department name
    const course = {
      course_id: courseData.course_id,
      title: courseData.title,
      description: courseData.description,
      credits: courseData.credits,
      department: courseData.departments[0].name
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error("Error fetching course details:", error)
    return NextResponse.json({ error: "Failed to fetch course details" }, { status: 500 })
  }
} 
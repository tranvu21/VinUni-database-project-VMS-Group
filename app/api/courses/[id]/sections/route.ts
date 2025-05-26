import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    // Only faculty can create sections
    if (!session || session.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId } = await params
    const { section } = await request.json()

    // Validate section data
    if (!section?.semester || !section?.year || !section?.capacity || !section?.registration_deadline || !section?.professor_id) {
      return NextResponse.json({ error: "Missing required section fields" }, { status: 400 })
    }

    // Verify that the selected professor exists and is actually a professor
    const { data: professorData, error: professorError } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", section.professor_id)
      .single()

    if (professorError || !professorData) {
      return NextResponse.json({ error: "Professor not found" }, { status: 404 })
    }

    if (professorData.role !== "professor") {
      return NextResponse.json({ error: "Selected user is not a professor" }, { status: 400 })
    }

    // Create the section
    const { data: sectionData, error: sectionError } = await supabase
      .from("sections")
      .insert({
        course_id: courseId,
        semester: section.semester,
        year: Number(section.year),
        capacity: Number(section.capacity),
        registered_count: 0,
        registration_deadline: section.registration_deadline,
        professor_id: section.professor_id,
      })
      .select()
      .single()

    if (sectionError) {
      console.error("Error creating section:", sectionError)
      return NextResponse.json({ error: sectionError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, section: sectionData })
  } catch (error) {
    console.error("Error creating section:", error)
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId } = await params

    // Get all sections for this course
    const { data: sections, error } = await supabase
      .from("sections")
      .select(`
        *,
        users!professor_id(
          full_name
        )
      `)
      .eq("course_id", courseId)
      .order("year", { ascending: false })
      .order("semester")

    if (error) {
      console.error("Error fetching sections:", error)
      return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 })
    }

    return NextResponse.json({ sections })
  } catch (error) {
    console.error("Error fetching sections:", error)
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 })
  }
} 
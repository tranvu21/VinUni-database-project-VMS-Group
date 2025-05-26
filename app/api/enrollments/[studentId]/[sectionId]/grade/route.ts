import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export async function PUT(request: Request, { params }: { params: Promise<{ studentId: string; sectionId: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "professor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { studentId, sectionId } = await params
    const { grade } = await request.json()

    // Validate grade
    const validGrades = ["A", "B", "C", "D", "F", "I", "W", ""]
    if (!validGrades.includes(grade)) {
      return NextResponse.json({ error: "Invalid grade" }, { status: 400 })
    }

    // Check if the professor teaches this section
    const { data: sectionData, error: sectionError } = await supabase
      .from("sections")
      .select("*")
      .eq("section_id", sectionId)
      .eq("professor_id", session.user_id)
      .single()

    if (sectionError || !sectionData) {
      return NextResponse.json({ error: "You do not teach this section" }, { status: 403 })
    }

    // Update the grade
    const { error } = await supabase
      .from("enrollments")
      .update({ grade: grade || null })
      .eq("student_id", studentId)
      .eq("section_id", sectionId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating grade:", error)
    return NextResponse.json({ error: "Failed to update grade" }, { status: 500 })
  }
}

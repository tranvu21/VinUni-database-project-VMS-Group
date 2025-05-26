import { createServerClient } from "@/lib/supabase"
import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sectionId: string; enrollmentId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Only faculty and professors can update grades
  if (session.role !== "faculty" && session.role !== "professor") {
    return new NextResponse("Forbidden", { status: 403 })
  }

  try {
    const { sectionId, enrollmentId } = await params
    const { grade } = await request.json()
    const supabase = createServerClient()

    // Verify the section exists and user has access
    const { data: section } = await supabase
      .from("sections")
      .select("professor_id")
      .eq("section_id", sectionId)
      .single()

    if (!section) {
      return new NextResponse("Section not found", { status: 404 })
    }

    // Only the assigned professor or faculty can update grades
    if (session.role === "professor" && section.professor_id !== session.user_id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Update the grade
    const { error } = await supabase
      .from("enrollments")
      .update({ grade })
      .eq("enrollment_id", enrollmentId)
      .eq("section_id", sectionId)

    if (error) {
      console.error("Error updating grade:", error)
      return new NextResponse("Failed to update grade", { status: 500 })
    }

    return new NextResponse("Grade updated successfully", { status: 200 })
  } catch (error) {
    console.error("Error in grade update:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
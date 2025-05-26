import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || (session.role !== "faculty" && session.role !== "professor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId } = await params

    // If professor, check if they teach this course
    if (session.role === "professor") {
      const { data: professorCourse, error: professorError } = await supabase
        .from("sections")
        .select("*")
        .eq("course_id", courseId)
        .eq("professor_id", session.user_id)

      if (professorError || professorCourse.length === 0) {
        return NextResponse.json({ error: "You do not teach this course" }, { status: 403 })
      }
    }

    // Get all students enrolled in any section of this course
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        students!inner(
          *,
          users!inner(
            full_name,
            email
          )
        ),
        sections!inner(
          semester,
          year,
          course_id
        )
      `)
      .eq("sections.course_id", courseId)

    if (error) throw error

    // Format the data for the frontend
    const students = data.map((enrollment) => ({
      student_id: enrollment.student_id,
      section_id: enrollment.section_id,
      full_name: enrollment.students.users.full_name,
      email: enrollment.students.users.email,
      semester: enrollment.sections.semester,
      year: enrollment.sections.year,
      enrolled_at: enrollment.enrolled_at,
      grade: enrollment.grade,
    }))

    return NextResponse.json({ students })
  } catch (error) {
    console.error("Error fetching enrolled students:", error)
    return NextResponse.json({ error: "Failed to fetch enrolled students" }, { status: 500 })
  }
}

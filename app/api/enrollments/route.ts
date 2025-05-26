import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { section_id } = await request.json()
    if (!section_id) {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if section exists and has capacity
    const { data: section, error: sectionError } = await supabase
      .from("sections")
      .select("capacity, registered_count")
      .eq("section_id", section_id)
      .single()

    if (sectionError || !section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    if (section.registered_count >= section.capacity) {
      return NextResponse.json({ error: "Section is full" }, { status: 400 })
    }

    // Check if student is already enrolled
    const { data: existingEnrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("student_id", session.user_id)
      .eq("section_id", section_id)
      .single()

    if (enrollmentError && enrollmentError.code !== "PGRST116") {
      console.error("Error checking enrollment:", enrollmentError)
      return NextResponse.json({ error: "Failed to check enrollment" }, { status: 500 })
    }

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this section" }, { status: 400 })
    }

    // Create enrollment
    const { error: insertError } = await supabase
      .from("enrollments")
      .insert({
        student_id: session.user_id,
        section_id: section_id,
        enrolled_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error("Error inserting enrollment:", insertError)
      return NextResponse.json({ error: "Failed to enroll" }, { status: 500 })
    }

    // Update section registered count
    const { error: updateError } = await supabase
      .from("sections")
      .update({ registered_count: section.registered_count + 1 })
      .eq("section_id", section_id)

    if (updateError) {
      // Rollback enrollment if update fails
      await supabase
        .from("enrollments")
        .delete()
        .eq("student_id", session.user_id)
        .eq("section_id", section_id)
      return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
    }

    return NextResponse.json({ message: "Successfully enrolled" })
  } catch (error) {
    console.error("Error in enrollment API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Get student's enrollments with full details
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        sections!inner(
          section_id,
          semester,
          year,
          capacity,
          registered_count,
          registration_deadline,
          courses!inner(
            course_id,
            title,
            credits,
            departments!inner(
              name
            )
          ),
          users!sections_professor_id_fkey(
            full_name
          ),
          schedules(
            day_of_week,
            start_time,
            end_time,
            room
          )
        )
      `)
      .eq("student_id", session.user_id)
      .order("sections(year)", { ascending: false })
      .order("sections(semester)")

    if (error) {
      console.error("Error fetching enrollments:", error)
      return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
    }

    // Format the data for the frontend
    const formattedEnrollments = enrollments.map(enrollment => ({
      student_id: enrollment.student_id,
      section_id: enrollment.section_id,
      enrolled_at: enrollment.enrolled_at,
      grade: enrollment.grade,
      sections: {
        section_id: enrollment.sections.section_id,
        semester: enrollment.sections.semester,
        year: enrollment.sections.year,
        capacity: enrollment.sections.capacity,
        registered_count: enrollment.sections.registered_count,
        registration_deadline: enrollment.sections.registration_deadline,
        courses: {
          course_id: enrollment.sections.courses.course_id,
          title: enrollment.sections.courses.title,
          credits: enrollment.sections.courses.credits,
          departments: {
            name: enrollment.sections.courses.departments.name
          }
        },
        professors: {
          users: {
            full_name: enrollment.sections.users.full_name
          }
        },
        schedules: enrollment.sections.schedules
      }
    }))

    return NextResponse.json({ enrollments: formattedEnrollments })
  } catch (error) {
    console.error("Error in enrollments API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

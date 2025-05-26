import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { PostgrestError } from "@supabase/supabase-js"

interface CourseWithDepartment {
  course_id: number
  title: string
  description: string
  credits: number
  department_id: number
  departments: {
    name: string
  }
}

export async function GET() {
  try {
    // Fetch only basic course information
    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select(`
        course_id,
        title,
        description,
        credits,
        department_id,
        departments!department_id(
          name
        )
      `) as { data: CourseWithDepartment[] | null, error: PostgrestError | null }

    if (coursesError) throw coursesError

    // Format the courses data to include department name
    const courses = coursesData?.map(course => ({
      course_id: course.course_id,
      title: course.title,
      description: course.description,
      credits: course.credits,
      department: course.departments?.name || "No Department"
    })) || []

    return NextResponse.json({
      courses
    })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== "professor" && session.role !== "faculty")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { course } = await request.json()

    // Validate course data
    if (!course?.title || !course?.description || !course?.department_id || !course?.credits) {
      return NextResponse.json({ error: "Missing required course fields" }, { status: 400 })
    }

    // Create the course
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .insert({
        title: course.title,
        description: course.description,
        credits: Number.parseInt(course.credits),
        department_id: Number.parseInt(course.department_id),
        created_by: session.user_id,
      })
      .select()
      .single()

    if (courseError || !courseData) {
      return NextResponse.json({ error: courseError?.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, course_id: courseData.course_id })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

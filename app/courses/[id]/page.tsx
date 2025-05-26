import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"
import { PostgrestError } from "@supabase/supabase-js"
import CourseDetailContent from "./course-detail-content"

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

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  const { id: courseId } = await params

  if (!session) {
    redirect("/login")
  }

  const supabase = createServerClient()

  // Fetch course details including department information
  const { data: course, error } = await supabase
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
    `)
    .eq("course_id", courseId)
    .single() as { data: CourseWithDepartment | null, error: PostgrestError | null }

  if (error || !course) {
    console.error("Error fetching course:", error)
    redirect("/courses")
  }

  // Format the course data to include department name
  const formattedCourse = {
    course_id: course.course_id,
    title: course.title,
    description: course.description,
    credits: course.credits,
    department: course.departments?.name || "No Department"
  }

  return <CourseDetailContent user={session} course={formattedCourse} />
}

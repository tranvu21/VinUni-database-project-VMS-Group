import { createServerClient } from "@/lib/supabase"
import { getSession } from "@/lib/session"
import SectionDetailContent from "./section-detail-content"
import { redirect } from "next/navigation"

export default async function SectionDetailPage({ params }: { params: Promise<{ id: string, sectionId: string }> }) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const supabase = createServerClient()
  const { id: courseId, sectionId } = await params

  // Fetch section details, including course and professor info
  const { data: sectionRaw, error } = await supabase
    .from("sections")
    .select(`
      section_id,
      semester,
      year,
      capacity,
      registered_count,
      registration_deadline,
      users:users!professor_id(full_name, user_id),
      courses(
        course_id,
        title,
        credits,
        departments(name)
      ),
      enrollments(
        enrollment_id,
        grade,
        users(
          user_id,
          full_name,
          email
        )
      )
    `)
    .eq("section_id", sectionId)
    .eq("course_id", courseId)
    .single()

  console.log("Section data:", sectionRaw)

  if (error || !sectionRaw) {
    console.log("Error fetching section:", error)
    redirect(`/courses/${courseId}`)
  }

  const firstCourse = Array.isArray(sectionRaw.courses)
  ? sectionRaw.courses[0]
  : sectionRaw.courses

const firstDepartment = Array.isArray(firstCourse?.departments)
  ? firstCourse.departments[0]
  : firstCourse?.departments

const firstUser = Array.isArray(sectionRaw.users)
  ? sectionRaw.users[0]
  : sectionRaw.users

const normalizedEnrollments = Array.isArray(sectionRaw.enrollments)
  ? sectionRaw.enrollments.map(enrollment => ({
      ...enrollment,
      users: Array.isArray(enrollment.users) ? enrollment.users[0] : enrollment.users,
    }))
  : []

const section = {
  ...sectionRaw,
  users: firstUser,
  courses: {
    ...firstCourse,
    departments: firstDepartment,
  },
  enrollments: normalizedEnrollments,
}

  return <SectionDetailContent user={session} section={section} />
} 

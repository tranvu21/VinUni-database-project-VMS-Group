import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"
import CourseCreateForm from "./course-create-form"

export default async function CreateCoursePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Only professors and faculty can create courses
  if (session.role !== "professor" && session.role !== "faculty") {
    redirect("/dashboard")
  }

  // Fetch departments for the dropdown
  const supabase = createServerClient()
  const { data: departments } = await supabase.from("departments").select("*").order("name")

  // If professor, get their department
  let professorDepartment = null
  if (session.role === "professor") {
    const { data } = await supabase
      .from("professors")
      .select("department_id")
      .eq("professor_id", session.user_id)
      .single()

    if (data) {
      professorDepartment = data.department_id
    }
  }

  return <CourseCreateForm user={session} departments={departments || []} professorDepartment={professorDepartment} />
}

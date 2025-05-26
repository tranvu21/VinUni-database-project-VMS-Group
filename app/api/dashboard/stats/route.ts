import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get total courses
    const { count: totalCourses } = await supabase.from("courses").select("*", { count: "exact", head: true })

    // Get total students (users with role 'student')
    const { count: totalStudents } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")

    // Get total professors (users with role 'professor')
    const { count: totalProfessors } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "professor")

    // Get active sections
    const { count: activeSections } = await supabase.from("sections").select("*", { count: "exact", head: true })

    return NextResponse.json({
      totalCourses: totalCourses || 0,
      totalStudents: totalStudents || 0,
      totalProfessors: totalProfessors || 0,
      activeSections: activeSections || 0,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}

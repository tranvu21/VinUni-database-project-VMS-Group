import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all users with professor role
    const { data: professors, error } = await supabase
      .from("users")
      .select(`
        user_id,
        full_name
      `)
      .eq("role", "professor")
      .order("full_name")

    console.log(professors)

    if (error) {
      console.error("Error fetching professors:", error)
      return NextResponse.json({ error: "Failed to fetch professors" }, { status: 500 })
    }

    return NextResponse.json({ professors })
  } catch (error) {
    console.error("Error fetching professors:", error)
    return NextResponse.json({ error: "Failed to fetch professors" }, { status: 500 })
  }
} 
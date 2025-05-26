import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: userId } = await params

    // Check if user exists
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("user_id", userId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deleting yourself
    if (Number.parseInt(userId) === session.user_id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
    }

    // Delete user
    const { error } = await supabase.from("users").delete().eq("user_id", userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

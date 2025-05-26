import { NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { createSession } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const { username, password, email, full_name, role } = await request.json()

    if (!username || !password || !email || !full_name || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const user = await createUser({
      username,
      password,
      email,
      full_name,
      role,
    })

    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    await createSession(user)

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

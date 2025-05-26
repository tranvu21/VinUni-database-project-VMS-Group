import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: Promise<{ sectionId: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { sectionId } = await params
    const { data: schedules, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("section_id", sectionId)
      .order("day_of_week")
    if (error) {
      return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
    }
    return NextResponse.json({ schedules })
  } catch (e) {
    console.error("Error fetching schedules:", e)
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ sectionId: string }> }) {
  try {
    const session = await getSession()
    if (!session || (session.role !== "faculty" && session.role !== "professor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { sectionId } = await params
    const { schedule } = await request.json()
    if (!schedule?.day_of_week || !schedule?.start_time || !schedule?.end_time || !schedule?.room) {
      return NextResponse.json({ error: "Missing schedule fields" }, { status: 400 })
    }
    const { data, error } = await supabase
      .from("schedules")
      .insert({
        section_id: sectionId,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        room: schedule.room
      })
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ schedule: data })
  } catch (e) {
    console.error("Error adding schedule:", e)
    return NextResponse.json({ error: "Failed to add schedule" }, { status: 500 })
  }
}
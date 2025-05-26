import { NextResponse } from "next/server"

export async function GET() {
  const envCheck = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasJwtSecret: !!process.env.JWT_SECRET,
  }

  return NextResponse.json(envCheck)
} 
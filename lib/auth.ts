import bcrypt from "bcryptjs"
import { supabase } from "./supabase"

export interface User {
  user_id: number
  username: string
  email: string
  full_name: string
  role: "student" | "professor" | "faculty"
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Update the authenticateUser function to log more details for debugging
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  console.log(`Attempting to authenticate user: ${username}`)

  const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

  if (error || !data) {
    console.log("User not found or database error:", error)
    return null
  }

  console.log("User found, verifying password")
  const isValid = await verifyPassword(password, data.password)
  console.log("Password valid:", isValid)

  if (!isValid) return null

  return {
    user_id: data.user_id,
    username: data.username,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
  }
}

export async function createUser(userData: {
  username: string
  password: string
  email: string
  full_name: string
  role: "student" | "professor" | "faculty"
}): Promise<User | null> {
  const hashedPassword = await hashPassword(userData.password)

  const { data, error } = await supabase
    .from("users")
    .insert({
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
    })
    .select()
    .single()

  if (error || !data) return null

  return {
    user_id: data.user_id,
    username: data.username,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
  }
}

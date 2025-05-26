import { cookies } from "next/headers"
import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from "jose"
import type { User } from "./auth"

const secretKey = process.env.JWT_SECRET || "your-secret-key"
const key = new TextEncoder().encode(secretKey)

interface SessionPayload extends JoseJWTPayload {
  user: User
  expires: Date
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })
  return payload as SessionPayload
}

export async function createSession(user: User) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const session = await encrypt({ user, expires })

  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  })
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null

  try {
    const payload = await decrypt(session)
    return payload.user
  } catch (error) {
    console.error("Session decryption error:", error)
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  })
}

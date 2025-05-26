import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import CoursesContent from "./courses-content"

export default async function CoursesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return <CoursesContent user={session} />
}

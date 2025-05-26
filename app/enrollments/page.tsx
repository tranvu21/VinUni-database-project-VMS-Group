import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import EnrollmentsContent from "./enrollments-content"

export default async function EnrollmentsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (session.role !== "student") {
    redirect("/dashboard")
  }

  return <EnrollmentsContent user={session} />
}

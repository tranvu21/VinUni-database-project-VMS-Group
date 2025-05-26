import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import DashboardContent from "./dashboard-content"

export default async function DashboardPage() {
  const session = await getSession()

  console.log(session)

  if (!session) {
    redirect("/login")
  }

  return <DashboardContent user={session} />
}

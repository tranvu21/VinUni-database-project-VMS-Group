import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import SectionsContent from "./sections-content"

export default async function SectionsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return <SectionsContent user={session} />
}
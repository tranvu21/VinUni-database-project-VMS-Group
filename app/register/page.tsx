import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import RegisterForm from "./register-form"

export default async function RegisterPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create an Account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Register to access the system</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}

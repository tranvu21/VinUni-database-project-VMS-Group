"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import type { User } from "@/lib/auth"

interface Department {
  department_id: number
  name: string
  office_location: string
}

interface CourseCreateFormProps {
  user: User
  departments: Department[]
  professorDepartment: number | null
}

export default function CourseCreateForm({ user, departments, professorDepartment }: CourseCreateFormProps) {
  // const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    credits: 3,
    department_id: professorDepartment || "",
  })

  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCourseData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDepartmentChange = (value: string) => {
    setCourseData((prev) => ({ ...prev, department_id: value }))
  }

  const handleCreditsChange = (value: string) => {
    setCourseData((prev) => ({ ...prev, credits: Number.parseInt(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    // Validate form
    if (!courseData.title || !courseData.description || !courseData.department_id) {
      setError("Please fill in all required course fields")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: courseData,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        // Reset form
        setCourseData({
          title: "",
          description: "",
          credits: 3,
          department_id: professorDepartment || "",
        })
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create course")
      }
    } catch (error) {
      console.error("Course creation error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/courses">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Courses
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit}>
            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">{error}</div>}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
                Course created successfully!{" "}
                <Link href="/courses" className="underline">
                  View all courses
                </Link>
              </div>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="title"
                      name="title"
                      value={courseData.title}
                      onChange={handleCourseChange}
                      placeholder="e.g. Introduction to Computer Science"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={courseData.department_id.toString()}
                      onValueChange={handleDepartmentChange}
                      disabled={user.role === "professor" && professorDepartment !== null}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                      Credits <span className="text-red-500">*</span>
                    </label>
                    <Select value={courseData.credits.toString()} onValueChange={handleCreditsChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select credits" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((credit) => (
                          <SelectItem key={credit} value={credit.toString()}>
                            {credit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={courseData.description}
                    onChange={handleCourseChange}
                    placeholder="Enter course description"
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Link href="/courses">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

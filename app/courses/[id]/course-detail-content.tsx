"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Calendar, Users, Clock } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"

interface Course {
  course_id: number
  title: string
  description: string
  credits: number
  department: string
}

interface Section {
  section_id: number
  semester: string
  year: number
  capacity: number
  registered_count: number
  registration_deadline: string
  professor_id: number
  users: {
    full_name: string
  }
}

interface Professor {
  user_id: number
  full_name: string
}

interface CourseDetailContentProps {
  user: User
  course: Course
}

export default function CourseDetailContent({ user, course }: CourseDetailContentProps) {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>([])
  const [professors, setProfessors] = useState<Professor[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [sectionData, setSectionData] = useState({
    semester: "",
    year: new Date().getFullYear(),
    capacity: 30,
    registration_deadline: "",
    professor_id: "",
  })

  const fetchSections = useCallback(async () => {
    try {
      const response = await fetch(`/api/courses/${course.course_id}/sections`)
      if (!response.ok) {
        throw new Error("Failed to fetch sections")
      }
      const data = await response.json()
      setSections(data.sections)
    } catch (error) {
      console.error("Error fetching sections:", error)
      toast.error("Failed to fetch sections")
    }
  }, [course.course_id])

  useEffect(() => {
    fetchSections()
    if (user.role === "faculty") {
      fetchProfessors()
    }
  }, [fetchSections, user.role])

  const fetchProfessors = async () => {
    try {
      const response = await fetch("/api/professors")
      if (!response.ok) {
        throw new Error("Failed to fetch professors")
      }
      const data = await response.json()
      setProfessors(data.professors)
    } catch (error) {
      console.error("Error fetching professors:", error)
      toast.error("Failed to fetch professors")
    }
  }

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSectionData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sectionData.professor_id) {
      toast.error("Please select a professor")
      return
    }
    setLoading(true)

    try {
      const response = await fetch(`/api/courses/${course.course_id}/sections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: {
            ...sectionData,
            course_id: course.course_id,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create section")
      }

      toast.success("Section created successfully")
      setShowForm(false)
      setSectionData({
        semester: "",
        year: new Date().getFullYear(),
        capacity: 30,
        registration_deadline: "",
        professor_id: "",
      })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create section")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
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
              <h1 className="text-3xl font-bold text-gray-900">Course Details</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <p className="text-gray-500 mt-1">Department: {course.department}</p>
                </div>
                <Badge variant="secondary" className="text-lg">
                  {course.credits} Credits
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg">{course.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sections</CardTitle>
              {user.role === "faculty" && (
                <Button onClick={() => setShowForm(!showForm)} variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {user.role === "faculty" && showForm && (
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="professor">Professor</Label>
                      <Select
                        value={sectionData.professor_id}
                        onValueChange={(value) => setSectionData(prev => ({ ...prev, professor_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select professor" />
                        </SelectTrigger>
                        <SelectContent>
                          {professors.map((professor) => (
                            <SelectItem 
                              key={professor.user_id} 
                              value={professor.user_id.toString()}
                            >
                              {professor.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select
                        value={sectionData.semester}
                        onValueChange={(value) => setSectionData(prev => ({ ...prev, semester: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Spring">Spring</SelectItem>
                          <SelectItem value="Summer">Summer</SelectItem>
                          <SelectItem value="Fall">Fall</SelectItem>
                          <SelectItem value="Winter">Winter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        name="year"
                        type="number"
                        value={sectionData.year}
                        onChange={handleSectionChange}
                        min={new Date().getFullYear()}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        value={sectionData.capacity}
                        onChange={handleSectionChange}
                        min={1}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registration_deadline">Registration Deadline</Label>
                      <Input
                        id="registration_deadline"
                        name="registration_deadline"
                        type="datetime-local"
                        value={sectionData.registration_deadline}
                        onChange={handleSectionChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Section"}
                    </Button>
                  </div>
                </form>
              )}
              <div className="space-y-4">
                {sections.map((section) => (
                  <Link
                    key={section.section_id}
                    href={`/courses/${course.course_id}/sections/${section.section_id}`}
                    className="block rounded-lg border bg-gray-50 px-6 py-4 transition hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {section.semester} {section.year}
                        </h3>
                        <p className="text-sm text-gray-500">Professor: {section.users.full_name}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          {section.registered_count}/{section.capacity} students
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(section.registration_deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {sections.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No sections available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

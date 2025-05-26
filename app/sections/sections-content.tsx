"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, Info, Calendar, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/auth"
import { toast } from "sonner"

interface Section {
  section_id: number
  semester: string
  year: number
  capacity: number
  registered_count: number
  registration_deadline: string
  users: {
    full_name: string
    user_id: number
  }
  courses: {
    course_id: number
    title: string
    credits: number
    departments: {
      name: string
    }
  }
}

interface SectionsContentProps {
  user: User
}

export default function SectionsContent({ user }: SectionsContentProps) {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [enrolledSectionIds, setEnrolledSectionIds] = useState<number[]>([])

  useEffect(() => {
    fetchSections()
    if (user.role === "student") {
      fetchEnrollments()
    }
  }, [user.role])

  const fetchSections = async () => {
    try {
      const response = await fetch("/api/sections")
      if (response.ok) {
        const data = await response.json()
        setSections(data.sections)
      }
    } catch (error) {
      console.error("Error fetching sections:", error)
      toast.error("Failed to fetch sections")
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await fetch("/api/enrollments")
      if (response.ok) {
        const data = await response.json()
        setEnrolledSectionIds(data.enrollments.map((enrollment: { section_id: number }) => enrollment.section_id))
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    }
  }

  const handleEnroll = async (sectionId: number) => {
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ section_id: sectionId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Successfully enrolled in section")
        // Refresh sections and enrollments
        fetchSections()
        fetchEnrollments()
      } else {
        toast.error(data.error || "Failed to enroll")
      }
    } catch (error) {
      console.error("Error enrolling:", error)
      toast.error("Failed to enroll")
    }
  }

  const filteredSections = sections.filter((section) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      section.courses.title.toLowerCase().includes(searchLower) ||
      section.courses.departments.name.toLowerCase().includes(searchLower) ||
      section.users.full_name.toLowerCase().includes(searchLower) ||
      `${section.semester} ${section.year}`.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Section Catalog</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search sections by course, department, professor, or semester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSections.map((section) => {
              const isEnrolled = enrolledSectionIds.includes(section.section_id)
              const isFull = section.registered_count >= section.capacity
              const isPastDeadline = new Date(section.registration_deadline) < new Date()

              return (
                <Card key={section.section_id} className="h-fit">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          {section.courses.title}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Department: {section.courses.departments.name}</p>
                        <p className="text-sm text-gray-500 mt-1">Professor: {section.users.full_name}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="secondary">{section.courses.credits} Credits</Badge>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          {section.registered_count}/{section.capacity}
                        </div>
                        {isFull && <Badge variant="destructive">Full</Badge>}
                        {isEnrolled && <Badge variant="outline">Enrolled</Badge>}
                        {isPastDeadline && <Badge variant="secondary">Registration Closed</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {section.semester} {section.year}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/sections/${section.section_id}`}>
                          <Button variant="outline" size="sm">
                            <Info className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </Link>
                        {user.role === "student" && !isEnrolled && !isFull && !isPastDeadline && (
                          <Button 
                            size="sm"
                            onClick={() => handleEnroll(section.section_id)}
                          >
                            Enroll
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredSections.length === 0 && (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sections found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
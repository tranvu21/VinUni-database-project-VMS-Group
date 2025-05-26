"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, MapPin, BookOpen } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/auth"

interface Enrollment {
  student_id: number
  section_id: number
  enrolled_at: string
  grade: string | null
  sections: {
    section_id: number
    semester: string
    year: number
    courses: {
      title: string
      credits: number
      departments: {
        name: string
      }
    }
    professors: {
      users: {
        full_name: string
      }
    }
    schedules: Array<{
      day_of_week: string
      start_time: string
      end_time: string
      room: string
    }>
  }
}

interface EnrollmentsContentProps {
  user: User
}

export default function EnrollmentsContent({}: EnrollmentsContentProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const response = await fetch("/api/enrollments")
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.enrollments)
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "bg-gray-100 text-gray-800"
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "B":
        return "bg-blue-100 text-blue-800"
      case "C":
        return "bg-yellow-100 text-yellow-800"
      case "D":
        return "bg-orange-100 text-orange-800"
      case "F":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
              <h1 className="text-3xl font-bold text-gray-900">My Enrollments</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments found</h3>
              <p className="mt-1 text-sm text-gray-500">You haven&apos;t enrolled in any courses yet.</p>
              <div className="mt-6">
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.section_id} className="h-fit">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{enrollment.sections.courses.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{enrollment.sections.courses.departments.name}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="secondary">{enrollment.sections.courses.credits} Credits</Badge>
                        {enrollment.grade && (
                          <Badge className={getGradeColor(enrollment.grade)}>Grade: {enrollment.grade}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Semester</p>
                        <p className="text-gray-600">
                          {enrollment.sections.semester} {enrollment.sections.year}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Instructor</p>
                        <p className="text-gray-600">{enrollment.sections.professors.users.full_name}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-700 mb-2">Schedule</p>
                      <div className="space-y-1">
                        {enrollment.sections.schedules.map((schedule, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="mr-4">{schedule.day_of_week}</span>
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="mr-4">
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                            {schedule.room && (
                              <>
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{schedule.room}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Enrolled on: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

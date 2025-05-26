"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen } from "lucide-react"
import type { User } from "@/lib/auth"

interface SectionDetailContentProps {
  user: User
  section: {
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
}

export default function SectionDetailContent({ section }: SectionDetailContentProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Section Detail
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-1">{section.courses.title}</h2>
              <div className="text-gray-500 mb-2">Department: {section.courses.departments.name}</div>
              <Badge variant="secondary">{section.courses.credits} Credits</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium text-gray-700">Semester</div>
                <div>{section.semester} {section.year}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Professor</div>
                <div>{section.users.full_name}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Capacity</div>
                <div>{section.registered_count} / {section.capacity}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Registration Deadline</div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(section.registration_deadline).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 
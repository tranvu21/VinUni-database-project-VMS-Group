"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, BookOpen, Clock, MapPin, Plus, Pencil } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Schedule {
  schedule_id: number
  day_of_week: string
  start_time: string
  end_time: string
  room: string
}

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
    enrollments: {
      enrollment_id: number
      grade: string | null
      users: {
        user_id: number
        full_name: string
        email: string
      }
    }[]
  }
}

interface GradeEditModalProps {
  isOpen: boolean
  onClose: () => void
  studentName: string
  currentGrade: string | null
  onSave: (grade: string | null) => Promise<void>
}

function GradeEditModal({ isOpen, onClose, studentName, currentGrade, onSave }: GradeEditModalProps) {
  const [grade, setGrade] = useState<string>(currentGrade || "NO_GRADE")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const gradeValue = grade === "NO_GRADE" ? null : grade
      if (gradeValue !== null && !["A", "B", "C", "D", "F"].includes(gradeValue)) {
        toast.error("Grade must be A, B, C, D, or F")
        return
      }
      await onSave(gradeValue)
      onClose()
    } catch (error) {
      console.error("Error updating grade:", error)
      toast.error("Failed to update grade")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Grade for {studentName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">Grade</label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO_GRADE">No Grade</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="F">F</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">Select a letter grade or choose No Grade to remove grade</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Grade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function SectionDetailContent({ user, section }: SectionDetailContentProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    day_of_week: "Monday",
    start_time: "",
    end_time: "",
    room: ""
  })
  const [editingGrade, setEditingGrade] = useState<{
    enrollmentId: number
    studentName: string
    currentGrade: string | null
  } | null>(null)

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch(`/api/sections/${section.section_id}/schedules`)
      if (!res.ok) throw new Error("Failed to fetch schedules")
      const data = await res.json()
      setSchedules(data.schedules)
    } catch (e) {
      console.error("Error fetching schedules:", e)
      toast.error("Failed to fetch schedules")
    }
  }, [section.section_id])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setScheduleData(prev => ({ ...prev, [name]: value }))
  }

  const handleDayChange = (value: string) => {
    setScheduleData(prev => ({ ...prev, day_of_week: value }))
  }

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/sections/${section.section_id}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: scheduleData })
      })
      if (!res.ok) throw new Error("Failed to add schedule")
      toast.success("Schedule added!")
      setScheduleData({ day_of_week: "Monday", start_time: "", end_time: "", room: "" })
      fetchSchedules()
    } catch (e) {
      console.error("Error adding schedule:", e)
      toast.error("Failed to add schedule")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateGrade = async (grade: string | null) => {
    if (!editingGrade) return

    try {
      const res = await fetch(`/api/sections/${section.section_id}/enrollments/${editingGrade.enrollmentId}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade })
      })

      if (!res.ok) throw new Error("Failed to update grade")
      
      toast.success("Grade updated successfully")
      // Refresh the page to get updated data
      window.location.reload()
    } catch (error) {
      console.error("Error updating grade:", error)
      toast.error("Failed to update grade")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href={`/courses/${section.courses.course_id}`}>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Course
                </button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Section Details</h1>
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
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <BookOpen className="w-6 h-6" />
                    {section.courses.title}
                  </CardTitle>
                  <p className="text-gray-500 mt-1">Department: {section.courses.departments.name}</p>
                  <p className="text-gray-500 mt-1">Semester: {section.semester} {section.year}</p>
                  <p className="text-gray-500 mt-1">Professor: {section.users.full_name}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant="secondary" className="text-lg">{section.courses.credits} Credits</Badge>
                  <Badge>
                    <Users className="w-4 h-4 mr-1" />
                    {section.registered_count}/{section.capacity} students
                  </Badge>
                  <Badge>
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(section.registration_deadline).toISOString().split('T')[0]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* You can add more section-specific info here if needed */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              {(user.role === "faculty" || user.role === "professor") && (
                <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-1">Day</label>
                    <Select value={scheduleData.day_of_week} onValueChange={handleDayChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <Input type="time" name="start_time" value={scheduleData.start_time} onChange={handleScheduleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <Input type="time" name="end_time" value={scheduleData.end_time} onChange={handleScheduleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Room</label>
                    <Input name="room" value={scheduleData.room} onChange={handleScheduleChange} required />
                  </div>
                  <div>
                    <Button type="submit" disabled={loading} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      {loading ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </form>
              )}
              <div className="space-y-2">
                {schedules.length === 0 && <div className="text-gray-500">No schedules yet.</div>}
                {schedules.map((sch, idx) => (
                  <div key={sch.schedule_id || idx} className="flex items-center gap-4 border rounded px-4 py-2 bg-gray-50">
                    <span className="font-medium">{sch.day_of_week}</span>
                    <Clock className="w-4 h-4 mx-1" />
                    <span>{sch.start_time} - {sch.end_time}</span>
                    <MapPin className="w-4 h-4 mx-1" />
                    <span>{sch.room}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.enrollments.length === 0 ? (
                  <p className="text-gray-500 text-center">No students enrolled yet</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.enrollments.map((enrollment) => (
                      <div key={enrollment.users.user_id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{enrollment.users.full_name}</h3>
                            <p className="text-sm text-gray-500">{enrollment.users.email}</p>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <Badge 
                              variant={
                                enrollment.grade === null ? "secondary" :
                                enrollment.grade === "A" ? "default" :
                                enrollment.grade === "B" ? "default" :
                                enrollment.grade === "C" ? "secondary" :
                                enrollment.grade === "D" ? "destructive" :
                                "destructive"
                              }
                            >
                              {enrollment.grade === null ? "No Grade" : enrollment.grade}
                            </Badge>
                            {(user.role === "faculty" || user.role === "professor") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingGrade({
                                  enrollmentId: enrollment.enrollment_id,
                                  studentName: enrollment.users.full_name,
                                  currentGrade: enrollment.grade
                                })}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {editingGrade && (
            <GradeEditModal
              isOpen={true}
              onClose={() => setEditingGrade(null)}
              studentName={editingGrade.studentName}
              currentGrade={editingGrade.currentGrade}
              onSave={handleUpdateGrade}
            />
          )}
        </div>
      </main>
    </div>
  )
} 
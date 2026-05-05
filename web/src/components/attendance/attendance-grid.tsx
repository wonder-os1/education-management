'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, getStatusColor } from '@/lib/utils'
import type { Student, AttendanceStatus } from '@/types'

interface AttendanceGridProps {
  students: Student[]
  date: string
  existingAttendance: Record<string, AttendanceStatus>
  onSave: (attendance: Record<string, AttendanceStatus>) => void
  saving?: boolean
}

const statusOptions: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: 'PRESENT', label: 'P', color: 'bg-green-500 hover:bg-green-600 text-white' },
  { value: 'ABSENT', label: 'A', color: 'bg-red-500 hover:bg-red-600 text-white' },
  { value: 'LATE', label: 'L', color: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  { value: 'HALF_DAY', label: 'H', color: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { value: 'EXCUSED', label: 'E', color: 'bg-blue-500 hover:bg-blue-600 text-white' },
]

export function AttendanceGrid({ students, date, existingAttendance, onSave, saving }: AttendanceGridProps) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(existingAttendance)

  const toggleStatus = (studentId: string) => {
    const current = attendance[studentId] || 'PRESENT'
    const currentIndex = statusOptions.findIndex((s) => s.value === current)
    const nextIndex = (currentIndex + 1) % statusOptions.length
    setAttendance({ ...attendance, [studentId]: statusOptions[nextIndex].value })
  }

  const markAll = (status: AttendanceStatus) => {
    const bulk: Record<string, AttendanceStatus> = {}
    students.forEach((s) => { bulk[s.id] = status })
    setAttendance(bulk)
  }

  const presentCount = Object.values(attendance).filter((s) => s === 'PRESENT').length
  const absentCount = Object.values(attendance).filter((s) => s === 'ABSENT').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {statusOptions.map((opt) => (
              <div key={opt.value} className="flex items-center gap-1 text-xs">
                <div className={cn('h-4 w-4 rounded', opt.color)} />
                <span>{opt.value.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => markAll('PRESENT')}>
            Mark All Present
          </Button>
          <Button size="sm" variant="outline" onClick={() => markAll('ABSENT')}>
            Mark All Absent
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-[auto_1fr_auto] gap-0">
          <div className="border-b bg-muted px-4 py-3 font-medium text-sm">Roll No</div>
          <div className="border-b bg-muted px-4 py-3 font-medium text-sm">Student Name</div>
          <div className="border-b bg-muted px-4 py-3 font-medium text-sm text-center">Status</div>
          {students.map((student, i) => (
            <>
              <div key={`roll-${student.id}`} className={cn('border-b px-4 py-3 text-sm', i % 2 === 0 ? 'bg-white' : 'bg-muted/30')}>
                {student.rollNo || student.admissionNo}
              </div>
              <div key={`name-${student.id}`} className={cn('border-b px-4 py-3 text-sm font-medium', i % 2 === 0 ? 'bg-white' : 'bg-muted/30')}>
                {student.user?.name || 'Student'}
              </div>
              <div key={`status-${student.id}`} className={cn('border-b px-4 py-3 text-center', i % 2 === 0 ? 'bg-white' : 'bg-muted/30')}>
                <button
                  onClick={() => toggleStatus(student.id)}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-colors',
                    statusOptions.find((s) => s.value === (attendance[student.id] || 'PRESENT'))?.color || 'bg-gray-200'
                  )}
                >
                  {statusOptions.find((s) => s.value === (attendance[student.id] || 'PRESENT'))?.label || 'P'}
                </button>
              </div>
            </>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <span className="text-green-600 font-medium">Present: {presentCount}</span>
          <span className="text-red-600 font-medium">Absent: {absentCount}</span>
          <span className="text-muted-foreground">Total: {students.length}</span>
        </div>
        <Button onClick={() => onSave(attendance)} disabled={saving}>
          {saving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </div>
    </div>
  )
}

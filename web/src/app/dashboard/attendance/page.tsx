'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AttendanceGrid } from '@/components/attendance/attendance-grid'
import { useToast } from '@/hooks/use-toast'
import type { Student, AttendanceStatus } from '@/types'

export default function AttendancePage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [classId, setClassId] = useState('')

  const { data: classes = [] } = useQuery({
    queryKey: ['classes-list'],
    queryFn: async () => { const { data } = await api.get('/classes'); return data.data || [] },
  })

  const { data: students = [], isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ['class-students', classId],
    queryFn: async () => {
      if (!classId) return []
      const { data } = await api.get(`/classes/${classId}/students`)
      return data.data || []
    },
    enabled: !!classId,
  })

  const { data: existingAttendance = {} } = useQuery<Record<string, AttendanceStatus>>({
    queryKey: ['attendance', classId, date],
    queryFn: async () => {
      if (!classId || !date) return {}
      const { data } = await api.get(`/attendance?classId=${classId}&date=${date}`)
      const records = data.data || []
      const map: Record<string, AttendanceStatus> = {}
      records.forEach((r: any) => { map[r.studentId] = r.status })
      return map
    },
    enabled: !!classId && !!date,
  })

  const saveMutation = useMutation({
    mutationFn: (attendance: Record<string, AttendanceStatus>) => {
      const entries = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        classId,
        date,
        status,
      }))
      return api.post('/attendance/bulk', { entries })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast({ title: 'Attendance saved successfully' })
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to save attendance' })
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>

      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Class</label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {(classes as any[]).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.section ? ` - ${c.section}` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!classId ? (
            <p className="text-center py-12 text-muted-foreground">Select a class and date to mark attendance</p>
          ) : loadingStudents ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}</div>
          ) : students.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No students in this class</p>
          ) : (
            <AttendanceGrid
              students={students}
              date={date}
              existingAttendance={existingAttendance}
              onSave={(attendance) => saveMutation.mutate(attendance)}
              saving={saveMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

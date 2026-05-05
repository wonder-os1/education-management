'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { WeeklyGrid } from '@/components/timetable/weekly-grid'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import { getDayName } from '@/lib/utils'
import type { TimetableEntry } from '@/types'

const defaultTimeSlots = ['08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15', '14:00']

export default function TimetablePage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [classId, setClassId] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ subjectId: '', teacherId: '', dayOfWeek: '1', startTime: '08:00', endTime: '08:45', roomNumber: '' })

  const { data: classes = [] } = useQuery({
    queryKey: ['classes-list'],
    queryFn: async () => { const { data } = await api.get('/classes'); return data.data || [] },
  })

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: async () => {
      if (!classId) return []
      const { data } = await api.get(`/subjects?classId=${classId}`)
      return data.data || []
    },
    enabled: !!classId,
  })

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers-list'],
    queryFn: async () => { const { data } = await api.get('/teachers?limit=100'); return data.data || [] },
  })

  const { data: entries = [], isLoading } = useQuery<TimetableEntry[]>({
    queryKey: ['timetable', classId],
    queryFn: async () => {
      if (!classId) return []
      const { data } = await api.get(`/timetable?classId=${classId}`)
      return data.data || []
    },
    enabled: !!classId,
  })

  const addMutation = useMutation({
    mutationFn: (payload: any) => api.post('/timetable', { ...payload, classId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] })
      setShowAdd(false)
      toast({ title: 'Timetable entry added' })
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to add entry' })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timetable</h1>
        {classId && (
          <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Add Entry</Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Select class" /></SelectTrigger>
          <SelectContent>
            {(classes as any[]).map((c: any) => (
              <SelectItem key={c.id} value={c.id}>{c.name}{c.section ? ` - ${c.section}` : ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!classId ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Select a class to view timetable</CardContent></Card>
      ) : isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      ) : (
        <WeeklyGrid entries={entries} timeSlots={defaultTimeSlots} />
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Timetable Entry</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate({ ...form, dayOfWeek: parseInt(form.dayOfWeek) }) }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day *</Label>
                <Select value={form.dayOfWeek} onValueChange={(v) => setForm({ ...form, dayOfWeek: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6].map(d => <SelectItem key={d} value={d.toString()}>{getDayName(d)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {(subjects as any[]).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teacher *</Label>
                <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {(teachers as any[]).map((t: any) => <SelectItem key={t.id} value={t.id}>{t.user?.name || t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Room</Label><Input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>Start Time *</Label><Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required /></div>
              <div className="space-y-2"><Label>End Time *</Label><Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? 'Adding...' : 'Add Entry'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

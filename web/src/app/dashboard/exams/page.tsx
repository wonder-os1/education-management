'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import type { Exam } from '@/types'

export default function ExamsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'UNIT_TEST', classId: '', subjectId: '', date: '', startTime: '09:00', endTime: '12:00', totalMarks: '100', passingMarks: '33' })

  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ['exams'],
    queryFn: async () => { const { data } = await api.get('/exams'); return data.data || [] },
  })

  const { data: classes = [] } = useQuery({ queryKey: ['classes-list'], queryFn: async () => { const { data } = await api.get('/classes'); return data.data || [] } })
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', form.classId],
    queryFn: async () => { if (!form.classId) return []; const { data } = await api.get(`/subjects?classId=${form.classId}`); return data.data || [] },
    enabled: !!form.classId,
  })

  const addMutation = useMutation({
    mutationFn: (payload: any) => api.post('/exams', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
      setShowAdd(false)
      toast({ title: 'Exam scheduled successfully' })
    },
    onError: (err: any) => { toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed' }) },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exams</h1>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Schedule Exam</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Exam Schedule</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}</div>
          ) : exams.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No exams scheduled</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell><Badge variant="secondary">{exam.type.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>{exam.class?.name || '-'}</TableCell>
                    <TableCell>{exam.subject?.name || '-'}</TableCell>
                    <TableCell>{formatDate(exam.date)}</TableCell>
                    <TableCell className="text-sm">{formatTime(exam.startTime)} - {formatTime(exam.endTime)}</TableCell>
                    <TableCell>{exam.totalMarks} (Pass: {exam.passingMarks})</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Schedule Exam</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate({ ...form, totalMarks: parseInt(form.totalMarks), passingMarks: parseInt(form.passingMarks), academicYear: new Date().getFullYear().toString() }) }} className="space-y-4">
            <div className="space-y-2"><Label>Exam Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mid-Term Examination" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNIT_TEST">Unit Test</SelectItem>
                    <SelectItem value="MID_TERM">Mid Term</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                    <SelectItem value="PRACTICE">Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{(classes as any[]).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>{(subjects as any[]).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
              <div className="space-y-2"><Label>End Time</Label><Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
              <div className="space-y-2"><Label>Total Marks *</Label><Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Passing Marks *</Label><Input type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })} required /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? 'Scheduling...' : 'Schedule Exam'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

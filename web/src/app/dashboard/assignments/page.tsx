'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Assignment } from '@/types'

export default function AssignmentsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [classFilter, setClassFilter] = useState('')
  const [form, setForm] = useState({ title: '', description: '', classId: '', subjectId: '', dueDate: '', totalMarks: '100' })

  const { data: classes = [] } = useQuery({ queryKey: ['classes-list'], queryFn: async () => { const { data } = await api.get('/classes'); return data.data || [] } })
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', form.classId || classFilter],
    queryFn: async () => { const cId = form.classId || classFilter; if (!cId) return []; const { data } = await api.get(`/subjects?classId=${cId}`); return data.data || [] },
    enabled: !!(form.classId || classFilter),
  })

  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ['assignments', classFilter],
    queryFn: async () => {
      const params = classFilter ? `?classId=${classFilter}` : ''
      const { data } = await api.get(`/assignments${params}`)
      return data.data || []
    },
  })

  const addMutation = useMutation({
    mutationFn: (payload: any) => api.post('/assignments', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      setShowAdd(false)
      setForm({ title: '', description: '', classId: '', subjectId: '', dueDate: '', totalMarks: '100' })
      toast({ title: 'Assignment created successfully' })
    },
    onError: (err: any) => { toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed' }) },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Create Assignment</Button>
      </div>

      <Card>
        <CardHeader>
          <Select value={classFilter} onValueChange={(v) => setClassFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All Classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {(classes as any[]).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}</div>
          ) : assignments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No assignments found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell><Badge variant="secondary">{a.class?.name || '-'}</Badge></TableCell>
                    <TableCell>{a.subject?.name || '-'}</TableCell>
                    <TableCell>{formatDate(a.dueDate)}</TableCell>
                    <TableCell>{a.submissions?.length || 0} submitted</TableCell>
                    <TableCell>{a.totalMarks || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate({ ...form, totalMarks: form.totalMarks ? parseInt(form.totalMarks) : undefined }) }} className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v, subjectId: '' })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{(classes as any[]).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>{(subjects as any[]).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Due Date *</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? 'Creating...' : 'Create Assignment'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

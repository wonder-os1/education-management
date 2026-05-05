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
import { useToast } from '@/hooks/use-toast'
import { Plus, Users } from 'lucide-react'
import type { Class } from '@/types'

export default function ClassesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', section: '', roomNumber: '', capacity: '40', academicYear: new Date().getFullYear().toString() })

  const { data: classes = [], isLoading } = useQuery<Class[]>({
    queryKey: ['classes'],
    queryFn: async () => { const { data } = await api.get('/classes'); return data.data || [] },
  })

  const addMutation = useMutation({
    mutationFn: (payload: any) => api.post('/classes', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      setShowAdd(false)
      setForm({ name: '', section: '', roomNumber: '', capacity: '40', academicYear: new Date().getFullYear().toString() })
      toast({ title: 'Class created successfully' })
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to create class' })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Classes</h1>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Add Class</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : classes.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No classes created yet</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{cls.name}{cls.section ? ` - ${cls.section}` : ''}</CardTitle>
                  <Badge variant={cls.isActive ? 'default' : 'secondary'}>{cls.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{cls.students?.length || 0} / {cls.capacity} students</span>
                  </div>
                  {cls.roomNumber && <p className="text-muted-foreground">Room: {cls.roomNumber}</p>}
                  {cls.classTeacher && <p className="text-muted-foreground">Class Teacher: {cls.classTeacher.user?.name}</p>}
                  <p className="text-muted-foreground">AY: {cls.academicYear}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Class</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate({ ...form, capacity: parseInt(form.capacity) }) }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Class Name *</Label><Input placeholder="e.g. Class 10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Section</Label><Input placeholder="e.g. A" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
              <div className="space-y-2"><Label>Room Number</Label><Input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Academic Year</Label><Input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? 'Creating...' : 'Create Class'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

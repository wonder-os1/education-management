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
import { Plus, Search } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Student, PaginatedResponse } from '@/types'
import Link from 'next/link'

export default function StudentsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [newStudent, setNewStudent] = useState({ name: '', email: '', phone: '', admissionNo: '', classId: '', gender: '', dateOfBirth: '' })

  const { data, isLoading } = useQuery<PaginatedResponse<Student>>({
    queryKey: ['students', page, search, classFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.set('search', search)
      if (classFilter) params.set('classId', classFilter)
      const { data } = await api.get(`/students?${params}`)
      return data
    },
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['classes-list'],
    queryFn: async () => { const { data } = await api.get('/classes'); return data.data || [] },
  })

  const addMutation = useMutation({
    mutationFn: (payload: typeof newStudent) => api.post('/students', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setShowAdd(false)
      setNewStudent({ name: '', email: '', phone: '', admissionNo: '', classId: '', gender: '', dateOfBirth: '' })
      toast({ title: 'Student added successfully' })
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to add student' })
    },
  })

  const students = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-10"
              />
            </div>
            <Select value={classFilter} onValueChange={(v) => { setClassFilter(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {(classes as any[]).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}</div>
          ) : students.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No students found</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Enrolled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Link href={`/dashboard/students/${student.id}`} className="flex items-center gap-3 hover:underline">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{student.user ? getInitials(student.user.name) : 'S'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{student.user?.name || 'Student'}</p>
                            <p className="text-xs text-muted-foreground">{student.user?.email}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{student.admissionNo}</TableCell>
                      <TableCell><Badge variant="secondary">{student.class?.name || '-'}</Badge></TableCell>
                      <TableCell className="text-sm">{student.gender || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(student.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(newStudent) }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Admission No *</Label>
                <Input value={newStudent.admissionNo} onChange={(e) => setNewStudent({ ...newStudent, admissionNo: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={newStudent.classId} onValueChange={(v) => setNewStudent({ ...newStudent, classId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {(classes as any[]).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={newStudent.gender} onValueChange={(v) => setNewStudent({ ...newStudent, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={newStudent.dateOfBirth} onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? 'Adding...' : 'Add Student'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

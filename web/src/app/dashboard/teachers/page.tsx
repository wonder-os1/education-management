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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search } from 'lucide-react'
import { getInitials, formatDate } from '@/lib/utils'
import type { Teacher, PaginatedResponse } from '@/types'

export default function TeachersPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', employeeId: '', qualification: '', specialization: '' })

  const { data, isLoading } = useQuery<PaginatedResponse<Teacher>>({
    queryKey: ['teachers', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.set('search', search)
      const { data } = await api.get(`/teachers?${params}`)
      return data
    },
  })

  const addMutation = useMutation({
    mutationFn: (payload: typeof form) => api.post('/teachers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      setShowAdd(false)
      setForm({ name: '', email: '', phone: '', employeeId: '', qualification: '', specialization: '' })
      toast({ title: 'Teacher added successfully' })
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to add teacher' })
    },
  })

  const teachers = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Add Teacher</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search teachers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}</div>
          ) : teachers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No teachers found</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{teacher.user ? getInitials(teacher.user.name) : 'T'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{teacher.user?.name || 'Teacher'}</p>
                            <p className="text-xs text-muted-foreground">{teacher.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{teacher.employeeId}</TableCell>
                      <TableCell className="text-sm">{teacher.qualification}</TableCell>
                      <TableCell><Badge variant="secondary">{teacher.specialization || '-'}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(teacher.dateOfJoining)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</p>
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
          <DialogHeader><DialogTitle>Add New Teacher</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form) }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Employee ID *</Label><Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Qualification *</Label><Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? 'Adding...' : 'Add Teacher'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

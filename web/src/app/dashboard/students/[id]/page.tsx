'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatCurrency, getInitials, getStatusColor } from '@/lib/utils'
import type { Student, Attendance, Result, Fee } from '@/types'

export default function StudentDetailPage() {
  const { id } = useParams()

  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ['student', id],
    queryFn: async () => { const { data } = await api.get(`/students/${id}`); return data.data },
  })

  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ['student-attendance', id],
    queryFn: async () => { const { data } = await api.get(`/students/${id}/attendance`); return data.data || [] },
  })

  const { data: results = [] } = useQuery<Result[]>({
    queryKey: ['student-results', id],
    queryFn: async () => { const { data } = await api.get(`/students/${id}/results`); return data.data || [] },
  })

  const { data: fees = [] } = useQuery<Fee[]>({
    queryKey: ['student-fees', id],
    queryFn: async () => { const { data } = await api.get(`/students/${id}/fees`); return data.data || [] },
  })

  if (isLoading || !student) {
    return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">Loading...</div></div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {student.user ? getInitials(student.user.name) : 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{student.user?.name || 'Student'}</h1>
              <p className="text-muted-foreground">{student.user?.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary">Adm: {student.admissionNo}</Badge>
                {student.rollNo && <Badge variant="outline">Roll: {student.rollNo}</Badge>}
                {student.class && <Badge>{student.class.name}</Badge>}
                {student.gender && <span className="text-sm text-muted-foreground">{student.gender}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="info">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader><CardTitle>Attendance History</CardTitle></CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No attendance records</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.slice(0, 30).map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{formatDate(a.date)}</TableCell>
                        <TableCell><Badge className={getStatusColor(a.status)} variant="outline">{a.status}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{a.remarks || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader><CardTitle>Exam Results</CardTitle></CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No results found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.exam?.name || '-'}</TableCell>
                        <TableCell>{r.subject?.name || '-'}</TableCell>
                        <TableCell>{r.marksObtained}{r.exam ? `/${r.exam.totalMarks}` : ''}</TableCell>
                        <TableCell><Badge variant="outline">{r.grade || '-'}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader><CardTitle>Fee Records</CardTitle></CardHeader>
            <CardContent>
              {fees.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No fee records</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.type}</TableCell>
                        <TableCell>{formatCurrency(f.amount)}</TableCell>
                        <TableCell>{formatCurrency(f.paidAmount)}</TableCell>
                        <TableCell>{formatDate(f.dueDate)}</TableCell>
                        <TableCell><Badge className={getStatusColor(f.status)} variant="outline">{f.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader><CardTitle>Student Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Date of Birth', value: student.dateOfBirth ? formatDate(student.dateOfBirth) : '-' },
                  { label: 'Blood Group', value: student.bloodGroup || '-' },
                  { label: 'Address', value: student.address || '-' },
                  { label: 'Phone', value: student.user?.phone || '-' },
                  { label: 'Parent', value: student.parent?.user?.name || '-' },
                  { label: 'Enrolled', value: formatDate(student.createdAt) },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

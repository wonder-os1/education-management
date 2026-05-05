'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ResultEntry } from '@/components/results/result-entry'
import { useToast } from '@/hooks/use-toast'
import { formatDate, getGrade } from '@/lib/utils'
import type { Student, Exam, Result } from '@/types'

export default function ResultsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [examId, setExamId] = useState('')
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')

  const { data: classes = [] } = useQuery({ queryKey: ['classes-list'], queryFn: async () => { const { data } = await api.get('/classes'); return data.data || [] } })
  const { data: exams = [] } = useQuery<Exam[]>({ queryKey: ['exams'], queryFn: async () => { const { data } = await api.get('/exams'); return data.data || [] } })
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: async () => { if (!classId) return []; const { data } = await api.get(`/subjects?classId=${classId}`); return data.data || [] },
    enabled: !!classId,
  })

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['class-students', classId],
    queryFn: async () => { if (!classId) return []; const { data } = await api.get(`/classes/${classId}/students`); return data.data || [] },
    enabled: !!classId,
  })

  const { data: existingResults = {} } = useQuery<Record<string, number>>({
    queryKey: ['results', examId, subjectId],
    queryFn: async () => {
      if (!examId || !subjectId) return {}
      const { data } = await api.get(`/results?examId=${examId}&subjectId=${subjectId}`)
      const records = data.data || []
      const map: Record<string, number> = {}
      records.forEach((r: any) => { map[r.studentId] = r.marksObtained })
      return map
    },
    enabled: !!examId && !!subjectId,
  })

  const { data: allResults = [] } = useQuery<Result[]>({
    queryKey: ['all-results', classId, examId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (classId) params.set('classId', classId)
      if (examId) params.set('examId', examId)
      const { data } = await api.get(`/results?${params}`)
      return data.data || []
    },
    enabled: !!classId || !!examId,
  })

  const saveMutation = useMutation({
    mutationFn: (results: Record<string, number>) => {
      const entries = Object.entries(results).map(([studentId, marksObtained]) => ({
        studentId,
        examId,
        subjectId,
        marksObtained,
      }))
      return api.post('/results/bulk', { entries })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] })
      queryClient.invalidateQueries({ queryKey: ['all-results'] })
      toast({ title: 'Results saved successfully' })
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed to save results' })
    },
  })

  const selectedExam = exams.find((e) => e.id === examId)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Results</h1>

      <Tabs defaultValue="entry">
        <TabsList>
          <TabsTrigger value="entry">Bulk Entry</TabsTrigger>
          <TabsTrigger value="view">View Results</TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          <Card>
            <CardHeader><CardTitle>Enter Results</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Select value={classId} onValueChange={(v) => { setClassId(v); setSubjectId('') }}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{(classes as any[]).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={examId} onValueChange={setExamId}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Select exam" /></SelectTrigger>
                  <SelectContent>{exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>{(subjects as any[]).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {!classId || !examId || !subjectId ? (
                <p className="text-center py-12 text-muted-foreground">Select class, exam, and subject to enter results</p>
              ) : students.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No students in this class</p>
              ) : (
                <ResultEntry
                  students={students}
                  examName={selectedExam?.name || 'Exam'}
                  subjectName={(subjects as any[]).find((s: any) => s.id === subjectId)?.name || 'Subject'}
                  totalMarks={selectedExam?.totalMarks || 100}
                  existingResults={existingResults}
                  onSave={(results) => saveMutation.mutate(results)}
                  saving={saveMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view">
          <Card>
            <CardHeader><CardTitle>View Results</CardTitle></CardHeader>
            <CardContent>
              {allResults.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Select filters above to view results</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allResults.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.student?.user?.name || '-'}</TableCell>
                        <TableCell>{r.exam?.name || '-'}</TableCell>
                        <TableCell>{r.subject?.name || '-'}</TableCell>
                        <TableCell>{r.marksObtained}{r.exam ? `/${r.exam.totalMarks}` : ''}</TableCell>
                        <TableCell><Badge variant="outline">{r.grade || (r.exam ? getGrade(r.marksObtained, r.exam.totalMarks) : '-')}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

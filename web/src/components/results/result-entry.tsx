'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getGrade } from '@/lib/utils'
import type { Student } from '@/types'

interface ResultEntryProps {
  students: Student[]
  examName: string
  subjectName: string
  totalMarks: number
  existingResults: Record<string, number>
  onSave: (results: Record<string, number>) => void
  saving?: boolean
}

export function ResultEntry({
  students,
  examName,
  subjectName,
  totalMarks,
  existingResults,
  onSave,
  saving,
}: ResultEntryProps) {
  const [results, setResults] = useState<Record<string, number>>(existingResults)

  const updateMark = (studentId: string, marks: string) => {
    const num = parseFloat(marks)
    if (!isNaN(num) && num >= 0 && num <= totalMarks) {
      setResults({ ...results, [studentId]: num })
    } else if (marks === '') {
      const updated = { ...results }
      delete updated[studentId]
      setResults(updated)
    }
  }

  const enteredCount = Object.keys(results).length
  const averageMarks = enteredCount > 0
    ? (Object.values(results).reduce((a, b) => a + b, 0) / enteredCount).toFixed(1)
    : '0'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{examName} - {subjectName}</h3>
          <p className="text-sm text-muted-foreground">Total Marks: {totalMarks}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {enteredCount}/{students.length} entered | Avg: {averageMarks}
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-[60px_1fr_100px_60px] gap-0">
          <div className="border-b bg-muted px-3 py-3 font-medium text-xs">Roll</div>
          <div className="border-b bg-muted px-3 py-3 font-medium text-xs">Student Name</div>
          <div className="border-b bg-muted px-3 py-3 font-medium text-xs text-center">Marks (/{totalMarks})</div>
          <div className="border-b bg-muted px-3 py-3 font-medium text-xs text-center">Grade</div>

          {students.map((student) => {
            const marks = results[student.id]
            const grade = marks !== undefined ? getGrade(marks, totalMarks) : '-'
            const gradeColor = grade === 'F' ? 'text-red-600' : grade.startsWith('A') ? 'text-green-600' : 'text-foreground'

            return (
              <>
                <div key={`roll-${student.id}`} className="border-b px-3 py-2 text-sm flex items-center">
                  {student.rollNo || '-'}
                </div>
                <div key={`name-${student.id}`} className="border-b px-3 py-2 text-sm font-medium flex items-center">
                  {student.user?.name || 'Student'}
                </div>
                <div key={`marks-${student.id}`} className="border-b px-3 py-1 flex items-center justify-center">
                  <Input
                    type="number"
                    min={0}
                    max={totalMarks}
                    value={marks ?? ''}
                    onChange={(e) => updateMark(student.id, e.target.value)}
                    className="h-8 w-20 text-center text-sm"
                    placeholder="--"
                  />
                </div>
                <div key={`grade-${student.id}`} className={`border-b px-3 py-2 text-sm font-bold text-center flex items-center justify-center ${gradeColor}`}>
                  {grade}
                </div>
              </>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(results)} disabled={saving || enteredCount === 0}>
          {saving ? 'Saving...' : `Save Results (${enteredCount})`}
        </Button>
      </div>
    </div>
  )
}

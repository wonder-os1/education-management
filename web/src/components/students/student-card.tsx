'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import type { Student } from '@/types'

interface StudentCardProps {
  student: Student
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <Link href={`/dashboard/students/${student.id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm bg-primary/10 text-primary">
                {student.user ? getInitials(student.user.name) : 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{student.user?.name || 'Student'}</p>
              <p className="text-xs text-muted-foreground">
                Adm: {student.admissionNo} {student.rollNo && `| Roll: ${student.rollNo}`}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {student.class && (
                  <Badge variant="secondary" className="text-xs">
                    {student.class.name}
                  </Badge>
                )}
                {student.gender && (
                  <span className="text-xs text-muted-foreground">{student.gender}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

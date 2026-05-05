'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatTime, getDayName } from '@/lib/utils'
import type { TimetableEntry } from '@/types'

interface WeeklyGridProps {
  entries: TimetableEntry[]
  timeSlots: string[]
}

export function WeeklyGrid({ entries, timeSlots }: WeeklyGridProps) {
  const days = [1, 2, 3, 4, 5, 6] // Monday to Saturday

  const getEntry = (day: number, time: string): TimetableEntry | undefined => {
    return entries.find((e) => e.dayOfWeek === day && e.startTime === time)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Timetable</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[120px_repeat(6,1fr)] gap-0">
            {/* Header row */}
            <div className="border-b border-r bg-muted p-3 font-medium text-sm text-center">
              Time
            </div>
            {days.map((day) => (
              <div key={day} className="border-b bg-muted p-3 font-medium text-sm text-center">
                {getDayName(day)}
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((time) => (
              <>
                <div key={`time-${time}`} className="border-b border-r p-3 text-xs text-muted-foreground text-center flex items-center justify-center">
                  {formatTime(time)}
                </div>
                {days.map((day) => {
                  const entry = getEntry(day, time)
                  return (
                    <div
                      key={`${day}-${time}`}
                      className={cn(
                        'border-b p-2 min-h-[60px] text-xs',
                        entry ? 'bg-primary/5' : ''
                      )}
                    >
                      {entry && (
                        <div className="rounded bg-primary/10 p-1.5">
                          <p className="font-medium text-primary truncate">
                            {entry.subject?.name || 'Subject'}
                          </p>
                          <p className="text-muted-foreground truncate">
                            {entry.teacher?.user?.name || 'Teacher'}
                          </p>
                          {entry.roomNumber && (
                            <p className="text-muted-foreground">Room: {entry.roomNumber}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

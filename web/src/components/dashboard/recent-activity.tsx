'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { RecentActivity } from '@/types'

interface RecentActivityProps {
  activities: RecentActivity[]
}

const typeColors: Record<string, string> = {
  ATTENDANCE: 'bg-green-100 text-green-800',
  FEE_PAYMENT: 'bg-blue-100 text-blue-800',
  ASSIGNMENT: 'bg-purple-100 text-purple-800',
  EXAM: 'bg-orange-100 text-orange-800',
  ADMISSION: 'bg-cyan-100 text-cyan-800',
}

export function RecentActivityList({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Link href="/dashboard/reports" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Badge className={typeColors[activity.type] || 'bg-gray-100 text-gray-800'} variant="outline">
                  {activity.type.replace('_', ' ')}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

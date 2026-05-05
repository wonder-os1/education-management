'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentActivityList } from '@/components/dashboard/recent-activity'
import type { DashboardStats } from '@/types'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats')
      return data.data
    },
  })

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <StatsCards stats={stats} />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivityList activities={stats.recentActivity || []} />
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/dashboard/attendance" className="rounded-lg border p-4 text-center hover:bg-muted transition-colors">
              <p className="text-sm font-medium">Mark Attendance</p>
              <p className="text-xs text-muted-foreground">Today&apos;s attendance</p>
            </a>
            <a href="/dashboard/students" className="rounded-lg border p-4 text-center hover:bg-muted transition-colors">
              <p className="text-sm font-medium">Students</p>
              <p className="text-xs text-muted-foreground">View / add</p>
            </a>
            <a href="/dashboard/results" className="rounded-lg border p-4 text-center hover:bg-muted transition-colors">
              <p className="text-sm font-medium">Results</p>
              <p className="text-xs text-muted-foreground">Enter marks</p>
            </a>
            <a href="/dashboard/fees" className="rounded-lg border p-4 text-center hover:bg-muted transition-colors">
              <p className="text-sm font-medium">Fee Collection</p>
              <p className="text-xs text-muted-foreground">Track payments</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

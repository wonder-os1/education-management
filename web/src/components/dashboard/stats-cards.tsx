'use client'

import { Users, UserCheck, IndianRupee, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { DashboardStats } from '@/types'

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      subtitle: `${stats.totalClasses} classes`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: "Today's Attendance",
      value: `${stats.todayAttendanceRate.toFixed(1)}%`,
      subtitle: `${stats.todayPresent} present, ${stats.todayAbsent} absent`,
      icon: UserCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Fee Collection (Month)',
      value: formatCurrency(stats.feeCollectionThisMonth),
      subtitle: `${stats.feeCollectionGrowth >= 0 ? '+' : ''}${stats.feeCollectionGrowth.toFixed(1)}% vs last month`,
      icon: IndianRupee,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Upcoming Exams',
      value: stats.upcomingExams.toString(),
      subtitle: formatCurrency(stats.pendingFees) + ' fees pending',
      icon: Calendar,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.subtitle && (
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

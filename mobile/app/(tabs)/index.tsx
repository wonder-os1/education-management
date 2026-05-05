import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { formatTime } from '@/lib/utils'
import type { DashboardStats } from '@/types'

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: stats, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ['mobile-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats')
      return data.data
    },
  })
  const firstName = user?.name?.split(' ')[0] || 'User'
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>
          Hello, {firstName}
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b', marginTop: 2, textTransform: 'capitalize' }}>
          {user?.role?.toLowerCase()}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
          <StatCard title="Today's Classes" value={String(stats?.todayClasses || 0)} icon="book" color="#0284C7" bg="#f0f9ff" />
          <StatCard title="Attendance" value={(stats?.todayAttendance || 0) + '%'} icon="checkmark-circle" color="#22c55e" bg="#f0fdf4" />
          <StatCard title="Assignments" value={String(stats?.pendingAssignments || 0)} icon="document-text" color="#9333EA" bg="#faf5ff" />
          <StatCard title="Exams" value={String(stats?.upcomingExams || 0)} icon="school" color="#f59e0b" bg="#fffbeb" />
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a', marginTop: 24, marginBottom: 12 }}>
          Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {isTeacher && (
            <QuickAction title="Attendance" icon="checkmark-done" onPress={() => router.push('/attendance' as any)} />
          )}
          <QuickAction title="Assignments" icon="document-text" onPress={() => router.push('/assignment' as any)} />
          <QuickAction title="Results" icon="trophy" onPress={() => router.push('/result' as any)} />
          {!isTeacher && (
            <QuickAction title="Fees" icon="card" onPress={() => router.push('/fee' as any)} />
          )}
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a', marginTop: 24, marginBottom: 12 }}>
          Today's Schedule
        </Text>
        {!stats?.todayTimetable?.length ? (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8' }}>No classes scheduled today</Text>
          </View>
        ) : (
          stats.todayTimetable.slice(0, 5).map((entry) => (
            <View
              key={entry.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#0284C7',
              }}
            >
              <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 15 }}>
                {entry.subject?.name || 'Class'}
              </Text>
              <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
              </Text>
              {entry.room && (
                <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>Room: {entry.room}</Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

function StatCard({ title, value, icon, color, bg }: { title: string; value: string; icon: string; color: string; bg: string }) {
  return (
    <View style={{ width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#64748b' }}>{title}</Text>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name={icon as any} size={16} color={color} />
        </View>
      </View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginTop: 8 }}>{value}</Text>
    </View>
  )
}

function QuickAction({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center' }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name={icon as any} size={20} color="#0284C7" />
      </View>
      <Text style={{ fontSize: 12, fontWeight: '500', color: '#374151', marginTop: 8 }}>{title}</Text>
    </TouchableOpacity>
  )
}

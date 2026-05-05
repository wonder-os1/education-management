import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { formatDate, getAttendancePercentageColor } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import type { AttendanceSummary, Attendance } from '@/types'
import { Stack } from 'expo-router'

export default function AttendanceScreen() {
  const { user } = useAuthStore()
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  const { data, isLoading, refetch } = useQuery<{ summary: AttendanceSummary; recent: Attendance[] }>({
    queryKey: ['my-attendance'],
    queryFn: async () => {
      const { data } = await api.get('/attendance/my')
      return data.data
    },
    enabled: !isTeacher,
  })

  const summary = data?.summary
  const recent = data?.recent || []
  const pctColor = getAttendancePercentageColor(summary?.percentage || 0)

  return (
    <>
      <Stack.Screen options={{ title: 'Attendance' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f8fafc' }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <View style={{ padding: 20 }}>
          {/* Summary card */}
          {summary && (
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <Text style={{ fontWeight: '600', color: '#374151', marginBottom: 16 }}>Attendance Summary</Text>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 40, fontWeight: 'bold', color: pctColor }}>
                  {summary.percentage}%
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13 }}>Overall Attendance</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <StatItem label="Present" value={summary.present} color="#22c55e" />
                <StatItem label="Absent" value={summary.absent} color="#ef4444" />
                <StatItem label="Late" value={summary.late} color="#f59e0b" />
                <StatItem label="Total" value={summary.totalDays} color="#3b82f6" />
              </View>
            </View>
          )}

          {/* Recent records */}
          <Text style={{ fontWeight: '600', color: '#374151', fontSize: 16, marginBottom: 12 }}>Recent Records</Text>
          {recent.length === 0 ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center' }}>
              <Ionicons name="checkmark-done-outline" size={40} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', marginTop: 8 }}>No records found</Text>
            </View>
          ) : (
            recent.map((record) => (
              <View
                key={record.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <StatusDot status={record.status} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontWeight: '500', color: '#0f172a' }}>{formatDate(record.date)}</Text>
                  {record.remarks && (
                    <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{record.remarks}</Text>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color:
                      record.status === 'PRESENT' ? '#22c55e' :
                      record.status === 'ABSENT' ? '#ef4444' :
                      record.status === 'LATE' ? '#f59e0b' : '#8b5cf6',
                  }}
                >
                  {record.status}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  )
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color }}>{value}</Text>
      <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{label}</Text>
    </View>
  )
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'PRESENT' ? '#22c55e' :
    status === 'ABSENT' ? '#ef4444' :
    status === 'LATE' ? '#f59e0b' : '#8b5cf6'
  return <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
}

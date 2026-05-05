import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Assignment } from '@/types'
import { Stack } from 'expo-router'

export default function AssignmentsScreen() {
  const { data: assignments = [], isLoading, refetch } = useQuery<Assignment[]>({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data } = await api.get('/assignments')
      return data.data
    },
  })

  const pending = assignments.filter((a) => a.status === 'ACTIVE' || a.status === 'PENDING')
  const submitted = assignments.filter((a) => a.status === 'SUBMITTED' || a.status === 'GRADED')

  return (
    <>
      <Stack.Screen options={{ title: 'Assignments' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f8fafc' }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <View style={{ padding: 20 }}>
          {/* Pending */}
          <Text style={{ fontWeight: '600', color: '#374151', fontSize: 16, marginBottom: 12 }}>
            Pending ({pending.length})
          </Text>
          {pending.length === 0 ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#94a3b8' }}>No pending assignments</Text>
            </View>
          ) : (
            pending.map((a) => <AssignmentCard key={a.id} assignment={a} />)
          )}

          {/* Submitted/Graded */}
          {submitted.length > 0 && (
            <>
              <Text style={{ fontWeight: '600', color: '#374151', fontSize: 16, marginTop: 8, marginBottom: 12 }}>
                Submitted ({submitted.length})
              </Text>
              {submitted.map((a) => <AssignmentCard key={a.id} assignment={a} />)}
            </>
          )}
        </View>
      </ScrollView>
    </>
  )
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'GRADED'

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: isOverdue ? '#ef4444' : '#9333EA',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 15 }}>{assignment.title}</Text>
          <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
            {assignment.subject?.name || 'Subject'}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getStatusColor(isOverdue ? 'OVERDUE' : assignment.status) + '15',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: getStatusColor(isOverdue ? 'OVERDUE' : assignment.status),
            }}
          >
            {isOverdue ? 'OVERDUE' : assignment.status}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
          <Text style={{ fontSize: 12, color: '#94a3b8' }}>Due: {formatDate(assignment.dueDate)}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="star-outline" size={14} color="#94a3b8" />
          <Text style={{ fontSize: 12, color: '#94a3b8' }}>{assignment.totalMarks} marks</Text>
        </View>
      </View>
    </View>
  )
}

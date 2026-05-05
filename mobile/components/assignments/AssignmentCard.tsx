import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Assignment } from '@/types'

interface AssignmentCardProps {
  assignment: Assignment
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const router = useRouter()
  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'GRADED'
  const displayStatus = isOverdue ? 'OVERDUE' : assignment.status
  const statusColor = getStatusColor(displayStatus)

  return (
    <TouchableOpacity
      onPress={() => router.push(`/assignment/${assignment.id}`)}
      style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="document-text-outline" size={20} color="#0284C7" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 15 }}>{assignment.title}</Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
          {assignment.subject?.name || 'Subject'} | Due: {formatDate(assignment.dueDate)}
        </Text>
        <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>Marks: {assignment.totalMarks}</Text>
      </View>
      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: statusColor + '20' }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: statusColor }}>{displayStatus.replace(/_/g, ' ')}</Text>
      </View>
    </TouchableOpacity>
  )
}

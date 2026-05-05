import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getStatusColor } from '@/lib/utils'

interface AttendanceCardProps {
  studentName: string
  rollNumber?: string
  status: string
  date: string
  onPress?: () => void
}

export function AttendanceCard({ studentName, rollNumber, status, date, onPress }: AttendanceCardProps) {
  const statusColor = getStatusColor(status)

  const statusIcon: Record<string, string> = {
    PRESENT: 'checkmark-circle',
    ABSENT: 'close-circle',
    LATE: 'time',
    EXCUSED: 'information-circle',
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: statusColor + '20',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Ionicons name={(statusIcon[status] || 'help-circle') as any} size={22} color={statusColor} />
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 15 }}>
          {studentName}
        </Text>
        {rollNumber && (
          <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            Roll: {rollNumber}
          </Text>
        )}
        <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
          {date}
        </Text>
      </View>

      <View style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: statusColor + '20',
      }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: statusColor, textTransform: 'uppercase' }}>
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

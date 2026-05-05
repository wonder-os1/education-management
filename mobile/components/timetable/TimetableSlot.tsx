import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatTime } from '@/lib/utils'

interface TimetableSlotProps {
  subject: string
  teacher?: string
  startTime: string
  endTime: string
  room?: string
  isCurrentSlot?: boolean
  onPress?: () => void
}

export function TimetableSlot({ subject, teacher, startTime, endTime, room, isCurrentSlot, onPress }: TimetableSlotProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        backgroundColor: isCurrentSlot ? '#f0f9ff' : '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: isCurrentSlot ? '#0284C7' : '#e2e8f0',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 15 }}>{subject}</Text>
          {teacher && (
            <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{teacher}</Text>
          )}
        </View>
        {isCurrentSlot && (
          <View style={{ backgroundColor: '#0284C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>NOW</Text>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', marginTop: 10, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="time-outline" size={14} color="#94a3b8" />
          <Text style={{ fontSize: 13, color: '#64748b' }}>
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
        </View>
        {room && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="location-outline" size={14} color="#94a3b8" />
            <Text style={{ fontSize: 13, color: '#64748b' }}>{room}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

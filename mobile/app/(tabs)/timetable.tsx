import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { formatTime, getDayName } from '@/lib/utils'
import type { TimetableEntry } from '@/types'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function TimetableScreen() {
  const todayIndex = new Date().getDay()
  const [selectedDay, setSelectedDay] = useState(todayIndex === 0 ? 1 : todayIndex)

  const { data: timetable = [], isLoading, refetch } = useQuery<TimetableEntry[]>({
    queryKey: ['timetable', selectedDay],
    queryFn: async () => {
      const { data } = await api.get(`/timetable?day=${selectedDay}`)
      return data.data
    },
  })

  const sorted = [...timetable].sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <View style={{ padding: 20 }}>
        {/* Day selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {DAYS.map((day, idx) => {
              const dayNum = idx + 1
              const isActive = selectedDay === dayNum
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(dayNum)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: isActive ? '#0284C7' : '#fff',
                    borderWidth: isActive ? 0 : 1,
                    borderColor: '#e2e8f0',
                  }}
                >
                  <Text style={{ fontWeight: '600', color: isActive ? '#fff' : '#64748b', fontSize: 14 }}>
                    {day}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>

        {/* Timetable entries */}
        {sorted.length === 0 ? (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
            <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 15 }}>
              No classes on {getDayName(selectedDay)}
            </Text>
          </View>
        ) : (
          sorted.map((entry, i) => (
            <View
              key={entry.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 4,
                  height: '100%',
                  backgroundColor: i % 2 === 0 ? '#0284C7' : '#9333EA',
                  borderRadius: 2,
                  marginRight: 12,
                  minHeight: 50,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 16 }}>
                  {entry.subject?.name || 'Class'}
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                  {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                </Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                  {entry.teacher && (
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                      {entry.teacher.user?.name || 'Teacher'}
                    </Text>
                  )}
                  {entry.room && (
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>Room: {entry.room}</Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

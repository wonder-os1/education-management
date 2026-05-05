import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Notification } from '@/types'

export default function UpdatesScreen() {
  const queryClient = useQueryClient()
  const { data: notifications = [], isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications')
      return data.data
    },
  })

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getIcon = (type: string): string => {
    switch (type) {
      case 'ASSIGNMENT': return 'document-text'
      case 'EXAM': return 'school'
      case 'ATTENDANCE': return 'checkmark-circle'
      case 'FEE': return 'card'
      case 'RESULT': return 'trophy'
      default: return 'notifications'
    }
  }

  const getColor = (type: string): string => {
    switch (type) {
      case 'ASSIGNMENT': return '#9333EA'
      case 'EXAM': return '#f59e0b'
      case 'ATTENDANCE': return '#22c55e'
      case 'FEE': return '#ef4444'
      case 'RESULT': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <View style={{ padding: 20 }}>
        {unreadCount > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={() => markAllRead.mutate()}>
              <Text style={{ color: '#0284C7', fontWeight: '600', fontSize: 14 }}>Mark all read</Text>
            </TouchableOpacity>
          </View>
        )}

        {notifications.length === 0 ? (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, alignItems: 'center' }}>
            <Ionicons name="notifications-off-outline" size={48} color="#cbd5e1" />
            <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 15 }}>No notifications yet</Text>
          </View>
        ) : (
          notifications.map((n) => (
            <TouchableOpacity
              key={n.id}
              onPress={() => !n.isRead && markRead.mutate(n.id)}
              style={{
                backgroundColor: n.isRead ? '#fff' : '#f0f9ff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'flex-start',
                borderLeftWidth: n.isRead ? 0 : 3,
                borderLeftColor: '#0284C7',
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: getColor(n.type) + '15',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                  marginTop: 2,
                }}
              >
                <Ionicons name={getIcon(n.type) as any} size={18} color={getColor(n.type)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: n.isRead ? '500' : '600', color: '#0f172a', fontSize: 14 }}>
                  {n.title}
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{n.message}</Text>
                <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>{formatDate(n.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  )
}

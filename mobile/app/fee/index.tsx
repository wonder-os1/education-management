import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import type { Fee } from '@/types'
import { Stack } from 'expo-router'

export default function FeesScreen() {
  const { data: fees = [], isLoading, refetch } = useQuery<Fee[]>({
    queryKey: ['my-fees'],
    queryFn: async () => {
      const { data } = await api.get('/fees/my')
      return data.data
    },
  })

  const unpaid = fees.filter((f) => f.status !== 'PAID')
  const paid = fees.filter((f) => f.status === 'PAID')
  const totalDue = unpaid.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0)

  return (
    <>
      <Stack.Screen options={{ title: 'Fees' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f8fafc' }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <View style={{ padding: 20 }}>
          {/* Due summary */}
          {unpaid.length > 0 && (
            <View style={{ backgroundColor: '#fef2f2', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#fecaca' }}>
              <Text style={{ color: '#991b1b', fontWeight: '600', fontSize: 14 }}>Total Due</Text>
              <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 28, marginTop: 4 }}>
                {formatCurrency(totalDue)}
              </Text>
              <Text style={{ color: '#b91c1c', fontSize: 12, marginTop: 4 }}>
                {unpaid.length} pending payment{unpaid.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Unpaid fees */}
          {unpaid.length > 0 && (
            <>
              <Text style={{ fontWeight: '600', color: '#374151', fontSize: 16, marginBottom: 12 }}>
                Pending Payments
              </Text>
              {unpaid.map((fee) => <FeeCard key={fee.id} fee={fee} />)}
            </>
          )}

          {/* Paid fees */}
          <Text style={{ fontWeight: '600', color: '#374151', fontSize: 16, marginTop: unpaid.length > 0 ? 12 : 0, marginBottom: 12 }}>
            Payment History
          </Text>
          {paid.length === 0 ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={40} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', marginTop: 8 }}>No payment history</Text>
            </View>
          ) : (
            paid.map((fee) => <FeeCard key={fee.id} fee={fee} />)
          )}
        </View>
      </ScrollView>
    </>
  )
}

function FeeCard({ fee }: { fee: Fee }) {
  const isOverdue = fee.status !== 'PAID' && new Date(fee.dueDate) < new Date()
  const statusLabel = isOverdue ? 'OVERDUE' : fee.status
  const statusColor = getStatusColor(statusLabel)

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: statusColor,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 15 }}>{fee.type}</Text>
          <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
            Due: {formatDate(fee.dueDate)}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: statusColor + '15',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', color: statusColor }}>{statusLabel}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <View>
          <Text style={{ fontSize: 11, color: '#94a3b8' }}>Amount</Text>
          <Text style={{ fontWeight: '600', color: '#0f172a' }}>{formatCurrency(fee.amount)}</Text>
        </View>
        {fee.status === 'PARTIAL' && (
          <View>
            <Text style={{ fontSize: 11, color: '#94a3b8' }}>Paid</Text>
            <Text style={{ fontWeight: '600', color: '#22c55e' }}>{formatCurrency(fee.paidAmount)}</Text>
          </View>
        )}
        {fee.status !== 'PAID' && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: '#94a3b8' }}>Balance</Text>
            <Text style={{ fontWeight: '600', color: '#ef4444' }}>
              {formatCurrency(fee.amount - fee.paidAmount)}
            </Text>
          </View>
        )}
        {fee.paidAt && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: '#94a3b8' }}>Paid on</Text>
            <Text style={{ fontWeight: '500', color: '#374151' }}>{formatDate(fee.paidAt)}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

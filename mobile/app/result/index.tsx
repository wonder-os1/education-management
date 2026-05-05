import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { getStatusColor } from '@/lib/utils'
import type { ExamResult } from '@/types'
import { Stack } from 'expo-router'

export default function ResultsScreen() {
  const { data: results = [], isLoading, refetch } = useQuery<ExamResult[]>({
    queryKey: ['my-results'],
    queryFn: async () => {
      const { data } = await api.get('/results/my')
      return data.data
    },
  })

  return (
    <>
      <Stack.Screen options={{ title: 'Results' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f8fafc' }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <View style={{ padding: 20 }}>
          {results.length === 0 ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, alignItems: 'center' }}>
              <Ionicons name="trophy-outline" size={48} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 15 }}>No results published yet</Text>
            </View>
          ) : (
            results.map((result) => (
              <View
                key={result.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 15 }}>
                      {result.exam?.name || 'Exam'}
                    </Text>
                    <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                      {result.exam?.subject?.name || 'Subject'}
                    </Text>
                  </View>
                  {result.grade && (
                    <View
                      style={{
                        backgroundColor: getStatusColor(result.grade === 'F' ? 'FAIL' : 'PASS') + '15',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 14,
                          color: getStatusColor(result.grade === 'F' ? 'FAIL' : 'PASS'),
                        }}
                      >
                        {result.grade}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0284C7' }}>
                      {result.marksObtained}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Obtained</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: '#e2e8f0' }} />
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#374151' }}>
                      {result.exam?.totalMarks || '-'}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Total</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: '#e2e8f0' }} />
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#374151' }}>
                      {result.exam?.totalMarks
                        ? Math.round((result.marksObtained / result.exam.totalMarks) * 100)
                        : '-'}%
                    </Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Percentage</Text>
                  </View>
                </View>

                {result.remarks && (
                  <Text style={{ color: '#64748b', fontSize: 13, marginTop: 10, fontStyle: 'italic' }}>
                    {result.remarks}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  )
}

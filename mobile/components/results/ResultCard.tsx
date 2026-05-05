import { View, Text, TouchableOpacity } from 'react-native'
import { getStatusColor } from '@/lib/utils'

interface ResultCardProps {
  examName: string
  subject?: string
  marksObtained: number
  totalMarks: number
  grade?: string
  onPress?: () => void
}

export function ResultCard({ examName, subject, marksObtained, totalMarks, grade, onPress }: ResultCardProps) {
  const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0
  const status = percentage >= 80 ? 'DISTINCTION' : percentage >= 40 ? 'PASS' : 'FAIL'
  const statusColor = getStatusColor(status)

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}
      style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 15 }}>{examName}</Text>
          {subject && <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{subject}</Text>}
        </View>
        {grade && (
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: statusColor + '20' }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: statusColor }}>{grade}</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 }}>
        <View style={{ flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 3 }}>
          <View style={{ width: `${Math.min(percentage, 100)}%`, height: 6, backgroundColor: statusColor, borderRadius: 3 }} />
        </View>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{marksObtained}/{totalMarks}</Text>
      </View>
    </TouchableOpacity>
  )
}

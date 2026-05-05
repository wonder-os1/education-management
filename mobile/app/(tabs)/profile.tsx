import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/stores/auth-store'
import { getInitials } from '@/lib/utils'

export default function ProfileScreen() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login') } },
    ])
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 20 }}>
        {/* Profile header */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#0284C7',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
              {getInitials(user?.name || 'U')}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a' }}>{user?.name}</Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>{user?.email}</Text>
          <View
            style={{
              backgroundColor: '#f0f9ff',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              marginTop: 8,
            }}
          >
            <Text style={{ color: '#0284C7', fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
              {user?.role?.toLowerCase()}
            </Text>
          </View>
        </View>

        {/* Student/Teacher details */}
        {user?.student && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontWeight: '600', color: '#374151', marginBottom: 12 }}>Student Details</Text>
            {user.student.rollNumber && <ProfileRow icon="id-card-outline" label="Roll Number" value={user.student.rollNumber} />}
            {user.student.class && <ProfileRow icon="school-outline" label="Class" value={user.student.class.name} />}
            {user.student.gender && <ProfileRow icon="person-outline" label="Gender" value={user.student.gender} />}
            {user.student.bloodGroup && <ProfileRow icon="water-outline" label="Blood Group" value={user.student.bloodGroup} />}
          </View>
        )}

        {user?.teacher && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontWeight: '600', color: '#374151', marginBottom: 12 }}>Teacher Details</Text>
            {user.teacher.department && <ProfileRow icon="business-outline" label="Department" value={user.teacher.department} />}
            {user.teacher.qualification && <ProfileRow icon="school-outline" label="Qualification" value={user.teacher.qualification} />}
            {user.teacher.employeeId && <ProfileRow icon="id-card-outline" label="Employee ID" value={user.teacher.employeeId} />}
          </View>
        )}

        {/* Menu items */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
          <MenuButton icon="notifications-outline" label="Notifications" onPress={() => {}} />
          <MenuButton icon="settings-outline" label="Settings" onPress={() => {}} />
          <MenuButton
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Alert.alert('Help & Support', 'For support, email support@wonderos.in')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={{ marginLeft: 12, fontWeight: '500', color: '#ef4444' }}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 12, marginTop: 24 }}>
          Powered by Wonder OS
        </Text>
      </View>
    </ScrollView>
  )
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
      <Ionicons name={icon as any} size={18} color="#94a3b8" style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: '#94a3b8' }}>{label}</Text>
        <Text style={{ fontWeight: '500', color: '#0f172a', marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  )
}

function MenuButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
      }}
    >
      <Ionicons name={icon as any} size={20} color="#374151" />
      <Text style={{ flex: 1, marginLeft: 12, fontWeight: '500', color: '#374151' }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
  )
}

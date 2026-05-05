import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { signup } from '@/lib/auth'
import { useAuthStore } from '@/stores/auth-store'

const ROLES = [
  { key: 'STUDENT', label: 'Student' },
  { key: 'TEACHER', label: 'Teacher' },
  { key: 'PARENT', label: 'Parent' },
]

export default function SignupScreen() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const user = await signup({ name, email, password, role })
      setUser(user)
      router.replace('/(tabs)')
    } catch (err: any) {
      Alert.alert('Signup Failed', err.response?.data?.message || 'Could not create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#0284C7', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>E</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>Create Account</Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Join EduConnect Academy</Text>
        </View>
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>Full Name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Enter your name"
              style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, backgroundColor: '#fff' }} />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="you@school.edu" keyboardType="email-address" autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, backgroundColor: '#fff' }} />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>Password</Text>
            <TextInput value={password} onChangeText={setPassword} placeholder="Create a password" secureTextEntry
              style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, backgroundColor: '#fff' }} />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>I am a</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {ROLES.map((r) => (
                <TouchableOpacity key={r.key} onPress={() => setRole(r.key)}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
                    backgroundColor: role === r.key ? '#0284C7' : '#fff',
                    borderWidth: 1, borderColor: role === r.key ? '#0284C7' : '#d1d5db' }}>
                  <Text style={{ fontWeight: '500', color: role === r.key ? '#fff' : '#374151' }}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity onPress={handleSignup} disabled={loading}
            style={{ backgroundColor: loading ? '#7dd3fc' : '#0284C7', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Create Account</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ alignItems: 'center', marginTop: 8 }}>
            <Text style={{ color: '#0284C7', fontSize: 14 }}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

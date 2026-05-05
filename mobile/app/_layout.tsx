import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60000, retry: 1 } },
})

export default function RootLayout() {
  const { loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="attendance/index" options={{ headerShown: true, title: 'Attendance' }} />
        <Stack.Screen name="attendance/mark" options={{ headerShown: true, title: 'Mark Attendance' }} />
        <Stack.Screen name="attendance/[studentId]" options={{ headerShown: true, title: 'Student Attendance' }} />
        <Stack.Screen name="assignment/index" options={{ headerShown: true, title: 'Assignments' }} />
        <Stack.Screen name="assignment/[id]" options={{ headerShown: true, title: 'Assignment Details' }} />
        <Stack.Screen name="assignment/submit" options={{ headerShown: true, title: 'Submit Assignment' }} />
        <Stack.Screen name="exam/index" options={{ headerShown: true, title: 'Exams' }} />
        <Stack.Screen name="exam/[id]" options={{ headerShown: true, title: 'Exam Details' }} />
        <Stack.Screen name="result/index" options={{ headerShown: true, title: 'Results' }} />
        <Stack.Screen name="result/report-card" options={{ headerShown: true, title: 'Report Card' }} />
        <Stack.Screen name="fee/index" options={{ headerShown: true, title: 'Fee Status' }} />
        <Stack.Screen name="fee/pay" options={{ headerShown: true, title: 'Pay Fee' }} />
        <Stack.Screen name="student/[id]" options={{ headerShown: true, title: 'Student Profile' }} />
        <Stack.Screen name="class/[id]" options={{ headerShown: true, title: 'Class Details' }} />
        <Stack.Screen name="library/index" options={{ headerShown: true, title: 'Library' }} />
        <Stack.Screen name="settings/index" options={{ headerShown: true, title: 'Settings' }} />
      </Stack>
    </QueryClientProvider>
  )
}

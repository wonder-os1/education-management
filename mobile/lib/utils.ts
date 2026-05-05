export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount / 100)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PRESENT: '#22c55e',
    ABSENT: '#ef4444',
    LATE: '#f59e0b',
    EXCUSED: '#8b5cf6',
    SUBMITTED: '#3b82f6',
    GRADED: '#22c55e',
    PENDING: '#eab308',
    OVERDUE: '#ef4444',
    PAID: '#22c55e',
    UNPAID: '#ef4444',
    PARTIAL: '#f59e0b',
    SCHEDULED: '#3b82f6',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444',
    PASS: '#22c55e',
    FAIL: '#ef4444',
    DISTINCTION: '#8b5cf6',
  }
  return colors[status] || '#6b7280'
}

export function getAttendancePercentageColor(pct: number): string {
  if (pct >= 90) return '#22c55e'
  if (pct >= 75) return '#f59e0b'
  return '#ef4444'
}

export function getDayName(dayIndex: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[dayIndex] || ''
}

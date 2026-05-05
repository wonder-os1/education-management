/** Shared types used across web, api, and mobile layers */

export interface Course {
  id: string
  name: string
  description: string
  subjectId: string
  teacherId: string
  teacherName: string
  duration: number // hours
  fee: number
  maxStudents: number
  enrolledCount: number
  isActive: boolean
  imageUrl?: string
}

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  parentName?: string
  parentPhone?: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  enrollmentDate: string
  classId?: string
  batchId?: string
  status: 'active' | 'inactive' | 'graduated' | 'dropped'
}

export interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  subjects: string[]
  qualification: string
  joinDate: string
  isActive: boolean
}

export interface ClassBatch {
  id: string
  name: string
  courseId: string
  teacherId: string
  schedule: WeeklySchedule
  startDate: string
  endDate: string
  maxStudents: number
  enrolledCount: number
  status: 'upcoming' | 'active' | 'completed'
}

export interface WeeklySchedule {
  [day: string]: { start: string; end: string; active: boolean }
}

export interface Exam {
  id: string
  name: string
  courseId: string
  batchId?: string
  date: string
  startTime: string
  duration: number // minutes
  totalMarks: number
  passingMarks: number
  type: 'quiz' | 'midterm' | 'final' | 'assignment' | 'practical'
  status: 'upcoming' | 'ongoing' | 'completed' | 'graded'
}

export interface Result {
  id: string
  examId: string
  studentId: string
  marksObtained: number
  grade?: string
  remarks?: string
  publishedAt?: string
}

export interface Attendance {
  id: string
  studentId: string
  classId: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
}

export interface Fee {
  id: string
  studentId: string
  type: 'tuition' | 'exam' | 'library' | 'lab' | 'transport' | 'other'
  amount: number
  dueDate: string
  paidAt?: string
  status: 'pending' | 'paid' | 'overdue' | 'waived'
  receiptNumber?: string
}

export interface Assignment {
  id: string
  courseId: string
  batchId?: string
  title: string
  description: string
  dueDate: string
  totalMarks: number
  attachmentUrl?: string
  status: 'active' | 'closed' | 'graded'
}

export interface FeatureFlags {
  courseManagement: boolean
  studentPortal: boolean
  batchManagement: boolean
  feeManagement: boolean
  onlineTests: boolean
  liveClasses: boolean
  parentPortal: boolean
}

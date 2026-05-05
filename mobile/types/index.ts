export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  teacher?: Teacher
  student?: Student
  parent?: Parent
}

export interface Teacher {
  id: string
  userId: string
  employeeId?: string
  department?: string
  subjects?: string[]
  qualification?: string
  user?: User
  classes?: ClassInfo[]
  createdAt: string
}

export interface Student {
  id: string
  userId: string
  rollNumber?: string
  admissionNumber?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  address?: string
  classId?: string
  sectionId?: string
  class?: ClassInfo
  user?: User
  parent?: Parent
  createdAt: string
}

export interface Parent {
  id: string
  userId: string
  occupation?: string
  relation?: string
  user?: User
  children?: Student[]
  createdAt: string
}

export interface ClassInfo {
  id: string
  name: string
  section?: string
  grade?: string
  classTeacherId?: string
  classTeacher?: Teacher
  students?: Student[]
}

export interface Subject {
  id: string
  name: string
  code?: string
  classId?: string
  teacherId?: string
  teacher?: Teacher
}

export interface TimetableEntry {
  id: string
  classId: string
  subjectId: string
  teacherId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room?: string
  subject?: Subject
  teacher?: Teacher
  class?: ClassInfo
}

export interface Attendance {
  id: string
  studentId: string
  classId: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  remarks?: string
  markedBy?: string
  student?: Student
  createdAt: string
}

export interface AttendanceSummary {
  totalDays: number
  present: number
  absent: number
  late: number
  excused: number
  percentage: number
}

export interface Assignment {
  id: string
  title: string
  description?: string
  subjectId: string
  classId: string
  teacherId: string
  dueDate: string
  totalMarks: number
  attachments?: string[]
  status: string
  subject?: Subject
  teacher?: Teacher
  class?: ClassInfo
  submissions?: Submission[]
  createdAt: string
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  content?: string
  attachments?: string[]
  submittedAt: string
  marks?: number
  feedback?: string
  status: 'SUBMITTED' | 'GRADED' | 'LATE'
  student?: Student
}

export interface Exam {
  id: string
  name: string
  type: string
  classId: string
  subjectId?: string
  date: string
  startTime: string
  endTime: string
  totalMarks: number
  room?: string
  status: string
  subject?: Subject
  class?: ClassInfo
  createdAt: string
}

export interface ExamResult {
  id: string
  examId: string
  studentId: string
  marksObtained: number
  grade?: string
  remarks?: string
  exam?: Exam
  student?: Student
}

export interface ReportCard {
  studentId: string
  student?: Student
  class?: ClassInfo
  term: string
  results: ExamResult[]
  attendance: AttendanceSummary
  totalMarks: number
  obtainedMarks: number
  percentage: number
  grade: string
  rank?: number
}

export interface Fee {
  id: string
  studentId: string
  type: string
  amount: number
  dueDate: string
  paidAmount: number
  status: 'PAID' | 'UNPAID' | 'PARTIAL'
  paidAt?: string
  student?: Student
  createdAt: string
}

export interface LibraryBook {
  id: string
  title: string
  author: string
  isbn?: string
  category?: string
  totalCopies: number
  availableCopies: number
  coverImage?: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  todayAttendance: number
  todayClasses: number
  pendingAssignments: number
  upcomingExams: number
  recentNotifications: Notification[]
  todayTimetable: TimetableEntry[]
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export type UserRole = 'ADMIN' | 'TEACHER' | 'STAFF' | 'PARENT' | 'STUDENT'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  avatarUrl?: string
  lastLoginAt?: string
  student?: Student
  teacher?: Teacher
  parent?: Parent
}

export interface Student {
  id: string
  userId: string
  admissionNo: string
  rollNo?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  address?: string
  classId?: string
  sectionId?: string
  parentId?: string
  user?: User
  class?: Class
  parent?: Parent
  createdAt: string
}

export interface Teacher {
  id: string
  userId: string
  employeeId: string
  qualification: string
  specialization?: string
  dateOfJoining: string
  salary?: number
  departmentId?: string
  isClassTeacher: boolean
  classTeacherOfId?: string
  user?: User
  department?: Department
  subjects?: Subject[]
  createdAt: string
}

export interface Parent {
  id: string
  userId: string
  occupation?: string
  annualIncome?: string
  address?: string
  user?: User
  children?: Student[]
  createdAt: string
}

export interface Class {
  id: string
  name: string
  section?: string
  roomNumber?: string
  capacity: number
  classTeacherId?: string
  academicYear: string
  classTeacher?: Teacher
  students?: Student[]
  isActive: boolean
}

export interface Section {
  id: string
  name: string
  classId: string
  class?: Class
}

export interface Department {
  id: string
  name: string
  headTeacherId?: string
  description?: string
  isActive: boolean
}

export interface Subject {
  id: string
  name: string
  code: string
  classId?: string
  teacherId?: string
  departmentId?: string
  type: 'CORE' | 'ELECTIVE' | 'EXTRA_CURRICULAR'
  class?: Class
  teacher?: Teacher
}

export interface Attendance {
  id: string
  studentId: string
  classId: string
  date: string
  status: AttendanceStatus
  remarks?: string
  markedById: string
  student?: Student
  class?: Class
  markedBy?: User
  createdAt: string
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED'

export interface TimetableEntry {
  id: string
  classId: string
  subjectId: string
  teacherId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  roomNumber?: string
  class?: Class
  subject?: Subject
  teacher?: Teacher
}

export interface Exam {
  id: string
  name: string
  type: 'UNIT_TEST' | 'MID_TERM' | 'FINAL' | 'PRACTICE'
  classId?: string
  subjectId?: string
  date: string
  startTime: string
  endTime: string
  totalMarks: number
  passingMarks: number
  academicYear: string
  class?: Class
  subject?: Subject
  createdAt: string
}

export interface Result {
  id: string
  studentId: string
  examId: string
  subjectId: string
  marksObtained: number
  grade?: string
  remarks?: string
  student?: Student
  exam?: Exam
  subject?: Subject
  createdAt: string
}

export interface Assignment {
  id: string
  title: string
  description?: string
  classId: string
  subjectId: string
  teacherId: string
  dueDate: string
  totalMarks?: number
  attachmentUrl?: string
  class?: Class
  subject?: Subject
  teacher?: Teacher
  submissions?: Submission[]
  createdAt: string
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  submittedAt: string
  content?: string
  attachmentUrl?: string
  marksObtained?: number
  feedback?: string
  status: 'SUBMITTED' | 'GRADED' | 'LATE' | 'MISSING'
  student?: Student
  assignment?: Assignment
}

export interface Fee {
  id: string
  studentId: string
  type: 'TUITION' | 'TRANSPORT' | 'LIBRARY' | 'LAB' | 'EXAM' | 'OTHER'
  amount: number
  dueDate: string
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL'
  paidAmount: number
  paidDate?: string
  academicYear: string
  term: string
  student?: Student
  payments?: FeePayment[]
  createdAt: string
}

export interface FeePayment {
  id: string
  feeId: string
  amount: number
  method: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE'
  transactionId?: string
  receiptNo?: string
  paidAt: string
  fee?: Fee
}

export interface OnlineClass {
  id: string
  title: string
  classId: string
  subjectId: string
  teacherId: string
  scheduledAt: string
  duration: number
  meetingUrl?: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  class?: Class
  subject?: Subject
  teacher?: Teacher
}

export interface LibraryBook {
  id: string
  title: string
  author: string
  isbn?: string
  category: string
  publisher?: string
  quantity: number
  availableQuantity: number
  shelfNumber?: string
  isActive: boolean
  createdAt: string
}

export interface BookIssue {
  id: string
  bookId: string
  studentId: string
  issuedDate: string
  dueDate: string
  returnedDate?: string
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'LOST'
  fine?: number
  book?: LibraryBook
  student?: Student
}

export interface TransportRoute {
  id: string
  name: string
  vehicleNumber: string
  driverName: string
  driverPhone: string
  stops: TransportStop[]
  capacity: number
  assignedStudents: number
  isActive: boolean
}

export interface TransportStop {
  id: string
  routeId: string
  name: string
  pickupTime: string
  dropTime: string
  order: number
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  todayAttendanceRate: number
  todayPresent: number
  todayAbsent: number
  totalClasses: number
  pendingFees: number
  upcomingExams: number
  feeCollectionThisMonth: number
  feeCollectionGrowth: number
  recentActivity: RecentActivity[]
}

export interface RecentActivity {
  id: string
  type: 'ATTENDANCE' | 'FEE_PAYMENT' | 'ASSIGNMENT' | 'EXAM' | 'ADMISSION'
  title: string
  description: string
  timestamp: string
  user?: User
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

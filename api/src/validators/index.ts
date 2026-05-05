import { z } from 'zod'

// ---- Auth ----
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().optional(),
  role: z.enum(['TEACHER', 'STUDENT', 'PARENT']).default('STUDENT'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// ---- Student ----
export const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  rollNumber: z.string().optional(),
  class: z.string().min(1),
  section: z.string().optional(),
  dateOfBirth: z.string().optional(),
  parentId: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
})

export const updateStudentSchema = createStudentSchema.partial()

// ---- Teacher ----
export const createTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  subjects: z.array(z.string()).default([]),
  qualification: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  salary: z.number().int().min(0).optional(),
})

export const updateTeacherSchema = createTeacherSchema.partial()

// ---- Class ----
export const createClassSchema = z.object({
  name: z.string().min(1),
  section: z.string().min(1),
  teacherId: z.string().optional(),
  academicYear: z.string().default('2024-2025'),
  room: z.string().optional(),
})

export const updateClassSchema = createClassSchema.partial()

// ---- Subject ----
export const createSubjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  classId: z.string(),
  teacherId: z.string().optional(),
  credits: z.number().int().min(0).optional(),
})

export const updateSubjectSchema = createSubjectSchema.partial()

// ---- Attendance ----
export const markAttendanceSchema = z.object({
  classId: z.string(),
  date: z.string(),
  records: z.array(z.object({
    studentId: z.string(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  })).min(1),
})

// ---- Timetable ----
export const createTimetableSchema = z.object({
  classId: z.string(),
  subjectId: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string().optional(),
})

export const updateTimetableSchema = createTimetableSchema.partial()

// ---- Exam ----
export const createExamSchema = z.object({
  name: z.string().min(1),
  subjectId: z.string(),
  classId: z.string(),
  date: z.string(),
  totalMarks: z.number().int().min(1),
  passingMarks: z.number().int().min(0),
  type: z.enum(['UNIT_TEST', 'MID_TERM', 'FINAL', 'QUIZ']).default('UNIT_TEST'),
})

export const updateExamSchema = createExamSchema.partial()

// ---- Result ----
export const enterResultsSchema = z.object({
  examId: z.string(),
  results: z.array(z.object({
    studentId: z.string(),
    marksObtained: z.number().int().min(0),
    remarks: z.string().optional(),
  })).min(1),
})

export const updateResultSchema = z.object({
  marksObtained: z.number().int().min(0).optional(),
  grade: z.string().optional(),
  remarks: z.string().optional(),
})

// ---- Assignment ----
export const createAssignmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subjectId: z.string(),
  classId: z.string(),
  dueDate: z.string(),
  totalMarks: z.number().int().min(0).optional(),
  attachmentUrl: z.string().optional(),
})

export const updateAssignmentSchema = createAssignmentSchema.partial()

// ---- Submission ----
export const createSubmissionSchema = z.object({
  assignmentId: z.string(),
  content: z.string().optional(),
  attachmentUrl: z.string().optional(),
})

export const gradeSubmissionSchema = z.object({
  marks: z.number().int().min(0),
  feedback: z.string().optional(),
})

// ---- Fee ----
export const createFeeSchema = z.object({
  studentId: z.string(),
  amount: z.number().int().min(0),
  dueDate: z.string(),
  type: z.enum(['TUITION', 'EXAM', 'TRANSPORT', 'LIBRARY', 'OTHER']).default('TUITION'),
})

export const payFeeSchema = z.object({
  feeId: z.string(),
  method: z.enum(['razorpay', 'cash', 'card', 'upi']).default('razorpay'),
})

// ---- Online Class ----
export const createOnlineClassSchema = z.object({
  title: z.string().min(1),
  subjectId: z.string(),
  classId: z.string(),
  scheduledAt: z.string(),
  duration: z.number().int().min(1),
  meetingUrl: z.string().optional(),
})

export const updateOnlineClassSchema = z.object({
  title: z.string().optional(),
  scheduledAt: z.string().optional(),
  duration: z.number().int().min(1).optional(),
  meetingUrl: z.string().optional(),
  recordingUrl: z.string().optional(),
  status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']).optional(),
})

// ---- Library ----
export const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().optional(),
  category: z.string().min(1),
  totalCopies: z.number().int().min(1).default(1),
})

export const updateBookSchema = createBookSchema.partial()

export const issueBookSchema = z.object({
  bookId: z.string(),
  studentId: z.string(),
  dueDate: z.string(),
})

// ---- Transport ----
export const createTransportSchema = z.object({
  routeName: z.string().min(1),
  vehicleNumber: z.string().min(1),
  driverName: z.string().min(1),
  driverPhone: z.string().min(1),
  stops: z.array(z.object({
    name: z.string(),
    time: z.string(),
  })),
})

export const updateTransportSchema = createTransportSchema.partial()

export const assignTransportSchema = z.object({
  studentId: z.string(),
  transportId: z.string(),
  stopName: z.string(),
  type: z.enum(['PICKUP', 'DROP', 'BOTH']).default('BOTH'),
})

// ---- Notification ----
export const createNotificationSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['ATTENDANCE', 'EXAM', 'FEE', 'ASSIGNMENT', 'GENERAL']).default('GENERAL'),
})

// ---- Settings ----
export const updateSettingSchema = z.object({
  key: z.string(),
  value: z.any(),
})

// ---- Pagination ----
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

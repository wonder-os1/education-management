import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { errorHandler } from './middleware/error-handler'
import { authRoutes } from './routes/auth.routes'
import { studentRoutes } from './routes/student.routes'
import { teacherRoutes } from './routes/teacher.routes'
import { classRoutes } from './routes/class.routes'
import { subjectRoutes } from './routes/subject.routes'
import { attendanceRoutes } from './routes/attendance.routes'
import { timetableRoutes } from './routes/timetable.routes'
import { examRoutes } from './routes/exam.routes'
import { resultRoutes } from './routes/result.routes'
import { assignmentRoutes } from './routes/assignment.routes'
import { feeRoutes } from './routes/fee.routes'
import { onlineClassRoutes } from './routes/online-class.routes'
import { libraryRoutes } from './routes/library.routes'
import { transportRoutes } from './routes/transport.routes'
import { dashboardRoutes } from './routes/dashboard.routes'
import { notificationRoutes } from './routes/notification.routes'
import { settingsRoutes } from './routes/settings.routes'
import { healthRoutes } from './routes/health.routes'
import { parentRoutes } from './routes/parent.routes'
import publicRoutes from './routes/public.routes'

const app = express()

// Security
app.use(helmet())
app.use(cors({
  origin: env.APP_URL,
  credentials: true,
}))

// Parsing
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/timetable', timetableRoutes)
app.use('/api/exams', examRoutes)
app.use('/api/results', resultRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/fees', feeRoutes)
app.use('/api/online-classes', onlineClassRoutes)
app.use('/api/library', libraryRoutes)
app.use('/api/transport', transportRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/parents', parentRoutes)
import { publicLimiter } from './middleware/rate-limiter'
app.use('/api/public', publicLimiter, publicRoutes)

// Error handler (must be last)
app.use(errorHandler)

export { app }

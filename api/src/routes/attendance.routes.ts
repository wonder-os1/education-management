import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireTeacher } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { markAttendanceSchema, paginationSchema } from '../validators'

const router = Router()

// POST /api/attendance/mark — Bulk mark attendance
router.post('/mark', authenticate, requireTeacher, validate(markAttendanceSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { classId, date, records } = req.body
    const attendanceDate = new Date(date)

    // Get teacher id
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
    if (!teacher && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Teacher profile not found' })
    }

    const markedById = teacher?.id || req.user!.userId

    const results = await prisma.$transaction(
      records.map((record: { studentId: string; status: string }) =>
        prisma.attendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: record.studentId,
              classId,
              date: attendanceDate,
            },
          },
          update: {
            status: record.status as any,
            markedById,
          },
          create: {
            studentId: record.studentId,
            classId,
            date: attendanceDate,
            status: record.status as any,
            markedById,
          },
        })
      )
    )

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'MARK_ATTENDANCE', entity: 'attendance', entityId: classId, metadata: { date, count: records.length } },
    })

    res.json({ success: true, data: { marked: results.length, records: results } })
  } catch (error) {
    next(error)
  }
})

// GET /api/attendance — Get attendance records with filters
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { classId, studentId, date, startDate, endDate, status } = req.query as Record<string, string>

    const where: any = {}
    if (classId) where.classId = classId
    if (studentId) where.studentId = studentId
    if (date) where.date = new Date(date)
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) }
    }
    if (status) where.status = status

    // Students can only view their own attendance
    if (req.user!.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
      if (student) where.studentId = student.id
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          student: { include: { user: { select: { name: true } } } },
          class: { select: { name: true, section: true } },
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ])

    res.json({
      success: true,
      data: attendances,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/attendance/report — Attendance report for a class
router.get('/report', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    const { classId, startDate, endDate } = req.query as Record<string, string>

    if (!classId) {
      return res.status(400).json({ success: false, error: 'classId is required' })
    }

    const cls = await prisma.class.findUnique({ where: { id: classId } })
    if (!cls) {
      return res.status(404).json({ success: false, error: 'Class not found' })
    }

    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.date = { gte: new Date(startDate), lte: new Date(endDate) }
    }

    const students = await prisma.student.findMany({
      where: { class: cls.name, section: cls.section },
      include: { user: { select: { name: true } } },
    })

    const report = await Promise.all(
      students.map(async (student) => {
        const [total, present, absent, late, excused] = await Promise.all([
          prisma.attendance.count({ where: { studentId: student.id, classId, ...dateFilter } }),
          prisma.attendance.count({ where: { studentId: student.id, classId, status: 'PRESENT', ...dateFilter } }),
          prisma.attendance.count({ where: { studentId: student.id, classId, status: 'ABSENT', ...dateFilter } }),
          prisma.attendance.count({ where: { studentId: student.id, classId, status: 'LATE', ...dateFilter } }),
          prisma.attendance.count({ where: { studentId: student.id, classId, status: 'EXCUSED', ...dateFilter } }),
        ])

        const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0

        return {
          studentId: student.id,
          studentName: student.user.name,
          rollNumber: student.rollNumber,
          total,
          present,
          absent,
          late,
          excused,
          percentage,
        }
      })
    )

    res.json({ success: true, data: report })
  } catch (error) {
    next(error)
  }
})

// GET /api/attendance/student/:studentId — Student attendance history
router.get('/student/:studentId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.studentId } })
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' })
    }

    // Students can only view their own attendance
    if (req.user!.role === 'STUDENT' && student.userId !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    const { page, limit } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit

    const [attendances, total, stats] = await Promise.all([
      prisma.attendance.findMany({
        where: { studentId: req.params.studentId },
        include: { class: { select: { name: true, section: true } } },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where: { studentId: req.params.studentId } }),
      Promise.all([
        prisma.attendance.count({ where: { studentId: req.params.studentId, status: 'PRESENT' } }),
        prisma.attendance.count({ where: { studentId: req.params.studentId, status: 'ABSENT' } }),
        prisma.attendance.count({ where: { studentId: req.params.studentId, status: 'LATE' } }),
        prisma.attendance.count({ where: { studentId: req.params.studentId, status: 'EXCUSED' } }),
      ]),
    ])

    const totalRecords = stats[0] + stats[1] + stats[2] + stats[3]
    const percentage = totalRecords > 0 ? Math.round(((stats[0] + stats[2]) / totalRecords) * 100) : 0

    res.json({
      success: true,
      data: attendances,
      stats: { present: stats[0], absent: stats[1], late: stats[2], excused: stats[3], percentage },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

export { router as attendanceRoutes }

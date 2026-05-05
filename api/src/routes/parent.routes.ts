import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireFeature } from '../middleware/feature-gate'
import { paginationSchema } from '../validators'

const router = Router()
router.use(requireFeature('parentPortal'))

// GET /api/parents/children — Get parent's children
router.get('/children', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== 'PARENT' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: req.user!.userId },
      include: {
        children: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
          },
        },
      },
    })

    if (!parent) {
      return res.status(404).json({ success: false, error: 'Parent profile not found' })
    }

    res.json({ success: true, data: parent.children })
  } catch (error) {
    next(error)
  }
})

// GET /api/parents/children/:studentId/attendance — View child's attendance
router.get('/children/:studentId/attendance', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== 'PARENT' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    // Verify parent owns this student
    if (req.user!.role === 'PARENT') {
      const parent = await prisma.parent.findUnique({
        where: { userId: req.user!.userId },
        include: { children: { select: { id: true } } },
      })
      const childIds = parent?.children.map((c) => c.id) || []
      if (!childIds.includes(req.params.studentId)) {
        return res.status(403).json({ success: false, error: 'Access denied' })
      }
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
      ]),
    ])

    const totalRecords = stats[0] + stats[1] + stats[2]
    const percentage = totalRecords > 0 ? Math.round(((stats[0] + stats[2]) / totalRecords) * 100) : 0

    res.json({
      success: true,
      data: attendances,
      stats: { present: stats[0], absent: stats[1], late: stats[2], percentage },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/parents/children/:studentId/results — View child's results
router.get('/children/:studentId/results', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== 'PARENT' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    // Verify parent owns this student
    if (req.user!.role === 'PARENT') {
      const parent = await prisma.parent.findUnique({
        where: { userId: req.user!.userId },
        include: { children: { select: { id: true } } },
      })
      const childIds = parent?.children.map((c) => c.id) || []
      if (!childIds.includes(req.params.studentId)) {
        return res.status(403).json({ success: false, error: 'Access denied' })
      }
    }

    const results = await prisma.result.findMany({
      where: { studentId: req.params.studentId },
      include: {
        exam: {
          include: {
            subject: { select: { name: true, code: true } },
            class: { select: { name: true, section: true } },
          },
        },
      },
      orderBy: { exam: { date: 'desc' } },
    })

    // Calculate overall
    const totalMarks = results.reduce((sum, r) => sum + r.exam.totalMarks, 0)
    const totalObtained = results.reduce((sum, r) => sum + r.marksObtained, 0)
    const overallPercentage = totalMarks > 0 ? Math.round((totalObtained / totalMarks) * 100) : 0

    res.json({
      success: true,
      data: {
        results,
        overall: { totalMarks, totalObtained, percentage: overallPercentage, totalExams: results.length },
      },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/parents/children/:studentId/fees — View child's fees
router.get('/children/:studentId/fees', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== 'PARENT' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    // Verify parent owns this student
    if (req.user!.role === 'PARENT') {
      const parent = await prisma.parent.findUnique({
        where: { userId: req.user!.userId },
        include: { children: { select: { id: true } } },
      })
      const childIds = parent?.children.map((c) => c.id) || []
      if (!childIds.includes(req.params.studentId)) {
        return res.status(403).json({ success: false, error: 'Access denied' })
      }
    }

    const { page, limit } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit

    const [fees, total, summary] = await Promise.all([
      prisma.fee.findMany({
        where: { studentId: req.params.studentId },
        skip,
        take: limit,
        orderBy: { dueDate: 'desc' },
      }),
      prisma.fee.count({ where: { studentId: req.params.studentId } }),
      Promise.all([
        prisma.fee.aggregate({ where: { studentId: req.params.studentId, status: 'PAID' }, _sum: { amount: true } }),
        prisma.fee.aggregate({ where: { studentId: req.params.studentId, status: { in: ['PENDING', 'OVERDUE'] } }, _sum: { amount: true } }),
      ]),
    ])

    res.json({
      success: true,
      data: fees,
      summary: {
        totalPaid: summary[0]._sum.amount || 0,
        totalPending: summary[1]._sum.amount || 0,
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/parents/children/:studentId/timetable — View child's timetable
router.get('/children/:studentId/timetable', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user!.role !== 'PARENT' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    const student = await prisma.student.findUnique({ where: { id: req.params.studentId } })
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' })
    }

    // Find the class for this student
    const cls = await prisma.class.findFirst({
      where: { name: student.class, section: student.section || '' },
    })

    if (!cls) {
      return res.json({ success: true, data: [] })
    }

    const timetable = await prisma.timetable.findMany({
      where: { classId: cls.id },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    res.json({ success: true, data: timetable })
  } catch (error) {
    next(error)
  }
})

export { router as parentRoutes }

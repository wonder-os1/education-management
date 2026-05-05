import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireTeacher } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { enterResultsSchema, updateResultSchema, paginationSchema } from '../validators'
import { env } from '../config/env'

const router = Router()

// Grade calculation based on percentage
function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C+'
  if (percentage >= 40) return 'C'
  if (percentage >= env.BUSINESS_PASSING_PERCENTAGE) return 'D'
  return 'F'
}

// POST /api/results/enter — Bulk enter results
router.post('/enter', authenticate, requireTeacher, validate(enterResultsSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { examId, results: resultEntries } = req.body

    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' })
    }

    const results = await prisma.$transaction(
      resultEntries.map((entry: { studentId: string; marksObtained: number; remarks?: string }) => {
        const percentage = Math.round((entry.marksObtained / exam.totalMarks) * 100)
        const grade = calculateGrade(percentage)

        return prisma.result.upsert({
          where: {
            examId_studentId: {
              examId,
              studentId: entry.studentId,
            },
          },
          update: {
            marksObtained: entry.marksObtained,
            grade,
            remarks: entry.remarks,
          },
          create: {
            examId,
            studentId: entry.studentId,
            marksObtained: entry.marksObtained,
            grade,
            remarks: entry.remarks,
          },
        })
      })
    )

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'ENTER_RESULTS', entity: 'result', entityId: examId, metadata: { count: results.length } },
    })

    res.json({ success: true, data: { entered: results.length, results } })
  } catch (error) {
    next(error)
  }
})

// GET /api/results — Get results with filters
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { examId, studentId, classId } = req.query as Record<string, string>

    const where: any = {}
    if (examId) where.examId = examId
    if (studentId) where.studentId = studentId
    if (classId) where.exam = { classId }

    // Students can only view their own results
    if (req.user!.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
      if (student) where.studentId = student.id
    }

    const [results, total] = await Promise.all([
      prisma.result.findMany({
        where,
        include: {
          exam: { include: { subject: { select: { name: true, code: true } }, class: { select: { name: true, section: true } } } },
          student: { include: { user: { select: { name: true } } } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.result.count({ where }),
    ])

    res.json({
      success: true,
      data: results,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/results/report-card/:studentId — Student report card
router.get('/report-card/:studentId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.studentId },
      include: { user: { select: { name: true, email: true } } },
    })

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' })
    }

    // Students can only view their own report card
    if (req.user!.role === 'STUDENT' && student.userId !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    const results = await prisma.result.findMany({
      where: { studentId: req.params.studentId },
      include: {
        exam: {
          include: {
            subject: { select: { name: true, code: true, credits: true } },
            class: { select: { name: true, section: true } },
          },
        },
      },
      orderBy: { exam: { date: 'desc' } },
    })

    // Group results by subject
    const subjectResults: Record<string, any> = {}
    results.forEach((r) => {
      const subjectName = r.exam.subject.name
      if (!subjectResults[subjectName]) {
        subjectResults[subjectName] = {
          subject: r.exam.subject,
          exams: [],
        }
      }
      subjectResults[subjectName].exams.push({
        examName: r.exam.name,
        type: r.exam.type,
        totalMarks: r.exam.totalMarks,
        marksObtained: r.marksObtained,
        grade: r.grade,
        percentage: Math.round((r.marksObtained / r.exam.totalMarks) * 100),
        date: r.exam.date,
      })
    })

    // Calculate overall
    const totalMarks = results.reduce((sum, r) => sum + r.exam.totalMarks, 0)
    const totalObtained = results.reduce((sum, r) => sum + r.marksObtained, 0)
    const overallPercentage = totalMarks > 0 ? Math.round((totalObtained / totalMarks) * 100) : 0
    const overallGrade = calculateGrade(overallPercentage)

    res.json({
      success: true,
      data: {
        student: { name: student.user.name, rollNumber: student.rollNumber, class: student.class, section: student.section },
        subjects: Object.values(subjectResults),
        overall: {
          totalMarks,
          totalObtained,
          percentage: overallPercentage,
          grade: overallGrade,
          totalExams: results.length,
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/results/:id
router.patch('/:id', authenticate, requireTeacher, validate(updateResultSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.result.findUnique({
      where: { id: req.params.id },
      include: { exam: true },
    })

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Result not found' })
    }

    const marksObtained = req.body.marksObtained ?? existing.marksObtained
    const percentage = Math.round((marksObtained / existing.exam.totalMarks) * 100)
    const grade = req.body.grade || calculateGrade(percentage)

    const result = await prisma.result.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.marksObtained !== undefined && { marksObtained: req.body.marksObtained }),
        grade,
        ...(req.body.remarks !== undefined && { remarks: req.body.remarks }),
      },
      include: {
        exam: { include: { subject: { select: { name: true } } } },
        student: { include: { user: { select: { name: true } } } },
      },
    })

    res.json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
})

export { router as resultRoutes }

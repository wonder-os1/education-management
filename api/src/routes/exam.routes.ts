import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireTeacher } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { createExamSchema, updateExamSchema, paginationSchema } from '../validators'

const router = Router()

// GET /api/exams
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { classId, subjectId, type } = req.query as Record<string, string>

    const where: any = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {}

    if (classId) where.classId = classId
    if (subjectId) where.subjectId = subjectId
    if (type) where.type = type

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        include: {
          subject: { select: { name: true, code: true } },
          class: { select: { name: true, section: true } },
          _count: { select: { results: true } },
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.exam.count({ where }),
    ])

    res.json({
      success: true,
      data: exams,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/exams/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: req.params.id },
      include: {
        subject: true,
        class: true,
        results: {
          include: { student: { include: { user: { select: { name: true } } } } },
          orderBy: { marksObtained: 'desc' },
        },
      },
    })

    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' })
    }

    res.json({ success: true, data: exam })
  } catch (error) {
    next(error)
  }
})

// POST /api/exams
router.post('/', authenticate, requireTeacher, validate(createExamSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = { ...req.body, date: new Date(req.body.date) }

    const exam = await prisma.exam.create({
      data,
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, section: true } },
      },
    })

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'CREATE', entity: 'exam', entityId: exam.id },
    })

    res.status(201).json({ success: true, data: exam })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/exams/:id
router.patch('/:id', authenticate, requireTeacher, validate(updateExamSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const data: any = { ...req.body }
    if (data.date) data.date = new Date(data.date)

    const exam = await prisma.exam.update({
      where: { id: req.params.id },
      data,
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, section: true } },
      },
    })

    res.json({ success: true, data: exam })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/exams/:id
router.delete('/:id', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.exam.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Exam deleted' })
  } catch (error) {
    next(error)
  }
})

// GET /api/exams/upcoming — Upcoming exams
router.get('/schedule/upcoming', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const exams = await prisma.exam.findMany({
      where: { date: { gte: new Date() } },
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, section: true } },
      },
      orderBy: { date: 'asc' },
      take: 20,
    })

    res.json({ success: true, data: exams })
  } catch (error) {
    next(error)
  }
})

export { router as examRoutes }

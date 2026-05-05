import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireAdmin, requireTeacher } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { createSubjectSchema, updateSubjectSchema, paginationSchema } from '../validators'

const router = Router()

// GET /api/subjects
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { classId } = req.query as Record<string, string>

    const where: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    if (classId) where.classId = classId

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        include: {
          class: { select: { name: true, section: true } },
          teacher: { include: { user: { select: { name: true } } } },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.subject.count({ where }),
    ])

    res.json({
      success: true,
      data: subjects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/subjects/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id },
      include: {
        class: true,
        teacher: { include: { user: { select: { name: true, email: true } } } },
        exams: { orderBy: { date: 'desc' }, take: 10 },
        assignments: { orderBy: { dueDate: 'desc' }, take: 10 },
      },
    })

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' })
    }

    res.json({ success: true, data: subject })
  } catch (error) {
    next(error)
  }
})

// POST /api/subjects
router.post('/', authenticate, requireAdmin, validate(createSubjectSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const subject = await prisma.subject.create({
      data: req.body,
      include: {
        class: { select: { name: true, section: true } },
        teacher: { include: { user: { select: { name: true } } } },
      },
    })

    res.status(201).json({ success: true, data: subject })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/subjects/:id
router.patch('/:id', authenticate, requireAdmin, validate(updateSubjectSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        class: { select: { name: true, section: true } },
        teacher: { include: { user: { select: { name: true } } } },
      },
    })

    res.json({ success: true, data: subject })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/subjects/:id
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Subject deleted' })
  } catch (error) {
    next(error)
  }
})

export { router as subjectRoutes }

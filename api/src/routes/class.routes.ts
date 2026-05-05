import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireAdmin, requireTeacher } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { createClassSchema, updateClassSchema, paginationSchema } from '../validators'

const router = Router()

// GET /api/classes
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { academicYear } = req.query as Record<string, string>

    const where: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { section: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    if (academicYear) where.academicYear = academicYear

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          teacher: { include: { user: { select: { name: true } } } },
          _count: { select: { subjects: true, attendances: true, exams: true } },
        },
        skip,
        take: limit,
        orderBy: [{ name: 'asc' }, { section: 'asc' }],
      }),
      prisma.class.count({ where }),
    ])

    res.json({
      success: true,
      data: classes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/classes/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const cls = await prisma.class.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: { include: { user: { select: { name: true, email: true } } } },
        subjects: { include: { teacher: { include: { user: { select: { name: true } } } } } },
        timetables: { include: { subject: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
      },
    })

    if (!cls) {
      return res.status(404).json({ success: false, error: 'Class not found' })
    }

    // Get students in this class
    const students = await prisma.student.findMany({
      where: { class: cls.name, section: cls.section },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { rollNumber: 'asc' },
    })

    res.json({ success: true, data: { ...cls, students } })
  } catch (error) {
    next(error)
  }
})

// POST /api/classes
router.post('/', authenticate, requireAdmin, validate(createClassSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const cls = await prisma.class.create({
      data: req.body,
      include: {
        teacher: { include: { user: { select: { name: true } } } },
      },
    })

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'CREATE', entity: 'class', entityId: cls.id },
    })

    res.status(201).json({ success: true, data: cls })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/classes/:id
router.patch('/:id', authenticate, requireAdmin, validate(updateClassSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const cls = await prisma.class.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        teacher: { include: { user: { select: { name: true } } } },
      },
    })

    res.json({ success: true, data: cls })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/classes/:id
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.class.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Class deleted' })
  } catch (error) {
    next(error)
  }
})

export { router as classRoutes }

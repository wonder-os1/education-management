import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireAdmin } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { hashPassword } from '../utils/password'
import { createTeacherSchema, updateTeacherSchema, paginationSchema } from '../validators'

const router = Router()

// GET /api/teachers
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' as const } } },
            { department: { contains: search, mode: 'insensitive' as const } },
            { employeeId: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
          classes: { select: { id: true, name: true, section: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacher.count({ where }),
    ])

    res.json({
      success: true,
      data: teachers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/teachers/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        classes: true,
        subjectsTaught: { include: { class: true } },
      },
    })

    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' })
    }

    res.json({ success: true, data: teacher })
  } catch (error) {
    next(error)
  }
})

// POST /api/teachers
router.post('/', authenticate, requireAdmin, validate(createTeacherSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, email, phone, password, ...teacherData } = req.body

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: await hashPassword(password || 'Teacher@123'),
          role: 'TEACHER',
        },
      })

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId: teacherData.employeeId,
          department: teacherData.department,
          subjects: teacherData.subjects || [],
          qualification: teacherData.qualification,
          experience: teacherData.experience,
          salary: teacherData.salary,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      })

      await tx.auditLog.create({
        data: { userId: req.user!.userId, action: 'CREATE', entity: 'teacher', entityId: teacher.id },
      })

      return teacher
    })

    res.status(201).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/teachers/:id
router.patch('/:id', authenticate, requireAdmin, validate(updateTeacherSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, phone, ...teacherData } = req.body

    const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } })
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' })
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (name || phone) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: { ...(name && { name }), ...(phone && { phone }) },
        })
      }

      return tx.teacher.update({
        where: { id: req.params.id },
        data: {
          ...(teacherData.employeeId !== undefined && { employeeId: teacherData.employeeId }),
          ...(teacherData.department !== undefined && { department: teacherData.department }),
          ...(teacherData.subjects && { subjects: teacherData.subjects }),
          ...(teacherData.qualification !== undefined && { qualification: teacherData.qualification }),
          ...(teacherData.experience !== undefined && { experience: teacherData.experience }),
          ...(teacherData.salary !== undefined && { salary: teacherData.salary }),
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      })
    })

    res.json({ success: true, data: updated })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/teachers/:id
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.teacher.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Teacher deleted' })
  } catch (error) {
    next(error)
  }
})

export { router as teacherRoutes }

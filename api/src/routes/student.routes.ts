import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireTeacher } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { hashPassword, generateSecurePassword } from '../utils/password'
import { createStudentSchema, updateStudentSchema, paginationSchema } from '../validators'

const router = Router()

// GET /api/students
router.get('/', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { class: className, section } = req.query as Record<string, string>

    const where: any = search
      ? {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' as const } } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
            { rollNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    if (className) where.class = className
    if (section) where.section = section

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, phone: true, avatar: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ])

    res.json({
      success: true,
      data: students,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/students/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, role: true } },
        parent: { include: { user: { select: { name: true, phone: true, email: true } } } },
        results: { take: 10, orderBy: { createdAt: 'desc' }, include: { exam: { include: { subject: true } } } },
        fees: { take: 5, orderBy: { dueDate: 'desc' } },
        attendances: { take: 30, orderBy: { date: 'desc' } },
      },
    })

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' })
    }

    // Students can only view their own profile
    if (req.user!.role === 'STUDENT' && student.userId !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    res.json({ success: true, data: student })
  } catch (error) {
    next(error)
  }
})

// POST /api/students
router.post('/', authenticate, requireTeacher, validate(createStudentSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, email, phone, password, ...studentData } = req.body

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: await hashPassword(password || generateSecurePassword()),
          role: 'STUDENT',
        },
      })

      const student = await tx.student.create({
        data: {
          userId: user.id,
          rollNumber: studentData.rollNumber,
          class: studentData.class,
          section: studentData.section,
          dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : undefined,
          parentId: studentData.parentId,
          bloodGroup: studentData.bloodGroup,
          address: studentData.address,
        },
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      })

      await tx.auditLog.create({
        data: { userId: req.user!.userId, action: 'CREATE', entity: 'student', entityId: student.id },
      })

      return student
    })

    res.status(201).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/students/:id
router.patch('/:id', authenticate, validate(updateStudentSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } })
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' })
    }

    if (req.user!.role === 'STUDENT' && student.userId !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    const { name, email, phone, ...studentData } = req.body

    const updated = await prisma.$transaction(async (tx) => {
      if (name || phone) {
        await tx.user.update({
          where: { id: student.userId },
          data: { ...(name && { name }), ...(phone && { phone }) },
        })
      }

      return tx.student.update({
        where: { id: req.params.id },
        data: {
          ...(studentData.rollNumber !== undefined && { rollNumber: studentData.rollNumber }),
          ...(studentData.class !== undefined && { class: studentData.class }),
          ...(studentData.section !== undefined && { section: studentData.section }),
          ...(studentData.dateOfBirth && { dateOfBirth: new Date(studentData.dateOfBirth) }),
          ...(studentData.parentId !== undefined && { parentId: studentData.parentId }),
          ...(studentData.bloodGroup !== undefined && { bloodGroup: studentData.bloodGroup }),
          ...(studentData.address !== undefined && { address: studentData.address }),
        },
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      })
    })

    res.json({ success: true, data: updated })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/students/:id
router.delete('/:id', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Student deleted' })
  } catch (error) {
    next(error)
  }
})

export { router as studentRoutes }

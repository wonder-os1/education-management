import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireTeacher } from '../middleware/rbac'
import { requireFeature } from '../middleware/feature-gate'
import { validate } from '../middleware/validate'
import { createOnlineClassSchema, updateOnlineClassSchema, paginationSchema } from '../validators'
import { v4 as uuidv4 } from 'uuid'

const router = Router()
router.use(requireFeature('onlineClasses'))

// GET /api/online-classes
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { classId, status } = req.query as Record<string, string>

    const where: any = {}
    if (classId) where.classId = classId
    if (status) where.status = status

    // Teachers see their own online classes
    if (req.user!.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
      if (teacher) where.teacherId = teacher.id
    }

    const [classes, total] = await Promise.all([
      prisma.onlineClass.findMany({
        where,
        include: {
          subject: { select: { name: true, code: true } },
          class: { select: { name: true, section: true } },
          teacher: { include: { user: { select: { name: true } } } },
        },
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' },
      }),
      prisma.onlineClass.count({ where }),
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

// GET /api/online-classes/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const onlineClass = await prisma.onlineClass.findUnique({
      where: { id: req.params.id },
      include: {
        subject: true,
        class: true,
        teacher: { include: { user: { select: { name: true, email: true } } } },
      },
    })

    if (!onlineClass) {
      return res.status(404).json({ success: false, error: 'Online class not found' })
    }

    res.json({ success: true, data: onlineClass })
  } catch (error) {
    next(error)
  }
})

// POST /api/online-classes
router.post('/', authenticate, requireTeacher, validate(createOnlineClassSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
    if (!teacher && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Teacher profile not found' })
    }

    const roomId = uuidv4()
    const meetingUrl = req.body.meetingUrl || `https://meet.jit.si/wonderos-${roomId}`

    const onlineClass = await prisma.onlineClass.create({
      data: {
        title: req.body.title,
        subjectId: req.body.subjectId,
        classId: req.body.classId,
        teacherId: teacher?.id || req.user!.userId,
        scheduledAt: new Date(req.body.scheduledAt),
        duration: req.body.duration,
        meetingUrl,
      },
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, section: true } },
      },
    })

    res.status(201).json({ success: true, data: onlineClass })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/online-classes/:id
router.patch('/:id', authenticate, requireTeacher, validate(updateOnlineClassSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const data: any = { ...req.body }
    if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt)

    const onlineClass = await prisma.onlineClass.update({
      where: { id: req.params.id },
      data,
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, section: true } },
      },
    })

    res.json({ success: true, data: onlineClass })
  } catch (error) {
    next(error)
  }
})

// POST /api/online-classes/:id/start — Start a live class
router.post('/:id/start', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    const onlineClass = await prisma.onlineClass.update({
      where: { id: req.params.id },
      data: { status: 'LIVE' },
    })

    res.json({ success: true, data: onlineClass })
  } catch (error) {
    next(error)
  }
})

// POST /api/online-classes/:id/end — End a live class
router.post('/:id/end', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    const onlineClass = await prisma.onlineClass.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        recordingUrl: req.body?.recordingUrl,
      },
    })

    res.json({ success: true, data: onlineClass })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/online-classes/:id
router.delete('/:id', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.onlineClass.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Online class deleted' })
  } catch (error) {
    next(error)
  }
})

export { router as onlineClassRoutes }

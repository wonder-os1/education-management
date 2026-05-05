import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireAdmin, requireTeacher } from '../middleware/rbac'
import { requireFeature } from '../middleware/feature-gate'
import { validate } from '../middleware/validate'
import { createTransportSchema, updateTransportSchema, assignTransportSchema, paginationSchema } from '../validators'

const router = Router()
router.use(requireFeature('transportManagement'))

// GET /api/transport/routes
router.get('/routes', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit

    const where: any = search
      ? {
          OR: [
            { routeName: { contains: search, mode: 'insensitive' as const } },
            { vehicleNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [routes, total] = await Promise.all([
      prisma.transport.findMany({
        where,
        include: { _count: { select: { assignments: true } } },
        skip,
        take: limit,
        orderBy: { routeName: 'asc' },
      }),
      prisma.transport.count({ where }),
    ])

    res.json({
      success: true,
      data: routes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/transport/routes/:id
router.get('/routes/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const route = await prisma.transport.findUnique({
      where: { id: req.params.id },
      include: {
        assignments: {
          include: { student: { include: { user: { select: { name: true, phone: true } } } } },
        },
      },
    })

    if (!route) {
      return res.status(404).json({ success: false, error: 'Transport route not found' })
    }

    res.json({ success: true, data: route })
  } catch (error) {
    next(error)
  }
})

// POST /api/transport/routes
router.post('/routes', authenticate, requireAdmin, validate(createTransportSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const route = await prisma.transport.create({ data: req.body })
    res.status(201).json({ success: true, data: route })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/transport/routes/:id
router.patch('/routes/:id', authenticate, requireAdmin, validate(updateTransportSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const route = await prisma.transport.update({
      where: { id: req.params.id },
      data: req.body,
    })

    res.json({ success: true, data: route })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/transport/routes/:id
router.delete('/routes/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.transport.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Transport route deleted' })
  } catch (error) {
    next(error)
  }
})

// POST /api/transport/assign — Assign a student to a transport route
router.post('/assign', authenticate, requireTeacher, validate(assignTransportSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const assignment = await prisma.transportAssignment.upsert({
      where: { studentId: req.body.studentId },
      update: {
        transportId: req.body.transportId,
        stopName: req.body.stopName,
        type: req.body.type,
      },
      create: req.body,
      include: {
        student: { include: { user: { select: { name: true } } } },
        transport: { select: { routeName: true, vehicleNumber: true } },
      },
    })

    res.json({ success: true, data: assignment })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/transport/assign/:studentId — Remove transport assignment
router.delete('/assign/:studentId', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.transportAssignment.delete({ where: { studentId: req.params.studentId } })
    res.json({ success: true, message: 'Transport assignment removed' })
  } catch (error) {
    next(error)
  }
})

// GET /api/transport/assignments — Get all transport assignments
router.get('/assignments', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { transportId } = req.query as Record<string, string>

    const where: any = {}
    if (transportId) where.transportId = transportId

    const [assignments, total] = await Promise.all([
      prisma.transportAssignment.findMany({
        where,
        include: {
          student: { include: { user: { select: { name: true, phone: true } } } },
          transport: { select: { routeName: true, vehicleNumber: true } },
        },
        skip,
        take: limit,
      }),
      prisma.transportAssignment.count({ where }),
    ])

    res.json({
      success: true,
      data: assignments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

export { router as transportRoutes }

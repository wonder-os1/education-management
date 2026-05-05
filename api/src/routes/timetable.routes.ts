import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireAdmin } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { createTimetableSchema, updateTimetableSchema } from '../validators'

const router = Router()

// GET /api/timetable — Get timetable for a class
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { classId, dayOfWeek } = req.query as Record<string, string>

    if (!classId) {
      return res.status(400).json({ success: false, error: 'classId is required' })
    }

    const where: any = { classId }
    if (dayOfWeek !== undefined) where.dayOfWeek = parseInt(dayOfWeek)

    const timetable = await prisma.timetable.findMany({
      where,
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, section: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    res.json({ success: true, data: timetable })
  } catch (error) {
    next(error)
  }
})

// GET /api/timetable/weekly/:classId — Weekly view
router.get('/weekly/:classId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const timetable = await prisma.timetable.findMany({
      where: { classId: req.params.classId },
      include: {
        subject: { select: { name: true, code: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    // Group by day
    const weekly: Record<string, any[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    }
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    timetable.forEach((entry) => {
      weekly[entry.dayOfWeek].push(entry)
    })

    const result = Object.entries(weekly).map(([day, entries]) => ({
      dayOfWeek: parseInt(day),
      dayName: dayNames[parseInt(day)],
      periods: entries,
    }))

    res.json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
})

// POST /api/timetable
router.post('/', authenticate, requireAdmin, validate(createTimetableSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const entry = await prisma.timetable.create({
      data: req.body,
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, section: true } },
      },
    })

    res.status(201).json({ success: true, data: entry })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/timetable/:id
router.patch('/:id', authenticate, requireAdmin, validate(updateTimetableSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const entry = await prisma.timetable.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, section: true } },
      },
    })

    res.json({ success: true, data: entry })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/timetable/:id
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.timetable.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Timetable entry deleted' })
  } catch (error) {
    next(error)
  }
})

export { router as timetableRoutes }

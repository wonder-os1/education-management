import { Router } from 'express'
import { prisma } from '../config/database'

const router = Router()

// GET /api/public/info — School info (no auth)
router.get('/info', async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['schoolName', 'address', 'phone', 'principalName', 'academic_year'],
        },
      },
    })

    const info: Record<string, any> = {}
    settings.forEach((s) => { info[s.key] = s.value })

    res.json({ success: true, data: info })
  } catch (error) {
    next(error)
  }
})

// GET /api/public/classes — Available classes (no auth)
router.get('/classes', async (_req, res, next) => {
  try {
    const classes = await prisma.class.findMany({
      select: { id: true, name: true, section: true, academicYear: true, room: true },
      orderBy: [{ name: 'asc' }, { section: 'asc' }],
    })

    res.json({ success: true, data: classes })
  } catch (error) {
    next(error)
  }
})

// GET /api/public/teachers — Teacher list (no auth)
router.get('/teachers', async (_req, res, next) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: { user: { name: 'asc' } },
    })

    const publicTeachers = teachers.map((t) => ({
      name: t.user.name,
      avatar: t.user.avatar,
      department: t.department,
      subjects: t.subjects,
      qualification: t.qualification,
      experience: t.experience,
    }))

    res.json({ success: true, data: publicTeachers })
  } catch (error) {
    next(error)
  }
})

// GET /api/public/notices — Public notices (no auth)
router.get('/notices', async (_req, res, next) => {
  try {
    const notices = await prisma.notification.findMany({
      where: { type: 'GENERAL' },
      select: { id: true, title: true, message: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    res.json({ success: true, data: notices })
  } catch (error) {
    next(error)
  }
})

export default router

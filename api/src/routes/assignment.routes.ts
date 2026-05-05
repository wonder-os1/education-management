import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireTeacher, requireStudent } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { createAssignmentSchema, updateAssignmentSchema, createSubmissionSchema, gradeSubmissionSchema, paginationSchema } from '../validators'

const router = Router()

// GET /api/assignments
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { classId, subjectId } = req.query as Record<string, string>

    const where: any = search
      ? { title: { contains: search, mode: 'insensitive' as const } }
      : {}

    if (classId) where.classId = classId
    if (subjectId) where.subjectId = subjectId

    // Teachers see their own assignments
    if (req.user!.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
      if (teacher) where.teacherId = teacher.id
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          subject: { select: { name: true, code: true } },
          class: { select: { name: true, section: true } },
          teacher: { include: { user: { select: { name: true } } } },
          _count: { select: { submissions: true } },
        },
        skip,
        take: limit,
        orderBy: { dueDate: 'desc' },
      }),
      prisma.assignment.count({ where }),
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

// GET /api/assignments/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id },
      include: {
        subject: true,
        class: true,
        teacher: { include: { user: { select: { name: true } } } },
        submissions: {
          include: { student: { include: { user: { select: { name: true } } } } },
          orderBy: { submittedAt: 'desc' },
        },
      },
    })

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' })
    }

    res.json({ success: true, data: assignment })
  } catch (error) {
    next(error)
  }
})

// POST /api/assignments
router.post('/', authenticate, requireTeacher, validate(createAssignmentSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
    if (!teacher && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Teacher profile not found' })
    }

    const assignment = await prisma.assignment.create({
      data: {
        ...req.body,
        teacherId: teacher?.id || req.user!.userId,
        dueDate: new Date(req.body.dueDate),
      },
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, section: true } },
      },
    })

    res.status(201).json({ success: true, data: assignment })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/assignments/:id
router.patch('/:id', authenticate, requireTeacher, validate(updateAssignmentSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const data: any = { ...req.body }
    if (data.dueDate) data.dueDate = new Date(data.dueDate)

    const assignment = await prisma.assignment.update({
      where: { id: req.params.id },
      data,
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, section: true } },
      },
    })

    res.json({ success: true, data: assignment })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/assignments/:id
router.delete('/:id', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.assignment.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Assignment deleted' })
  } catch (error) {
    next(error)
  }
})

// POST /api/assignments/:id/submit — Student submits assignment
router.post('/:id/submit', authenticate, requireStudent, validate(createSubmissionSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
    if (!student) {
      return res.status(403).json({ success: false, error: 'Student profile not found' })
    }

    const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } })
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' })
    }

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: req.params.id,
          studentId: student.id,
        },
      },
      update: {
        content: req.body.content,
        attachmentUrl: req.body.attachmentUrl,
        submittedAt: new Date(),
      },
      create: {
        assignmentId: req.params.id,
        studentId: student.id,
        content: req.body.content,
        attachmentUrl: req.body.attachmentUrl,
      },
      include: {
        assignment: { select: { title: true } },
        student: { include: { user: { select: { name: true } } } },
      },
    })

    res.status(201).json({ success: true, data: submission })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/assignments/submissions/:submissionId/grade — Teacher grades submission
router.patch('/submissions/:submissionId/grade', authenticate, requireTeacher, validate(gradeSubmissionSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const submission = await prisma.submission.update({
      where: { id: req.params.submissionId },
      data: {
        marks: req.body.marks,
        feedback: req.body.feedback,
      },
      include: {
        assignment: { select: { title: true } },
        student: { include: { user: { select: { name: true } } } },
      },
    })

    res.json({ success: true, data: submission })
  } catch (error) {
    next(error)
  }
})

export { router as assignmentRoutes }

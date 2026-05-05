import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireTeacher } from '../middleware/rbac'
import { requireFeature } from '../middleware/feature-gate'
import { validate } from '../middleware/validate'
import { createBookSchema, updateBookSchema, issueBookSchema, paginationSchema } from '../validators'

const router = Router()
router.use(requireFeature('libraryManagement'))

// GET /api/library/books
router.get('/books', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { category } = req.query as Record<string, string>

    const where: any = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { author: { contains: search, mode: 'insensitive' as const } },
            { isbn: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    if (category) where.category = category

    const [books, total] = await Promise.all([
      prisma.libraryBook.findMany({
        where,
        include: { _count: { select: { issues: true } } },
        skip,
        take: limit,
        orderBy: { title: 'asc' },
      }),
      prisma.libraryBook.count({ where }),
    ])

    res.json({
      success: true,
      data: books,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/library/books/:id
router.get('/books/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const book = await prisma.libraryBook.findUnique({
      where: { id: req.params.id },
      include: {
        issues: {
          include: { student: { include: { user: { select: { name: true } } } } },
          orderBy: { issuedAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' })
    }

    res.json({ success: true, data: book })
  } catch (error) {
    next(error)
  }
})

// POST /api/library/books
router.post('/books', authenticate, requireTeacher, validate(createBookSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const book = await prisma.libraryBook.create({
      data: {
        ...req.body,
        availableCopies: req.body.totalCopies,
      },
    })

    res.status(201).json({ success: true, data: book })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/library/books/:id
router.patch('/books/:id', authenticate, requireTeacher, validate(updateBookSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const book = await prisma.libraryBook.update({
      where: { id: req.params.id },
      data: req.body,
    })

    res.json({ success: true, data: book })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/library/books/:id
router.delete('/books/:id', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.libraryBook.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Book deleted' })
  } catch (error) {
    next(error)
  }
})

// POST /api/library/issue — Issue a book to a student
router.post('/issue', authenticate, requireTeacher, validate(issueBookSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { bookId, studentId, dueDate } = req.body

    const book = await prisma.libraryBook.findUnique({ where: { id: bookId } })
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' })
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ success: false, error: 'No copies available' })
    }

    const result = await prisma.$transaction(async (tx) => {
      const issue = await tx.bookIssue.create({
        data: {
          bookId,
          studentId,
          dueDate: new Date(dueDate),
        },
        include: {
          book: { select: { title: true, author: true } },
          student: { include: { user: { select: { name: true } } } },
        },
      })

      await tx.libraryBook.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } },
      })

      return issue
    })

    res.status(201).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
})

// POST /api/library/return/:issueId — Return a book
router.post('/return/:issueId', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    const issue = await prisma.bookIssue.findUnique({ where: { id: req.params.issueId } })
    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue record not found' })
    }

    if (issue.returnedAt) {
      return res.status(400).json({ success: false, error: 'Book already returned' })
    }

    // Calculate fine (if overdue)
    const now = new Date()
    let fine = 0
    if (now > issue.dueDate) {
      const daysOverdue = Math.ceil((now.getTime() - issue.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      fine = daysOverdue * 500 // 5 INR per day in paise
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.bookIssue.update({
        where: { id: req.params.issueId },
        data: {
          returnedAt: now,
          fine: fine > 0 ? fine : null,
        },
        include: {
          book: { select: { title: true, author: true } },
          student: { include: { user: { select: { name: true } } } },
        },
      })

      await tx.libraryBook.update({
        where: { id: issue.bookId },
        data: { availableCopies: { increment: 1 } },
      })

      return updated
    })

    res.json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
})

// GET /api/library/issues — Get all book issues
router.get('/issues', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { studentId, overdue } = req.query as Record<string, string>

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (overdue === 'true') {
      where.returnedAt = null
      where.dueDate = { lt: new Date() }
    }

    // Students see their own issues
    if (req.user!.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
      if (student) where.studentId = student.id
    }

    const [issues, total] = await Promise.all([
      prisma.bookIssue.findMany({
        where,
        include: {
          book: { select: { title: true, author: true, category: true } },
          student: { include: { user: { select: { name: true } } } },
        },
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.bookIssue.count({ where }),
    ])

    res.json({
      success: true,
      data: issues,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

export { router as libraryRoutes }

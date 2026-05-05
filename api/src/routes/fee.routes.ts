import { Router, Response, Request } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireTeacher } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { createFeeSchema, payFeeSchema, paginationSchema } from '../validators'
import { createOrder, verifyWebhookSignature } from '../utils/razorpay'
import { sendFeeReceipt } from '../utils/email'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// GET /api/fees
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const skip = (page - 1) * limit
    const { studentId, status, type } = req.query as Record<string, string>

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (status) where.status = status
    if (type) where.type = type

    // Students see only their own fees
    if (req.user!.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
      if (student) where.studentId = student.id
    }

    // Parents see their children's fees
    if (req.user!.role === 'PARENT') {
      const parent = await prisma.parent.findUnique({
        where: { userId: req.user!.userId },
        include: { children: { select: { id: true } } },
      })
      if (parent) {
        where.studentId = { in: parent.children.map((c) => c.id) }
      }
    }

    const [fees, total] = await Promise.all([
      prisma.fee.findMany({
        where,
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
        },
        skip,
        take: limit,
        orderBy: { dueDate: 'desc' },
      }),
      prisma.fee.count({ where }),
    ])

    res.json({
      success: true,
      data: fees,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/fees/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const fee = await prisma.fee.findUnique({
      where: { id: req.params.id },
      include: {
        student: { include: { user: { select: { name: true, email: true, phone: true } } } },
      },
    })

    if (!fee) {
      return res.status(404).json({ success: false, error: 'Fee record not found' })
    }

    res.json({ success: true, data: fee })
  } catch (error) {
    next(error)
  }
})

// POST /api/fees
router.post('/', authenticate, requireTeacher, validate(createFeeSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const fee = await prisma.fee.create({
      data: {
        ...req.body,
        dueDate: new Date(req.body.dueDate),
      },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
      },
    })

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'CREATE', entity: 'fee', entityId: fee.id },
    })

    res.status(201).json({ success: true, data: fee })
  } catch (error) {
    next(error)
  }
})

// POST /api/fees/pay
router.post('/pay', authenticate, validate(payFeeSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { feeId, method } = req.body

    const fee = await prisma.fee.findUnique({
      where: { id: feeId },
      include: { student: { include: { user: { select: { name: true, email: true } } } } },
    })

    if (!fee) {
      return res.status(404).json({ success: false, error: 'Fee record not found' })
    }

    if (fee.status === 'PAID') {
      return res.status(400).json({ success: false, error: 'Fee already paid' })
    }

    if (method === 'razorpay') {
      try {
        const receiptId = `FEE-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`
        const order = await createOrder(fee.amount, 'INR', receiptId)

        await prisma.fee.update({
          where: { id: feeId },
          data: { razorpayOrderId: order.id },
        })

        return res.json({
          success: true,
          data: {
            fee,
            razorpayOrder: order,
            key: process.env.RAZORPAY_KEY_ID,
          },
        })
      } catch {
        return res.status(500).json({ success: false, error: 'Failed to create payment order' })
      }
    }

    // Cash/Card/UPI — mark as paid directly
    const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`

    const updatedFee = await prisma.fee.update({
      where: { id: feeId },
      data: {
        status: 'PAID',
        paidDate: new Date(),
      },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
      },
    })

    // Send receipt
    const formatAmount = `\u20B9${(fee.amount / 100).toLocaleString('en-IN')}`
    sendFeeReceipt(updatedFee.student.user.email, {
      studentName: updatedFee.student.user.name,
      receiptNumber,
      amount: formatAmount,
    }).catch(console.error)

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'PAY_FEE', entity: 'fee', entityId: feeId, metadata: { method, receiptNumber } },
    })

    res.json({ success: true, data: updatedFee })
  } catch (error) {
    next(error)
  }
})

// POST /api/fees/webhooks/razorpay
router.post('/webhooks/razorpay', async (req: Request, res: Response, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string
    if (!signature) {
      return res.status(400).json({ success: false, error: 'Missing signature' })
    }

    const body = JSON.stringify(req.body)
    if (!verifyWebhookSignature(body, signature)) {
      return res.status(401).json({ success: false, error: 'Invalid signature' })
    }

    const event = req.body.event
    const paymentEntity = req.body.payload?.payment?.entity

    if (event === 'payment.captured' && paymentEntity) {
      const fee = await prisma.fee.findFirst({
        where: { razorpayOrderId: paymentEntity.order_id },
      })

      if (fee) {
        await prisma.fee.update({
          where: { id: fee.id },
          data: {
            status: 'PAID',
            razorpayPaymentId: paymentEntity.id,
            paidDate: new Date(),
          },
        })
      }
    }

    if (event === 'payment.failed' && paymentEntity) {
      const fee = await prisma.fee.findFirst({
        where: { razorpayOrderId: paymentEntity.order_id },
      })

      if (fee) {
        await prisma.fee.update({
          where: { id: fee.id },
          data: { status: 'OVERDUE' },
        })
      }
    }

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/fees/:id/waive
router.patch('/:id/waive', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    const fee = await prisma.fee.update({
      where: { id: req.params.id },
      data: { status: 'WAIVED' },
    })

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: 'WAIVE_FEE', entity: 'fee', entityId: fee.id },
    })

    res.json({ success: true, data: fee })
  } catch (error) {
    next(error)
  }
})

// GET /api/fees/summary — Fee collection summary
router.get('/report/summary', authenticate, requireTeacher, async (req: AuthRequest, res: Response, next) => {
  try {
    const [totalCollected, totalPending, totalOverdue, totalWaived] = await Promise.all([
      prisma.fee.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.fee.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),
      prisma.fee.aggregate({ where: { status: 'OVERDUE' }, _sum: { amount: true } }),
      prisma.fee.aggregate({ where: { status: 'WAIVED' }, _sum: { amount: true } }),
    ])

    res.json({
      success: true,
      data: {
        collected: totalCollected._sum.amount || 0,
        pending: totalPending._sum.amount || 0,
        overdue: totalOverdue._sum.amount || 0,
        waived: totalWaived._sum.amount || 0,
      },
    })
  } catch (error) {
    next(error)
  }
})

export { router as feeRoutes }

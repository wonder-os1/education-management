import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      todayAttendance,
      todayPresent,
      todayAbsent,
      monthlyFeeCollection,
      lastMonthFeeCollection,
      pendingFees,
      upcomingExams,
      recentAttendance,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.attendance.count({
        where: { date: { gte: today, lt: tomorrow } },
      }),
      prisma.attendance.count({
        where: { date: { gte: today, lt: tomorrow }, status: 'PRESENT' },
      }),
      prisma.attendance.count({
        where: { date: { gte: today, lt: tomorrow }, status: 'ABSENT' },
      }),
      prisma.fee.aggregate({
        where: { status: 'PAID', paidDate: { gte: thisMonthStart } },
        _sum: { amount: true },
      }),
      prisma.fee.aggregate({
        where: { status: 'PAID', paidDate: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
      }),
      prisma.fee.aggregate({
        where: { status: { in: ['PENDING', 'OVERDUE'] } },
        _sum: { amount: true },
      }),
      prisma.exam.findMany({
        where: { date: { gte: today } },
        include: {
          subject: { select: { name: true } },
          class: { select: { name: true, section: true } },
        },
        orderBy: { date: 'asc' },
        take: 10,
      }),
      prisma.attendance.findMany({
        where: { date: { gte: today, lt: tomorrow } },
        include: {
          student: { include: { user: { select: { name: true } } } },
          class: { select: { name: true, section: true } },
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const attendanceRate = todayAttendance > 0
      ? Math.round((todayPresent / todayAttendance) * 100)
      : 0

    const currentMonthFee = monthlyFeeCollection._sum.amount || 0
    const lastMonthFee = lastMonthFeeCollection._sum.amount || 0
    const feeGrowth = lastMonthFee > 0 ? Math.round(((currentMonthFee - lastMonthFee) / lastMonthFee) * 100) : 0

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        todayAttendance,
        todayPresent,
        todayAbsent,
        attendanceRate,
        monthlyFeeCollection: currentMonthFee,
        lastMonthFeeCollection: lastMonthFee,
        feeGrowth,
        pendingFees: pendingFees._sum.amount || 0,
        upcomingExams,
        recentAttendance,
      },
    })
  } catch (error) {
    next(error)
  }
})

export { router as dashboardRoutes }

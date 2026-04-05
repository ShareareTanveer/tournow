import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [
    totalBookings,
    confirmedBookings,
    totalInquiries,
    newInquiries,
    pendingConsultations,
    pendingReviews,
    totalSubscribers,
    totalPackages,
    revenueAgg,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: 'NEW' } }),
    prisma.consultation.count({ where: { status: 'PENDING' } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.package.count({ where: { isActive: true } }),
    prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    }),
  ])

  return NextResponse.json({
    totalBookings,
    confirmedBookings,
    totalInquiries,
    newInquiries,
    pendingConsultations,
    pendingReviews,
    totalSubscribers,
    totalPackages,
    totalRevenue: revenueAgg._sum.amount ?? 0,
  })
}

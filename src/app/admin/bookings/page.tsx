export const dynamic = 'force-dynamic'

import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import BookingsTable, { type Booking } from './BookingsTable'
import { FiBookOpen, FiDollarSign, FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi'
import { randomUUID } from 'crypto'

async function getBookings() {
  try {
    const [pkgBookings, tourBookings] = await Promise.all([
      prisma.booking.findMany({
        include: {
          package: {
            select: {
              title: true,
              slug: true,
              images: true,
              supplier: { select: { name: true, phone: true, whatsappNumber: true } },
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tourBooking.findMany({
        include: {
          tour: {
            select: {
              title: true,
              slug: true,
              images: true,
              supplier: { select: { name: true, phone: true, whatsappNumber: true } },
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    const packageRows = await Promise.all(pkgBookings.map(async (b) => {
      let supplierConfirmToken = b.supplierConfirmToken
      if (b.package.supplier && !supplierConfirmToken) {
        supplierConfirmToken = randomUUID()
        await prisma.booking.update({ where: { id: b.id }, data: { supplierConfirmToken } })
      }
      return { ...b, supplierConfirmToken, _type: 'package' as const, title: b.package.title, image: b.package.images?.[0], supplier: b.package.supplier }
    }))
    const tourRows = await Promise.all(tourBookings.map(async (b) => {
      let supplierConfirmToken = b.supplierConfirmToken
      if (b.tour.supplier && !supplierConfirmToken) {
        supplierConfirmToken = randomUUID()
        await prisma.tourBooking.update({ where: { id: b.id }, data: { supplierConfirmToken } })
      }
      return { ...b, supplierConfirmToken, _type: 'tour' as const, title: b.tour.title, image: b.tour.images?.[0], supplier: b.tour.supplier }
    }))

    const normalised = [
      ...packageRows,
      ...tourRows,
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return normalised
  } catch { return [] }
}

export default async function BookingsPage() {
  const bookings     = await getBookings()
  const paid         = bookings.filter((b) => b.paymentStatus === 'PAID')
  const totalRevenue = paid.reduce((sum, b) => sum + b.totalPrice, 0)
  const confirmed    = bookings.filter((b) => ['CONFIRMED', 'SUPPLIER_CONFIRMED', 'ALL_CONFIRMED', 'MAIL_SENT'].includes(b.status)).length
  const requested    = bookings.filter((b) => b.status === 'REQUESTED').length
  const paidRate     = bookings.length ? Math.round((paid.length / bookings.length) * 100) : 0

  const STATS = [
    { label: 'Total Bookings', value: bookings.length, sub: `${paid.length} fully paid`, Icon: FiBookOpen, tone: 'teal' },
    { label: 'Needs Attention', value: requested, sub: 'new requests', Icon: FiClock, tone: 'amber' },
    { label: 'Confirmed', value: confirmed, sub: `${paidRate}% payment rate`, Icon: FiCheckCircle, tone: 'green' },
    { label: 'Paid Revenue', value: `LKR ${(totalRevenue / 1000).toFixed(0)}k`, sub: 'completed payments', Icon: FiDollarSign, tone: 'violet' },
  ]

  return (
    <AdminShell
      title="Bookings"
      subtitle={`${bookings.length} total · LKR ${(totalRevenue / 1000).toFixed(0)}k revenue`}
    >
      <div className="booking-overview">
        <div>
          <div className="booking-overview-kicker"><FiTrendingUp size={13} /> Operations overview</div>
          <h2>Manage every booking from request to completion</h2>
          <p>Review customers, update progress, track payments, and prepare quotes from one workspace.</p>
        </div>
        <div className="booking-overview-revenue">
          <span>Paid revenue</span>
          <strong>LKR {totalRevenue.toLocaleString()}</strong>
          <small>{paid.length} paid booking{paid.length !== 1 ? 's' : ''}</small>
        </div>
      </div>

      <div className="booking-stat-grid grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((s) => (
          <div key={s.label} className={`booking-stat-card is-${s.tone}`}>
            <div className="booking-stat-icon">
              <s.Icon size={18} />
            </div>
            <div>
              <p className="booking-stat-value">{s.value}</p>
              <p className="booking-stat-label">{s.label}</p>
              <p className="booking-stat-sub">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="booking-workspace">
        <BookingsTable bookings={bookings as unknown as Booking[]} />
      </div>
    </AdminShell>
  )
}

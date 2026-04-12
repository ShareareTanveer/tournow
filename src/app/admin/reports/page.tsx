import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import ReportsDashboard from './ReportsDashboard'

async function getReportData() {
  try {
    const [pkgBookings, tourBookings, inquiries, consultations, newsletter, donations] = await Promise.all([
      prisma.booking.findMany({
        select: {
          id: true, bookingRef: true, customerName: true, customerEmail: true,
          travelDate: true, createdAt: true, status: true, paymentStatus: true,
          totalPrice: true, discount: true, paxAdult: true, paxChild: true, paxInfant: true,
          package: { select: { title: true, category: true, destination: { select: { name: true, region: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tourBooking.findMany({
        select: {
          id: true, bookingRef: true, customerName: true, customerEmail: true,
          travelDate: true, createdAt: true, status: true, paymentStatus: true,
          totalPrice: true, discount: true, paxAdult: true, paxChild: true, paxInfant: true,
          tour: { select: { title: true, region: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inquiry.findMany({
        select: { id: true, createdAt: true, status: true, destination: true, package: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.consultation.findMany({
        select: { id: true, createdAt: true, status: true, method: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.newsletterSubscriber.findMany({
        select: { id: true, email: true, isActive: true, subscribedAt: true },
        orderBy: { subscribedAt: 'desc' },
      }),
      prisma.charityDonation.findMany({
        select: { id: true, status: true, createdAt: true, name: true, email: true, notes: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Normalise bookings
    const allBookings = [
      ...pkgBookings.map(b => ({
        id: b.id, bookingRef: b.bookingRef, customerName: b.customerName, customerEmail: b.customerEmail,
        travelDate: b.travelDate.toISOString(), createdAt: b.createdAt.toISOString(),
        status: b.status, paymentStatus: b.paymentStatus,
        totalPrice: b.totalPrice, discount: b.discount,
        paxAdult: b.paxAdult, paxChild: b.paxChild, paxInfant: b.paxInfant,
        title: b.package.title,
        category: b.package.category as string,
        destination: b.package.destination?.name ?? '',
        region: b.package.destination?.region ?? '',
        _type: 'package' as const,
      })),
      ...tourBookings.map(b => ({
        id: b.id, bookingRef: b.bookingRef, customerName: b.customerName, customerEmail: b.customerEmail,
        travelDate: b.travelDate.toISOString(), createdAt: b.createdAt.toISOString(),
        status: b.status, paymentStatus: b.paymentStatus,
        totalPrice: b.totalPrice, discount: b.discount,
        paxAdult: b.paxAdult, paxChild: b.paxChild, paxInfant: b.paxInfant,
        title: (b as any).tour.title,
        category: 'TOUR',
        destination: '',
        region: (b as any).tour.region ?? '',
        _type: 'tour' as const,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return {
      bookings: allBookings,
      inquiries: inquiries.map(i => ({ ...i, createdAt: i.createdAt.toISOString() })),
      consultations: consultations.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })),
      newsletter: newsletter.map(n => ({ id: n.id, email: n.email, isActive: n.isActive, createdAt: n.subscribedAt.toISOString() })),
      donations: donations.map(d => ({ id: d.id, amount: 0, status: d.status, createdAt: d.createdAt.toISOString(), donorName: d.name, donorEmail: d.email })),
    }
  } catch (e) {
    console.error(e)
    return { bookings: [], inquiries: [], consultations: [], newsletter: [], donations: [] }
  }
}

export default async function ReportsPage() {
  const data = await getReportData()
  return (
    <AdminShell title="Reports" subtitle="Analytics, insights & exports">
      <ReportsDashboard data={data} />
    </AdminShell>
  )
}

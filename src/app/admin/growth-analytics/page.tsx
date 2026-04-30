import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import GrowthAnalytics from './GrowthAnalytics'

async function getData() {
  try {
    const [pkgBookings, tourBookings, inquiries, consultations, newsletter] = await Promise.all([
      prisma.booking.findMany({
        select: {
          id: true, createdAt: true, status: true, paymentStatus: true,
          totalPrice: true, discount: true, paxAdult: true, paxChild: true, paxInfant: true,
          travelDate: true, customerEmail: true,
          package: { select: { title: true, category: true, destination: { select: { name: true, region: true } } } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.tourBooking.findMany({
        select: {
          id: true, createdAt: true, status: true, paymentStatus: true,
          totalPrice: true, discount: true, paxAdult: true, paxChild: true, paxInfant: true,
          travelDate: true, customerEmail: true,
          tour: { select: { title: true, region: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.inquiry.findMany({
        select: { id: true, createdAt: true, status: true, destination: true, package: { select: { title: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.consultation.findMany({
        select: { id: true, createdAt: true, status: true, method: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.newsletterSubscriber.findMany({
        select: { id: true, isActive: true, subscribedAt: true },
        orderBy: { subscribedAt: 'asc' },
      }),
    ])

    const bookings = [
      ...pkgBookings.map(b => ({
        id: b.id, createdAt: b.createdAt.toISOString(), status: b.status,
        paymentStatus: b.paymentStatus, totalPrice: b.totalPrice, discount: b.discount,
        paxAdult: b.paxAdult, paxChild: b.paxChild, paxInfant: b.paxInfant,
        travelDate: b.travelDate.toISOString(), customerEmail: b.customerEmail,
        title: b.package.title, category: b.package.category as string,
        destination: b.package.destination?.name ?? '', region: b.package.destination?.region ?? '',
      })),
      ...tourBookings.map(b => ({
        id: b.id, createdAt: b.createdAt.toISOString(), status: b.status,
        paymentStatus: b.paymentStatus, totalPrice: b.totalPrice, discount: b.discount,
        paxAdult: b.paxAdult, paxChild: b.paxChild, paxInfant: b.paxInfant,
        travelDate: b.travelDate.toISOString(), customerEmail: b.customerEmail,
        title: (b as any).tour.title, category: 'TOUR',
        destination: '', region: (b as any).tour.region ?? '',
      })),
    ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    return {
      bookings,
      inquiries: inquiries.map(i => ({ ...i, createdAt: i.createdAt.toISOString() })),
      consultations: consultations.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })),
      newsletter: newsletter.map(n => ({ id: n.id, isActive: n.isActive, createdAt: n.subscribedAt.toISOString() })),
    }
  } catch (e) {
    console.error(e)
    return { bookings: [], inquiries: [], consultations: [], newsletter: [] }
  }
}

export default async function GrowthAnalyticsPage() {
  const data = await getData()
  return (
    <AdminShell title="Growth Analytics" subtitle="Lead generation, conversion funnels & business growth insights">
      <GrowthAnalytics data={data} />
    </AdminShell>
  )
}

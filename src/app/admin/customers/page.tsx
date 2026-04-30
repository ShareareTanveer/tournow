import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import CustomersTable from './CustomersTable'

async function getCustomers() {
  try {
    const [pkgBookings, tourBookings, inquiries, consultations, loyalty, newsletter] = await Promise.all([
      prisma.booking.findMany({
        select: {
          id: true, bookingRef: true, customerName: true, customerEmail: true, customerPhone: true,
          totalPrice: true, paymentStatus: true, status: true, createdAt: true,
          package: { select: { title: true } },
        },
      }),
      prisma.tourBooking.findMany({
        select: {
          id: true, bookingRef: true, customerName: true, customerEmail: true, customerPhone: true,
          totalPrice: true, paymentStatus: true, status: true, createdAt: true,
          tour: { select: { title: true } },
        },
      }),
      prisma.inquiry.findMany({
        select: { id: true, email: true, name: true, phone: true, status: true, createdAt: true },
      }),
      prisma.consultation.findMany({
        select: { id: true, email: true, name: true, phone: true, status: true, createdAt: true },
      }),
      prisma.loyaltyCard.findMany({
        select: { id: true, customerEmail: true, customerName: true, customerPhone: true, pointsEarned: true, pointsRedeemed: true, tier: true },
      }),
      prisma.newsletterSubscriber.findMany({
        select: { id: true, email: true, isActive: true },
      }),
    ])

    // Build unified customer map keyed by email (lowercased)
    const map = new Map<string, {
      email: string
      name: string
      phone: string
      bookings: { id: string; bookingRef: string; title: string; totalPrice: number; paymentStatus: string; status: string; createdAt: string }[]
      inquiries: { id: string; status: string; createdAt: string }[]
      consultations: { id: string; status: string; createdAt: string }[]
      loyalty: { pointsEarned: number; pointsRedeemed: number; tier: string } | null
      isSubscriber: boolean
      firstSeen: string
      lastSeen: string
    }>()

    function getOrCreate(email: string, name: string, phone: string) {
      const key = email.toLowerCase()
      if (!map.has(key)) {
        map.set(key, { email: key, name, phone, bookings: [], inquiries: [], consultations: [], loyalty: null, isSubscriber: false, firstSeen: '', lastSeen: '' })
      }
      return map.get(key)!
    }

    for (const b of pkgBookings) {
      const c = getOrCreate(b.customerEmail, b.customerName, b.customerPhone ?? '')
      c.bookings.push({ id: b.id, bookingRef: b.bookingRef, title: b.package.title, totalPrice: b.totalPrice, paymentStatus: b.paymentStatus, status: b.status, createdAt: b.createdAt.toISOString() })
      if (!c.name && b.customerName) c.name = b.customerName
      if (!c.phone && b.customerPhone) c.phone = b.customerPhone ?? ''
    }
    for (const b of tourBookings) {
      const c = getOrCreate(b.customerEmail, b.customerName, b.customerPhone ?? '')
      c.bookings.push({ id: b.id, bookingRef: b.bookingRef, title: (b as any).tour.title, totalPrice: b.totalPrice, paymentStatus: b.paymentStatus, status: b.status, createdAt: b.createdAt.toISOString() })
      if (!c.name && b.customerName) c.name = b.customerName
    }
    for (const i of inquiries) {
      if (!i.email) continue
      const c = getOrCreate(i.email, i.name ?? '', i.phone ?? '')
      c.inquiries.push({ id: i.id, status: i.status, createdAt: i.createdAt.toISOString() })
      if (!c.name && i.name) c.name = i.name
    }
    for (const c of consultations) {
      if (!c.email) continue
      const cu = getOrCreate(c.email, c.name ?? '', c.phone ?? '')
      cu.consultations.push({ id: c.id, status: c.status, createdAt: c.createdAt.toISOString() })
      if (!cu.name && c.name) cu.name = c.name
    }
    for (const l of loyalty) {
      if (!l.customerEmail) continue
      const c = getOrCreate(l.customerEmail, l.customerName ?? '', l.customerPhone ?? '')
      c.loyalty = { pointsEarned: l.pointsEarned, pointsRedeemed: l.pointsRedeemed, tier: l.tier }
    }
    for (const n of newsletter) {
      const c = map.get(n.email.toLowerCase())
      if (c) c.isSubscriber = n.isActive
    }

    // Compute firstSeen / lastSeen / totalSpend
    const customers = Array.from(map.values()).map(c => {
      const allDates = [
        ...c.bookings.map(b => b.createdAt),
        ...c.inquiries.map(i => i.createdAt),
        ...c.consultations.map(i => i.createdAt),
      ].sort()
      const totalSpend = c.bookings.filter(b => b.paymentStatus === 'PAID').reduce((s, b) => s + b.totalPrice, 0)
      return {
        ...c,
        firstSeen: allDates[0] ?? '',
        lastSeen:  allDates[allDates.length - 1] ?? '',
        totalSpend,
        totalBookings: c.bookings.length,
        totalInquiries: c.inquiries.length,
      }
    }).sort((a, b) => (b.lastSeen > a.lastSeen ? 1 : -1))

    return customers
  } catch (e) {
    console.error(e)
    return []
  }
}

export type Customer = Awaited<ReturnType<typeof getCustomers>>[number]

export default async function CustomersPage() {
  const customers = await getCustomers()
  const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0)
  const repeat = customers.filter(c => c.totalBookings > 1).length

  return (
    <AdminShell
      title="Customers"
      subtitle={`${customers.length} unique customers · LKR ${(totalSpend / 1000).toFixed(0)}k total spend`}
    >
      <CustomersTable customers={customers} />
    </AdminShell>
  )
}

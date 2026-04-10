import AdminShell from '@/components/admin/AdminShell'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  FiDollarSign, FiBookOpen, FiInbox, FiVideo,
  FiStar, FiPackage, FiMail, FiCheckCircle,
  FiPlus, FiEdit3, FiFileText, FiSettings,
} from 'react-icons/fi'

// Statuses that represent a booking which has progressed past the initial request
const CONFIRMED_STATUSES = [
  'CONFIRMED', 'RECEIPT_UPLOADED', 'ADMIN_CONFIRMING',
  'ALL_CONFIRMED', 'MAIL_SENT', 'COMPLETED',
]

async function getStats() {
  try {
    const [
      pkgBookingCount, tourBookingCount,
      confirmedPkgCount, confirmedTourCount,
      totalInquiries, newInquiries,
      pendingConsultations, pendingReviews,
      totalSubscribers, totalPackages,
      pkgRevenueAgg, tourRevenueAgg,
      recentInquiries, recentBookings,
    ] = await Promise.all([
      // Total bookings = package + tour bookings combined
      prisma.booking.count(),
      prisma.tourBooking.count(),

      // Confirmed = all statuses past "requested"
      prisma.booking.count({ where: { status: { in: CONFIRMED_STATUSES } } }),
      prisma.tourBooking.count({ where: { status: { in: CONFIRMED_STATUSES } } }),

      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } }),
      prisma.consultation.count({ where: { status: 'PENDING' } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.package.count({ where: { isActive: true } }),

      // Revenue = sum of totalPrice on paid bookings (package + tour)
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalPrice: true },
      }),
      prisma.tourBooking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalPrice: true },
      }),

      prisma.inquiry.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { package: { select: { title: true } } },
      }),
      prisma.booking.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { package: { select: { title: true } } },
      }),
    ])

    return {
      totalBookings:      pkgBookingCount + tourBookingCount,
      confirmedBookings:  confirmedPkgCount + confirmedTourCount,
      totalInquiries,
      newInquiries,
      pendingConsultations,
      pendingReviews,
      totalSubscribers,
      totalPackages,
      totalRevenue: (pkgRevenueAgg._sum.totalPrice ?? 0) + (tourRevenueAgg._sum.totalPrice ?? 0),
      recentInquiries,
      recentBookings,
    }
  } catch {
    return null
  }
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  CONVERTED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-500',
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-600',
}

export default async function DashboardPage() {
  const stats = await getStats()

  const STAT_CARDS = [
    { label: 'Total Revenue',      value: stats ? `LKR ${(stats.totalRevenue / 1000).toFixed(0)}k` : '—', Icon: FiDollarSign,  color: 'bg-green-50 border-green-200',   textColor: 'text-green-700',   link: '/admin/bookings' },
    { label: 'Total Bookings',     value: stats?.totalBookings ?? '—',         Icon: FiBookOpen,    color: 'bg-blue-50 border-blue-200',     textColor: 'text-blue-700',    link: '/admin/bookings' },
    { label: 'New Inquiries',      value: stats?.newInquiries ?? '—',          Icon: FiInbox,       color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700',  link: '/admin/inquiries' },
    { label: 'Pending Consults',   value: stats?.pendingConsultations ?? '—',  Icon: FiVideo,       color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700',  link: '/admin/consultations' },
    { label: 'Pending Reviews',    value: stats?.pendingReviews ?? '—',        Icon: FiStar,        color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-700',  link: '/admin/reviews' },
    { label: 'Active Packages',    value: stats?.totalPackages ?? '—',         Icon: FiPackage,     color: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-700',  link: '/admin/packages' },
    { label: 'Subscribers',        value: stats?.totalSubscribers ?? '—',      Icon: FiMail,        color: 'bg-pink-50 border-pink-200',     textColor: 'text-pink-700',    link: '/admin/newsletter' },
    { label: 'Confirmed Bookings', value: stats?.confirmedBookings ?? '—',     Icon: FiCheckCircle, color: 'bg-teal-50 border-teal-200',     textColor: 'text-teal-700',    link: '/admin/bookings' },
  ]

  const QUICK_ACTIONS = [
    { label: 'Add Package',    href: '/admin/packages/new', Icon: FiPlus },
    { label: 'View Inquiries', href: '/admin/inquiries',    Icon: FiInbox },
    { label: 'Approve Reviews',href: '/admin/reviews',      Icon: FiStar },
    { label: 'Add Blog Post',  href: '/admin/blogs/new',    Icon: FiEdit3 },
    { label: 'Add News',       href: '/admin/news/new',     Icon: FiFileText },
    { label: 'Site Settings',  href: '/admin/settings',     Icon: FiSettings },
  ]

  return (
    <AdminShell title="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map((card) => (
          <Link key={card.label} href={card.link} className={`${card.color} border rounded-2xl p-5 hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.Icon size={18} className={card.textColor} />
              </div>
              <span className={`text-2xl font-bold ${card.textColor}`}>{card.value}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
        <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
              <a.Icon size={15} /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs text-orange-500 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentInquiries?.length ? stats.recentInquiries.map((inq: any) => (
              <div key={inq.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{inq.name}</p>
                  <p className="text-xs text-gray-400">{inq.package?.title ?? inq.destination ?? 'General'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[inq.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {inq.status}
                </span>
              </div>
            )) : (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">No inquiries yet</div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-orange-500 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentBookings?.length ? stats.recentBookings.map((b: any) => (
              <div key={b.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{b.customerName}</p>
                  <p className="text-xs text-gray-400">{b.package?.title} · LKR {b.totalPrice?.toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {b.status}
                </span>
              </div>
            )) : (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">No bookings yet</div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

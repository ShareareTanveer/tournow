import AdminShell from '@/components/admin/AdminShell'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  FiDollarSign, FiBookOpen, FiInbox, FiVideo,
  FiStar, FiPackage, FiMail, FiCheckCircle,
  FiPlus, FiEdit3, FiFileText, FiSettings, FiZap,
  FiArrowUpRight, FiTrendingUp, FiUsers, FiClock,
  FiBarChart2, FiCalendar,
} from 'react-icons/fi'
import { BookingStatus } from '@prisma/client'

const CONFIRMED_STATUSES: BookingStatus[] = [
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
      prisma.booking.count(),
      prisma.tourBooking.count(),
      prisma.booking.count({ where: { status: { in: CONFIRMED_STATUSES } } }),
      prisma.tourBooking.count({ where: { status: { in: CONFIRMED_STATUSES } } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } }),
      prisma.consultation.count({ where: { status: 'PENDING' } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.package.count({ where: { isActive: true } }),
      prisma.booking.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalPrice: true } }),
      prisma.tourBooking.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalPrice: true } }),
      prisma.inquiry.findMany({
        take: 6, orderBy: { createdAt: 'desc' },
        include: { package: { select: { title: true } } },
      }),
      prisma.booking.findMany({
        take: 6, orderBy: { createdAt: 'desc' },
        include: { package: { select: { title: true } } },
      }),
    ])
    return {
      totalBookings:     pkgBookingCount + tourBookingCount,
      confirmedBookings: confirmedPkgCount + confirmedTourCount,
      totalInquiries, newInquiries,
      pendingConsultations, pendingReviews,
      totalSubscribers, totalPackages,
      totalRevenue: (pkgRevenueAgg._sum.totalPrice ?? 0) + (tourRevenueAgg._sum.totalPrice ?? 0),
      recentInquiries, recentBookings,
    }
  } catch { return null }
}

const STATUS_BADGE: Record<string, string> = {
  NEW:              'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  CONTACTED:        'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  CONVERTED:        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  CLOSED:           'bg-gray-50 text-gray-500 ring-1 ring-gray-200',
  CONFIRMED:        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  PENDING:          'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  CANCELLED:        'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
  REQUESTED:        'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  ALL_CONFIRMED:    'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  COMPLETED:        'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
}

export default async function DashboardPage() {
  const stats = await getStats()

  // Primary metrics (featured cards)
  const PRIMARY_METRICS = [
    {
      label: 'Total Revenue', value: stats ? `LKR ${(stats.totalRevenue / 1000).toFixed(0)}k` : '—',
      sub: 'from paid bookings', Icon: FiDollarSign,
      gradient: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600',
      link: '/admin/bookings',
    },
    {
      label: 'Total Bookings', value: stats?.totalBookings ?? '—',
      sub: `${stats?.confirmedBookings ?? 0} confirmed`, Icon: FiBookOpen,
      gradient: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', textColor: 'text-blue-600',
      link: '/admin/bookings',
    },
    {
      label: 'Active Packages', value: stats?.totalPackages ?? '—',
      sub: 'live on website', Icon: FiPackage,
      gradient: 'from-cyan-500 to-cyan-600', bgLight: 'bg-cyan-50', textColor: 'text-cyan-600',
      link: '/admin/packages',
    },
    {
      label: 'Newsletter', value: stats?.totalSubscribers ?? '—',
      sub: 'active subscribers', Icon: FiMail,
      gradient: 'from-fuchsia-500 to-fuchsia-600', bgLight: 'bg-fuchsia-50', textColor: 'text-fuchsia-600',
      link: '/admin/newsletter',
    },
  ]

  // Secondary metrics (smaller cards)
  const SECONDARY_METRICS = [
    {
      label: 'New Inquiries', value: stats?.newInquiries ?? '—',
      sub: `${stats?.totalInquiries ?? 0} total`, Icon: FiInbox,
      link: '/admin/inquiries',
    },
    {
      label: 'Pending Consults', value: stats?.pendingConsultations ?? '—',
      sub: 'awaiting response', Icon: FiVideo,
      link: '/admin/consultations',
    },
    {
      label: 'Pending Reviews', value: stats?.pendingReviews ?? '—',
      sub: 'need approval', Icon: FiStar,
      link: '/admin/reviews',
    },
    {
      label: 'Confirmed Bookings', value: stats?.confirmedBookings ?? '—',
      sub: 'all confirmed', Icon: FiCheckCircle,
      link: '/admin/bookings',
    },
  ]

  const QUICK_ACTIONS = [
    { label: 'Create Package', href: '/admin/packages/new', Icon: FiPlus, color: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' },
    { label: 'Write Blog', href: '/admin/blogs/new', Icon: FiEdit3, color: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm' },
    { label: 'Add Article', href: '/admin/news/new', Icon: FiFileText, color: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' },
    { label: 'View Inquiries', href: '/admin/inquiries', Icon: FiInbox, color: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' },
    { label: 'Manage Reviews', href: '/admin/reviews', Icon: FiStar, color: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' },
    { label: 'AI Settings', href: '/admin/settings/ai', Icon: FiZap, color: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' },
    { label: 'Site Settings', href: '/admin/settings', Icon: FiSettings, color: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' },
  ]

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Welcome back — here's what's happening with your business"
    >
      {/* Primary Metrics - Featured Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {PRIMARY_METRICS.map((metric) => (
          <Link
            key={metric.label}
            href={metric.link}
            className="group relative bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-2xl opacity-50" />
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-md`}>
                <metric.Icon size={20} className="text-white" />
              </div>
              <FiArrowUpRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight mb-1">{metric.value}</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{metric.label}</p>
            <p className="text-[11px] text-gray-400 mt-1.5">{metric.sub}</p>
          </Link>
        ))}
      </div>

      {/* Secondary Metrics - Compact Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {SECONDARY_METRICS.map((metric) => (
          <Link
            key={metric.label}
            href={metric.link}
            className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <metric.Icon size={14} className="text-gray-500" />
              </div>
              <p className="text-lg font-bold text-gray-800">{metric.value}</p>
            </div>
            <p className="text-xs font-medium text-gray-600">{metric.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{metric.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 p-4 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
            <FiTrendingUp size={14} className="text-white" />
          </div>
          <h2 className="font-semibold text-gray-800 text-sm">Quick Actions</h2>
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">shortcuts</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${action.color}`}
            >
              <action.Icon size={14} /> {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <FiInbox size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 text-sm">Recent Inquiries</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Latest customer questions</p>
                </div>
              </div>
              <Link
                href="/admin/inquiries"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all <FiArrowUpRight size={12} />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentInquiries?.length ? (
              stats.recentInquiries.map((inquiry: any) => (
                <div key={inquiry.id} className="px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {inquiry.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{inquiry.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {inquiry.package?.title ?? inquiry.destination ?? 'General Inquiry'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${STATUS_BADGE[inquiry.status] ?? 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'}`}>
                      {inquiry.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <FiInbox size={20} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">No inquiries yet</p>
                <p className="text-xs text-gray-300 mt-1">Customer inquiries will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <FiCalendar size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 text-sm">Recent Bookings</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Latest customer bookings</p>
                </div>
              </div>
              <Link
                href="/admin/bookings"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all <FiArrowUpRight size={12} />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentBookings?.length ? (
              stats.recentBookings.map((booking: any) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="px-5 py-3.5 hover:bg-gray-50/60 transition-colors block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {booking.customerName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{booking.customerName}</p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <FiClock size={9} />
                          {booking.package?.title} · LKR {booking.totalPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${STATUS_BADGE[booking.status] ?? 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'}`}>
                      {booking.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-5 py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <FiUsers size={20} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">No bookings yet</p>
                <p className="text-xs text-gray-300 mt-1">Customer bookings will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
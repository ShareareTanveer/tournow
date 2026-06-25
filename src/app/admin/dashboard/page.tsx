import AdminShell from '@/components/admin/AdminShell'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  FiArrowUpRight,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiEdit3,
  FiFileText,
  FiInbox,
  FiMail,
  FiPackage,
  FiPlus,
  FiSettings,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiVideo,
  FiZap,
} from 'react-icons/fi'
import { BookingStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

const CONFIRMED_STATUSES: BookingStatus[] = [
  'CONFIRMED',
  'RECEIPT_UPLOADED',
  'ADMIN_CONFIRMING',
  'ALL_CONFIRMED',
  'MAIL_SENT',
  'COMPLETED',
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
      totalBookings: pkgBookingCount + tourBookingCount,
      confirmedBookings: confirmedPkgCount + confirmedTourCount,
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

const STATUS_BADGE: Record<string, string> = {
  NEW: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  CONTACTED: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  CONVERTED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  CLOSED: 'bg-gray-50 text-gray-500 ring-1 ring-gray-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  PENDING: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  CANCELLED: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
  REQUESTED: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  ALL_CONFIRMED: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  COMPLETED: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
}

function formatMoney(value?: number | null) {
  if (value == null) return 'LKR 0'
  if (value >= 1_000_000) return `LKR ${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`
  if (value >= 1_000) return `LKR ${(value / 1_000).toFixed(0)}K`
  return `LKR ${value.toLocaleString()}`
}

function formatStatus(value?: string | null) {
  return value ? value.replace(/_/g, ' ') : 'UNKNOWN'
}

function percent(part: number, total: number) {
  if (!total) return 0
  return Math.min(100, Math.round((part / total) * 100))
}

function initials(name?: string | null) {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?'
}

function MetricCard({
  label,
  value,
  helper,
  href,
  Icon,
  tone,
}: {
  label: string
  value: string | number
  helper: string
  href: string
  Icon: any
  tone: string
}) {
  return (
    <Link
      href={href}
      className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={18} />
        </div>
        <FiArrowUpRight size={16} className="text-slate-300 transition group-hover:text-slate-500" />
      </div>
      <p className="mt-5 truncate text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
    </Link>
  )
}

function PanelHeader({
  title,
  subtitle,
  href,
  Icon,
}: {
  title: string
  subtitle: string
  href: string
  Icon: any
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
          <Icon size={15} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <Link href={href} className="shrink-0 text-xs font-semibold text-[#007f89] hover:text-[#063c43]">
        View all
      </Link>
    </div>
  )
}

export default async function DashboardPage() {
  const stats = await getStats()
  const conversionRate = percent(stats?.confirmedBookings ?? 0, stats?.totalBookings ?? 0)
  const inquiryLoad = (stats?.newInquiries ?? 0) + (stats?.pendingConsultations ?? 0) + (stats?.pendingReviews ?? 0)

  const primaryMetrics = [
    {
      label: 'Revenue',
      value: stats ? formatMoney(stats.totalRevenue) : '-',
      helper: 'Paid package and tour bookings',
      Icon: FiDollarSign,
      href: '/admin/bookings',
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Bookings',
      value: stats?.totalBookings ?? '-',
      helper: `${stats?.confirmedBookings ?? 0} confirmed`,
      Icon: FiBookOpen,
      href: '/admin/bookings',
      tone: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Live Packages',
      value: stats?.totalPackages ?? '-',
      helper: 'Active packages on the website',
      Icon: FiPackage,
      href: '/admin/packages',
      tone: 'bg-cyan-50 text-cyan-700',
    },
    {
      label: 'Subscribers',
      value: stats?.totalSubscribers ?? '-',
      helper: 'Active newsletter audience',
      Icon: FiMail,
      href: '/admin/newsletter',
      tone: 'bg-violet-50 text-violet-700',
    },
  ]

  const workload = [
    { label: 'New inquiries', value: stats?.newInquiries ?? 0, href: '/admin/inquiries', Icon: FiInbox },
    { label: 'Pending consultations', value: stats?.pendingConsultations ?? 0, href: '/admin/consultations', Icon: FiVideo },
    { label: 'Reviews to approve', value: stats?.pendingReviews ?? 0, href: '/admin/reviews', Icon: FiStar },
  ]

  const quickActions = [
    { label: 'Create package', href: '/admin/packages/new', Icon: FiPlus, primary: true },
    { label: 'Write blog', href: '/admin/blogs/new', Icon: FiEdit3 },
    { label: 'Add news', href: '/admin/news/new', Icon: FiFileText },
    { label: 'View calendar', href: '/admin/calendar', Icon: FiCalendar },
    { label: 'AI settings', href: '/admin/settings/ai', Icon: FiZap },
    { label: 'Site settings', href: '/admin/settings', Icon: FiSettings },
  ]

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Business overview, pending work, and recent customer activity"
      actions={
        <Link
          href="/admin/packages/new"
          className="hidden items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 sm:flex"
        >
          <FiPlus size={14} /> New package
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-7">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                <FiTrendingUp size={13} />
                Operations snapshot
              </div>
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
                Keep sales, service, and content work moving from one clean view.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                Review revenue, booking progress, open customer work, and the latest activity without leaving the dashboard.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-xl sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs text-white/50">Conversion</p>
                  <p className="mt-1 text-2xl font-semibold">{conversionRate}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs text-white/50">Open work</p>
                  <p className="mt-1 text-2xl font-semibold">{inquiryLoad}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:col-span-1">
                  <p className="text-xs text-white/50">Revenue</p>
                  <p className="mt-1 text-2xl font-semibold">{stats ? formatMoney(stats.totalRevenue) : '-'}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/[0.04] p-6 sm:p-7 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Booking health</p>
                  <p className="mt-1 text-xs text-white/50">Confirmed against total booking requests</p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-950">
                  {conversionRate}%
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#f0d492]" style={{ width: `${conversionRate}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link href="/admin/bookings" className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.1]">
                  <FiCheckCircle size={16} className="text-[#f0d492]" />
                  <p className="mt-3 text-xl font-semibold">{stats?.confirmedBookings ?? 0}</p>
                  <p className="text-xs text-white/50">Confirmed</p>
                </Link>
                <Link href="/admin/bookings" className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.1]">
                  <FiBookOpen size={16} className="text-[#f0d492]" />
                  <p className="mt-3 text-xl font-semibold">{stats?.totalBookings ?? 0}</p>
                  <p className="text-xs text-white/50">Total requests</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {primaryMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <FiBarChart2 size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">Needs attention</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Open work your team should clear first</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {workload.map((item) => (
                <Link key={item.label} href={item.href} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <item.Icon size={15} />
                    </div>
                    <p className="truncate text-sm font-medium text-slate-700">{item.label}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">{item.value}</span>
                    <FiArrowUpRight size={14} className="text-slate-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">Quick actions</h2>
                <p className="mt-1 text-xs text-slate-500">Common admin tasks and content updates</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    action.primary
                      ? 'border-slate-950 bg-slate-950 text-white hover:bg-slate-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <action.Icon size={15} className="shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </span>
                  <FiArrowUpRight size={14} className={action.primary ? 'text-white/60' : 'text-slate-300'} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <PanelHeader title="Recent inquiries" subtitle="Latest customer questions" href="/admin/inquiries" Icon={FiInbox} />
            <div className="divide-y divide-slate-100">
              {stats?.recentInquiries?.length ? (
                stats.recentInquiries.map((inquiry: any) => (
                  <div key={inquiry.id} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf8f6] text-sm font-semibold text-[#007f89]">
                        {initials(inquiry.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{inquiry.name}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {inquiry.package?.title ?? inquiry.destination ?? 'General inquiry'}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_BADGE[inquiry.status] ?? 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'}`}>
                      {formatStatus(inquiry.status)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-12 text-center">
                  <FiInbox size={22} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-500">No inquiries yet</p>
                  <p className="mt-1 text-xs text-slate-400">Customer inquiries will appear here.</p>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <PanelHeader title="Recent bookings" subtitle="Latest package booking requests" href="/admin/bookings" Icon={FiCalendar} />
            <div className="divide-y divide-slate-100">
              {stats?.recentBookings?.length ? (
                stats.recentBookings.map((booking: any) => (
                  <Link key={booking.id} href={`/admin/bookings/${booking.id}`} className="block px-5 py-4 transition hover:bg-slate-50">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-semibold text-sky-700">
                          {initials(booking.customerName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{booking.customerName}</p>
                          <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-slate-500">
                            <FiClock size={10} className="shrink-0" />
                            <span className="truncate">{booking.package?.title ?? 'Package booking'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-slate-950">{formatMoney(booking.totalPrice)}</p>
                        <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_BADGE[booking.status] ?? 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'}`}>
                          {formatStatus(booking.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-5 py-12 text-center">
                  <FiUsers size={22} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-500">No bookings yet</p>
                  <p className="mt-1 text-xs text-slate-400">Customer bookings will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}

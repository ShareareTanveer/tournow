import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import NewsletterActions from './NewsletterActions'
import { FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi'

async function getSubscribers() {
  try { return await prisma.newsletterSubscriber.findMany({}) }
  catch { return [] }
}

export default async function NewsletterAdminPage() {
  const subscribers = await getSubscribers()
  const active      = subscribers.filter((s) => s.isActive).length
  const inactive    = subscribers.length - active

  const STATS = [
    { label: 'Total Subscribers', value: subscribers.length, Icon: FiUsers,     color: 'bg-pink-50 text-pink-600',    border: 'border-pink-100' },
    { label: 'Active',            value: active,             Icon: FiUserCheck,  color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: 'Unsubscribed',      value: inactive,           Icon: FiUserX,      color: 'bg-gray-50 text-gray-500',    border: 'border-gray-200' },
  ]

  return (
    <AdminShell
      title="Newsletter Subscribers"
      subtitle={`${active} active subscribers`}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {STATS.map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <s.Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none">{s.value}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <NewsletterActions subscribers={subscribers} />
    </AdminShell>
  )
}

import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import NewsletterActions from './NewsletterActions'

async function getSubscribers() {
  try { return await prisma.newsletterSubscriber.findMany({ }) }
  // try { return await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } }) }
  catch { return [] }
}

export default async function NewsletterAdminPage() {
  const subscribers = await getSubscribers()
  const active = subscribers.filter((s) => s.isActive).length

  return (
    <AdminShell title="Newsletter Subscribers">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Total Subscribers</p>
          <p className="text-3xl font-bold text-gray-800">{subscribers.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">{active}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Unsubscribed</p>
          <p className="text-3xl font-bold text-gray-400">{subscribers.length - active}</p>
        </div>
      </div>
      <NewsletterActions subscribers={subscribers} />
    </AdminShell>
  )
}

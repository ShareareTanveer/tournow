import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import ReviewsTable from './ReviewsTable'
import { FiAlertTriangle } from 'react-icons/fi'

async function getReviews() {
  try {
    return await prisma.review.findMany({
      include: { package: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    })
  } catch { return [] }
}

export default async function ReviewsAdminPage() {
  const reviews  = await getReviews()
  const pending  = reviews.filter((r) => r.status === 'PENDING').length
  const approved = reviews.filter((r) => r.status === 'APPROVED').length

  return (
    <AdminShell
      title="Reviews"
      subtitle={`${reviews.length} total · ${approved} approved · ${pending} pending`}
    >
      {pending > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl mb-5">
          <FiAlertTriangle size={16} className="text-amber-500 shrink-0" />
          <span>
            <strong>{pending}</strong> review{pending > 1 ? 's' : ''} pending approval — review and approve or reject them below.
          </span>
        </div>
      )}
      <ReviewsTable reviews={reviews} />
    </AdminShell>
  )
}

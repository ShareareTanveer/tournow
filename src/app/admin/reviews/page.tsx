import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import ReviewsTable from './ReviewsTable'

async function getReviews() {
  try {
    return await prisma.review.findMany({
      include: { package: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    })
  } catch { return [] }
}

export default async function ReviewsAdminPage() {
  const reviews = await getReviews()
  const pending = reviews.filter((r) => r.status === 'PENDING').length
  return (
    <AdminShell title="Reviews">
      {pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-xl mb-5">
          ⚠️ {pending} review{pending > 1 ? 's' : ''} pending approval
        </div>
      )}
      <ReviewsTable reviews={reviews} />
    </AdminShell>
  )
}

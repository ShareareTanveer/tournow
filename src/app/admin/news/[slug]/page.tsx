import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import NewsForm from '../NewsForm'

type Props = { params: Promise<{ slug: string }> }

export default async function EditNewsPage({ params }: Props) {
  const { slug } = await params
  const news = await prisma.news.findUnique({ where: { slug } }).catch(() => null)
  if (!news) notFound()
  return (
    <AdminShell title="Edit News Article">
      <NewsForm news={news} />
    </AdminShell>
  )
}

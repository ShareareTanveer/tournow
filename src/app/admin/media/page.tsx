import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import MediaLibraryClient from './MediaLibraryClient'

async function getMedia() {
  try {
    return await prisma.media.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  } catch { return [] }
}

export default async function MediaPage() {
  const items = await getMedia()
  return (
    <AdminShell title="Media Library" subtitle={`${items.length} files`}>
      <MediaLibraryClient initialItems={items} />
    </AdminShell>
  )
}

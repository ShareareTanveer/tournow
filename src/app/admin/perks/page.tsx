import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PerksTabs from './PerksTabs'

async function getData() {
  const [perks, pendingCount] = await Promise.all([
    prisma.perk.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
    prisma.claimedPerk.count({ where: { status: 'PENDING' } }).catch(() => 0),
  ])
  return { perks, pendingCount }
}

export default async function PerksAdminPage() {
  const { perks, pendingCount } = await getData()
  return (
    <AdminShell title="Perks Management">
      <PerksTabs perks={perks} pendingCount={pendingCount} />
    </AdminShell>
  )
}

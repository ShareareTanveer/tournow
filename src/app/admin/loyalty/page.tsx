import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import LoyaltyTable from './LoyaltyTable'
import LoyaltyProgramSettings from './LoyaltyProgramSettings'
import { FiUsers, FiSettings } from 'react-icons/fi'
import LoyaltyTabs from './LoyaltyTabs'

async function getData() {
  const [cards, settingsRows] = await Promise.all([
    prisma.loyaltyCard.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.siteSetting.findMany({ where: { key: { startsWith: 'loyalty_' } } }).catch(() => []),
  ])
  const settings: Record<string, string> = {}
  settingsRows.forEach(r => { settings[r.key] = r.value })
  return { cards, settings }
}

export default async function LoyaltyAdminPage() {
  const { cards, settings } = await getData()

  const tiers = { BRONZE: 0, SILVER: 0, GOLD: 0 }
  cards.forEach((c) => { if (c.tier in tiers) (tiers as any)[c.tier]++ })

  return (
    <AdminShell title="Privilege Card Program" subtitle={`${cards.length} cards issued`}>
      <LoyaltyTabs
        cards={cards}
        settings={settings}
        tiers={tiers}
      />
    </AdminShell>
  )
}

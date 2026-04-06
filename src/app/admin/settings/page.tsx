import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import SettingsForm from './SettingsForm'

async function getSettings() {
  try {
    const rows = await prisma.siteSetting.findMany()
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  } catch { return {} }
}

export default async function SettingsAdminPage() {
  const settings = await getSettings()
  return (
    <AdminShell title="Site Settings">
      <SettingsForm settings={settings} />
    </AdminShell>
  )
}

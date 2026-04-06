import AdminShell from '@/components/admin/AdminShell'
import PerkForm from '../PerkForm'

export const metadata = { title: 'New Perk' }

export default function NewPerkPage() {
  return (
    <AdminShell title="Add New Perk">
      <PerkForm />
    </AdminShell>
  )
}

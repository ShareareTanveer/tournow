import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import CharityTable from './CharityTable'
import { FiHeart, FiCheckCircle, FiDollarSign, FiClock } from 'react-icons/fi'

async function getDonations() {
  try { return await prisma.charityDonation.findMany({ orderBy: { createdAt: 'desc' } }) }
  catch { return [] }
}

export default async function CharityAdminPage() {
  const donations = await getDonations()
  const total     = donations.reduce((sum, d: any) => sum + (d.amount ?? 0), 0)
  const completed = donations.filter((d: any) => d.status === 'COMPLETED').length
  const pending   = donations.filter((d: any) => d.status === 'PENDING').length

  const STATS = [
    { label: 'Total Donations', value: donations.length, Icon: FiHeart,       color: 'bg-rose-50 text-rose-500',    border: 'border-rose-100' },
    { label: 'Completed',       value: completed,        Icon: FiCheckCircle, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: 'Pending',         value: pending,          Icon: FiClock,       color: 'bg-amber-50 text-amber-600',  border: 'border-amber-100' },
    { label: 'Total Amount',    value: `LKR ${total.toLocaleString()}`, Icon: FiDollarSign, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
  ]

  return (
    <AdminShell
      title="Charity Donations"
      subtitle={`${donations.length} donations · LKR ${total.toLocaleString()} raised`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {STATS.map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <s.Icon size={18} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{s.value}</p>
              <p className="text-[11px] font-medium text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <CharityTable donations={donations} />
    </AdminShell>
  )
}

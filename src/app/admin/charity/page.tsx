import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import CharityTable from './CharityTable'

async function getDonations() {
  try { return await prisma.charityDonation.findMany({ orderBy: { createdAt: 'desc' } }) }
  catch { return [] }
}

export default async function CharityAdminPage() {
  const donations = await getDonations()
  const total = donations.reduce((sum, d:any) => sum + (d.amount ?? 0), 0)
  const completed = donations.filter((d:any) => d.status === 'COMPLETED').length

  return (
    <AdminShell title="Charity Donations">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Total Donations</p>
          <p className="text-3xl font-bold text-gray-800">{donations.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600">{completed}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 col-span-2">
          <p className="text-xs text-gray-400 font-medium mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-orange-600">LKR {total.toLocaleString()}</p>
        </div>
      </div>
      <CharityTable donations={donations} />
    </AdminShell>
  )
}

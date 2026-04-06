import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeleteBtn from '@/components/admin/DeleteBtn'
import { FiPlus } from 'react-icons/fi'

async function getStaff() {
  try { return await prisma.staff.findMany({ orderBy: { name: 'asc' } }) }
  catch { return [] }
}

export default async function StaffAdminPage() {
  const staff = await getStaff()
  return (
    <AdminShell title="Staff">
      <div className="flex justify-end mb-5">
        <Link href="/admin/staff/new" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"><FiPlus size={15} /> Add Staff</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {staff.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-200 px-6 py-12 text-center text-gray-400">No staff members yet</div>
        )}
        {staff.map((s:any) => (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {s.imageUrl ? (
                <img src={s.imageUrl} alt={s.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold">
                  {s.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800">{s.name}</p>
                <p className="text-xs text-orange-600">{s.role}</p>
              </div>
            </div>
            {s.bio && <p className="text-xs text-gray-500 line-clamp-3">{s.bio}</p>}
            <div className="flex items-center justify-between mt-auto">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {s.isActive ? 'Active' : 'Hidden'}
              </span>
              <div className="flex gap-3">
                <Link href={`/admin/staff/${s.id}`} className="text-orange-500 hover:underline text-xs font-medium">Edit</Link>
                <DeleteBtn url={`/api/staff/${s.id}`} label="Delete" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}

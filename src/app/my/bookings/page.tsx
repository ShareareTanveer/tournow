import Link from 'next/link'
import { FiCalendar, FiMapPin } from 'react-icons/fi'

export const metadata = { title: 'My Bookings' }

export default function MyBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Your upcoming and past trips.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiCalendar size={28} className="text-blue-400" />
        </div>
        <h2 className="font-bold text-gray-700 text-base">No bookings yet</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
          Once you book a holiday package, your trips will appear here with all the details.
        </p>
        <Link href="/packages-from-sri-lanka/family"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
          <FiMapPin size={14} /> Browse Packages
        </Link>
      </div>
    </div>
  )
}

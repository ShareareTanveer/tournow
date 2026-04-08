'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminBookingModal from '@/components/admin/AdminBookingModal'

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  CONVERTED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-500',
}

export default function InquiriesTable({
  inquiries,
  staff,
}: {
  inquiries: any[]
  staff: any[]
}) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)
  const [convertingInquiry, setConvertingInquiry] = useState<any | null>(null)
  const [bookingTarget, setBookingTarget] = useState<any | null>(null)
  const [fetchingTarget, setFetchingTarget] = useState(false)
  const [successMessage, setSuccessMessage] = useState<{ bookingRef: string; isNewAccount: boolean } | null>(null)

  const updateInquiry = async (id: string, data: Record<string, string>) => {
    setUpdating(id)
    await fetch(`/api/inquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.refresh()
    setUpdating(null)
  }

  const openConvertModal = async (inquiry: any) => {
    setConvertingInquiry(inquiry)
    setFetchingTarget(true)
    setSuccessMessage(null)

    try {
      // Fetch the package or tour details
      const targetType = inquiry.packageId ? 'package' : 'tour'
      const targetId = inquiry.packageId || inquiry.tourId || ''

      if (!targetId) {
        alert('Cannot determine package/tour for this inquiry')
        setConvertingInquiry(null)
        return
      }

      const endpoint =
        targetType === 'package'
          ? `/api/packages/${inquiry.package?.slug || targetId}`
          : `/api/tours/${targetId}`

      const res = await fetch(endpoint)
      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()
      setBookingTarget({
        id: data.id || data.slug,
        type: targetType,
        title: data.title,
        price: data.price,
        priceTwin: data.priceTwin,
        priceChild: data.priceChild,
        extraNightPrice: data.extraNightPrice,
        duration: data.duration,
        nights: data.nights,
        paxType: data.paxType,
        options: data.options,
        cancellationTiers: data.cancellationTiers,
        cancellationPolicy: data.cancellationPolicy,
      })
    } catch {
      alert('Failed to load package/tour details')
      setConvertingInquiry(null)
    } finally {
      setFetchingTarget(false)
    }
  }

  const closeModal = () => {
    setConvertingInquiry(null)
    setBookingTarget(null)
    setSuccessMessage(null)
  }

  const handleConvertSuccess = (bookingRef: string, isNewAccount: boolean) => {
    setSuccessMessage({ bookingRef, isNewAccount })
    router.refresh()
    // Auto-close after 3 seconds
    setTimeout(() => {
      closeModal()
    }, 3000)
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Email', 'Phone', 'Package / Destination', 'Message', 'Status', 'Assigned To', 'Date', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inquiries.length === 0 && (
              <tr><td colSpan={9} className="px-5 py-10 text-center text-gray-400">No inquiries yet</td></tr>
            )}
            {inquiries.map((inq) => (
              <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-semibold text-gray-800">{inq.name}</td>
                <td className="px-5 py-3"><a href={`mailto:${inq.email}`} className="text-orange-500 hover:underline">{inq.email}</a></td>
                <td className="px-5 py-3 text-gray-500">{inq.phone ?? '—'}</td>
                <td className="px-5 py-3 text-gray-600 max-w-[160px] truncate">{inq.package?.title ?? inq.destination ?? '—'}</td>
                <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate" title={inq.message}>{inq.message}</td>
                <td className="px-5 py-3">
                  <select
                    value={inq.status}
                    disabled={updating === inq.id}
                    onChange={(e) => updateInquiry(inq.id, { status: e.target.value })}
                    className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[inq.status]}`}
                  >
                    {['NEW','CONTACTED','CONVERTED','CLOSED'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <select
                    value={inq.assignedTo?.id ?? ''}
                    disabled={updating === inq.id}
                    onChange={(e) => updateInquiry(inq.id, { assignedToId: e.target.value || null as any })}
                    className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(inq.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  {inq.status !== 'CONVERTED' && inq.status !== 'CLOSED' && (
                    <button
                      onClick={() => openConvertModal(inq)}
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap"
                    >
                      Convert to Booking
                    </button>
                  )}
                  {inq.status === 'CONVERTED' && (
                    <span className="text-xs text-green-600 font-semibold">Converted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admin Booking Modal */}
      {convertingInquiry && bookingTarget && (
        <AdminBookingModal
          open={true}
          onClose={closeModal}
          target={bookingTarget}
          customer={{
            name: convertingInquiry.name,
            email: convertingInquiry.email,
            phone: convertingInquiry.phone,
          }}
          inquiryId={convertingInquiry.id}
          onSuccess={handleConvertSuccess}
        />
      )}

      {/* Success overlay */}
      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Created!</h3>
            <p className="text-gray-600 mb-1">Booking Ref: <strong className="text-orange-600">{successMessage.bookingRef}</strong></p>
            {successMessage.isNewAccount && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-3">
                New customer account created. Credentials sent via email.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

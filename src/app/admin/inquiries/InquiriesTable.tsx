'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminBookingModal from '@/components/admin/AdminBookingModal'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import { FiMail, FiPhone } from 'react-icons/fi'

const STATUS_STYLE: Record<string, string> = {
  NEW:       'bg-blue-50 text-blue-700 border border-blue-100',
  CONTACTED: 'bg-amber-50 text-amber-700 border border-amber-100',
  CONVERTED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  CLOSED:    'bg-gray-100 text-gray-500 border border-gray-200',
}

export default function InquiriesTable({
  inquiries,
  staff,
}: {
  inquiries: any[]
  staff: any[]
}) {
  const router  = useRouter()
  const esRef   = useRef<EventSource | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  // Auto-refresh when a new inquiry arrives via SSE
  useEffect(() => {
    const connect = () => {
      const es = new EventSource('/api/admin/notifications/stream')
      esRef.current = es
      es.onmessage = (e) => {
        try {
          const notif = JSON.parse(e.data)
          if (notif.type === 'NEW_INQUIRY') router.refresh()
        } catch {}
      }
      es.onerror = () => { es.close(); setTimeout(connect, 5000) }
    }
    connect()
    return () => esRef.current?.close()
  }, [router])

  const [convertingInquiry, setConvertingInquiry]    = useState<any | null>(null)
  const [bookingTarget, setBookingTarget]             = useState<any | null>(null)
  const [fetchingTarget, setFetchingTarget]           = useState(false)
  const [successMessage, setSuccessMessage]           = useState<{ bookingRef: string; isNewAccount: boolean } | null>(null)

  const updateInquiry = async (id: string, data: Record<string, any>) => {
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
      const targetType = inquiry.packageId ? 'package' : 'tour'
      const targetId   = inquiry.packageId || inquiry.tourId || ''
      if (!targetId) { alert('Cannot determine package/tour for this inquiry'); setConvertingInquiry(null); return }
      const endpoint = targetType === 'package'
        ? `/api/packages/${inquiry.package?.slug || targetId}`
        : `/api/tours/${targetId}`
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setBookingTarget({
        id: data.id || data.slug, type: targetType, title: data.title,
        price: data.price, priceTwin: data.priceTwin, priceChild: data.priceChild,
        extraNightPrice: data.extraNightPrice, duration: data.duration, nights: data.nights,
        paxType: data.paxType, options: data.options,
        cancellationTiers: data.cancellationTiers, cancellationPolicy: data.cancellationPolicy,
      })
    } catch { alert('Failed to load package/tour details'); setConvertingInquiry(null) }
    finally { setFetchingTarget(false) }
  }

  const closeModal        = () => { setConvertingInquiry(null); setBookingTarget(null); setSuccessMessage(null) }
  const handleSuccess     = (bookingRef: string, isNewAccount: boolean) => {
    setSuccessMessage({ bookingRef, isNewAccount })
    router.refresh()
    setTimeout(closeModal, 3000)
  }

  const columns: Column[] = [
    {
      key: 'name', label: 'Customer', sortable: true,
      render: inq => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-400 to-amber-500 flex items-center justify-center text-white text-xs font-black shrink-0">
            {inq.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">{inq.name}</p>
            <a href={`mailto:${inq.email}`} className="text-[11px] text-indigo-500 hover:underline flex items-center gap-1 mt-0.5">
              <FiMail size={9} /> {inq.email}
            </a>
            {inq.phone && (
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <FiPhone size={9} /> {inq.phone}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'package', label: 'Package / Dest.', sortable: false,
      render: inq => (
        <p className="text-sm text-gray-600 max-w-40 line-clamp-1">
          {inq.package?.title ?? inq.destination ?? <span className="text-gray-300">—</span>}
        </p>
      ),
    },
    {
      key: 'message', label: 'Message',
      render: inq => (
        <p className="text-xs text-gray-500 max-w-48 line-clamp-2" title={inq.message}>{inq.message}</p>
      ),
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: inq => (
        <select
          value={inq.status}
          disabled={updating === inq.id}
          onChange={e => updateInquiry(inq.id, { status: e.target.value })}
          className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-full cursor-pointer focus:outline-none disabled:opacity-50 border-0 ${STATUS_STYLE[inq.status] ?? 'bg-gray-100 text-gray-500'}`}
        >
          {['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'assignedTo', label: 'Assigned To',
      render: inq => (
        <select
          value={inq.assignedTo?.id ?? ''}
          disabled={updating === inq.id}
          onChange={e => updateInquiry(inq.id, { assignedToId: e.target.value || null })}
          className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-300 bg-white disabled:opacity-50"
        >
          <option value="">Unassigned</option>
          {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      ),
    },
    {
      key: 'createdAt', label: 'Date', sortable: true,
      render: inq => (
        <span className="text-xs text-gray-400">
          {new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Action',
      render: inq => inq.status !== 'CONVERTED' && inq.status !== 'CLOSED' ? (
        <button
          onClick={() => openConvertModal(inq)}
          disabled={fetchingTarget}
          className="text-xs bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        >
          Convert →
        </button>
      ) : inq.status === 'CONVERTED' ? (
        <span className="text-xs text-emerald-600 font-semibold">Converted</span>
      ) : null,
    },
  ]

  return (
    <>
      <AdminTable
        data={inquiries}
        columns={columns}
        filterKey="status"
        filterOptions={['ALL', 'NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']}
        searchKeys={['name', 'email', 'phone', 'message', 'destination']}
        defaultSort={{ key: 'createdAt', dir: 'desc' }}
        emptyMessage="No inquiries yet"
      />

      {convertingInquiry && bookingTarget && (
        <AdminBookingModal
          open={true}
          onClose={closeModal}
          target={bookingTarget}
          customer={{ name: convertingInquiry.name, email: convertingInquiry.email, phone: convertingInquiry.phone }}
          inquiryId={convertingInquiry.id}
          onSuccess={handleSuccess}
        />
      )}

      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Created!</h3>
            <p className="text-gray-600 mb-1">Booking Ref: <strong className="text-indigo-600">{successMessage.bookingRef}</strong></p>
            {successMessage.isNewAccount && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mt-3">
                New customer account created. Credentials sent via email.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

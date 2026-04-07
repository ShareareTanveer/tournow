'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  CONVERTED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-500',
}

type LineItem = { label: string; price: number }

type ConvertForm = {
  type: 'package' | 'tour'
  packageId: string
  tourId: string
  travelDate: string
  paxAdult: number
  paxChild: number
  paxInfant: number
  lineItems: LineItem[]
  totalPrice: string
  notes: string
  adminNotes: string
  phone: string
}

const DEFAULT_FORM: ConvertForm = {
  type: 'package',
  packageId: '',
  tourId: '',
  travelDate: '',
  paxAdult: 1,
  paxChild: 0,
  paxInfant: 0,
  lineItems: [{ label: '', price: 0 }],
  totalPrice: '',
  notes: '',
  adminNotes: '',
  phone: '',
}

export default function InquiriesTable({
  inquiries,
  staff,
  packages,
  tours,
}: {
  inquiries: any[]
  staff: any[]
  packages: { id: string; title: string }[]
  tours: { id: string; title: string }[]
}) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)
  const [convertTarget, setConvertTarget] = useState<any | null>(null)
  const [form, setForm] = useState<ConvertForm>(DEFAULT_FORM)
  const [converting, setConverting] = useState(false)
  const [convertResult, setConvertResult] = useState<{ bookingRef: string; isNewAccount: boolean } | null>(null)
  const [error, setError] = useState('')

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

  const openConvert = (inq: any) => {
    setConvertTarget(inq)
    setForm({
      ...DEFAULT_FORM,
      phone: inq.phone ?? '',
      travelDate: inq.travelDate ? new Date(inq.travelDate).toISOString().slice(0, 10) : '',
      paxAdult: inq.paxCount ?? 1,
      // Pre-fill package if inquiry has one
      packageId: inq.packageId ?? '',
      type: inq.packageId ? 'package' : 'package',
    })
    setConvertResult(null)
    setError('')
  }

  const closeModal = () => {
    setConvertTarget(null)
    setConvertResult(null)
    setError('')
  }

  const addLineItem = () => setForm(f => ({ ...f, lineItems: [...f.lineItems, { label: '', price: 0 }] }))
  const removeLineItem = (i: number) => setForm(f => ({ ...f, lineItems: f.lineItems.filter((_, idx) => idx !== i) }))
  const updateLineItem = (i: number, field: keyof LineItem, value: string | number) => {
    setForm(f => {
      const items = [...f.lineItems]
      items[i] = { ...items[i], [field]: field === 'price' ? Number(value) : value }
      return { ...f, lineItems: items }
    })
  }

  const autoTotal = form.lineItems.reduce((s, it) => s + (it.price || 0), 0)

  const handleConvert = async () => {
    setError('')
    if (!form.travelDate) { setError('Travel date is required'); return }
    if (form.type === 'package' && !form.packageId) { setError('Select a package'); return }
    if (form.type === 'tour' && !form.tourId) { setError('Select a tour'); return }
    if (form.lineItems.some(li => !li.label)) { setError('All line item labels are required'); return }

    const totalPrice = form.totalPrice ? Number(form.totalPrice) : autoTotal
    if (!totalPrice) { setError('Total price must be greater than 0'); return }

    setConverting(true)
    try {
      const res = await fetch(`/api/inquiries/${convertTarget.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          packageId: form.type === 'package' ? form.packageId : undefined,
          tourId: form.type === 'tour' ? form.tourId : undefined,
          travelDate: form.travelDate,
          paxAdult: form.paxAdult,
          paxChild: form.paxChild,
          paxInfant: form.paxInfant,
          phone: form.phone || undefined,
          staffQuote: {
            lineItems: form.lineItems,
            totalPrice,
            notes: form.notes || undefined,
          },
          adminNotes: form.adminNotes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to convert'); return }
      setConvertResult({ bookingRef: data.bookingRef, isNewAccount: data.isNewAccount })
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setConverting(false)
    }
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
                      onClick={() => openConvert(inq)}
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

      {/* ── Convert Modal ────────────────────────────────────────────────────── */}
      {convertTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Convert Inquiry to Booking</h2>
                <p className="text-sm text-gray-500 mt-0.5">{convertTarget.name} · {convertTarget.email}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            {convertResult ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Created!</h3>
                <p className="text-gray-600 mb-1">Booking Ref: <strong className="text-orange-600">{convertResult.bookingRef}</strong></p>
                {convertResult.isNewAccount && (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-3">
                    A new customer account was created. Login credentials have been sent to <strong>{convertTarget.email}</strong>.
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-3">
                  Quote email sent. Customer can review and confirm from their account.
                </p>
                <div className="flex gap-3 justify-center mt-6">
                  <button onClick={closeModal} className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Close</button>
                  <a href="/admin/bookings" className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600">View Bookings</a>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Customer info (read-only display) */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  <strong>Inquiry from:</strong> {convertTarget.name} ({convertTarget.email})
                  {convertTarget.message && <p className="mt-1 text-blue-600 italic">"{convertTarget.message}"</p>}
                </div>

                {/* Phone override */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+94 7X XXX XXXX"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {/* Booking type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Type</label>
                  <div className="flex gap-3">
                    {(['package', 'tour'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`flex-1 py-2 rounded-lg border text-sm font-semibold capitalize transition-colors ${
                          form.type === t
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'border-gray-200 text-gray-600 hover:border-orange-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Package / Tour select */}
                {form.type === 'package' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Package</label>
                    <select
                      value={form.packageId}
                      onChange={e => setForm(f => ({ ...f, packageId: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      <option value="">— Select a package —</option>
                      {packages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tour</label>
                    <select
                      value={form.tourId}
                      onChange={e => setForm(f => ({ ...f, tourId: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      <option value="">— Select a tour —</option>
                      {tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                  </div>
                )}

                {/* Travel date + pax */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Travel Date</label>
                    <input
                      type="date"
                      value={form.travelDate}
                      onChange={e => setForm(f => ({ ...f, travelDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Adults</label>
                    <input
                      type="number" min={1}
                      value={form.paxAdult}
                      onChange={e => setForm(f => ({ ...f, paxAdult: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Children</label>
                    <input
                      type="number" min={0}
                      value={form.paxChild}
                      onChange={e => setForm(f => ({ ...f, paxChild: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Infants</label>
                    <input
                      type="number" min={0}
                      value={form.paxInfant}
                      onChange={e => setForm(f => ({ ...f, paxInfant: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                </div>

                {/* Quote line items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Quote Line Items</label>
                    <button
                      onClick={addLineItem}
                      className="text-xs text-orange-500 hover:text-orange-700 font-semibold"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.lineItems.map((item, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Description (e.g. Hotel 3 nights)"
                          value={item.label}
                          onChange={e => updateLineItem(i, 'label', e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        <input
                          type="number"
                          placeholder="LKR"
                          value={item.price || ''}
                          onChange={e => updateLineItem(i, 'price', e.target.value)}
                          className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        {form.lineItems.length > 1 && (
                          <button onClick={() => removeLineItem(i)} className="text-red-400 hover:text-red-600 text-lg leading-none px-1">&times;</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-right text-sm text-gray-600">
                    Auto total: <strong>LKR {autoTotal.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Manual total override */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Total Override <span className="text-xs text-gray-400 font-normal">(leave blank to use sum above)</span>
                  </label>
                  <input
                    type="number"
                    placeholder={`LKR ${autoTotal.toLocaleString()}`}
                    value={form.totalPrice}
                    onChange={e => setForm(f => ({ ...f, totalPrice: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {/* Notes to customer */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notes to Customer</label>
                  <textarea
                    rows={2}
                    placeholder="Any special notes included in the quote email…"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  />
                </div>

                {/* Internal admin notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Internal Admin Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Internal notes (not sent to customer)…"
                    value={form.adminNotes}
                    onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConvert}
                    disabled={converting}
                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    {converting ? 'Creating Booking…' : 'Create Booking & Send Email'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

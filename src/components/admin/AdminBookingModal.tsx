'use client'

import { useState, useEffect } from 'react'
import { FiX, FiCheckCircle, FiChevronRight, FiInfo, FiMinus, FiPlus } from 'react-icons/fi'

interface PricingOption {
  label: string
  price: number
  isDefault?: boolean
}

interface CancellationTier {
  daysBeforeDep: number
  refundPercent: number
  label: string
}

interface BookingTarget {
  id: string
  type: 'package' | 'tour'
  title: string
  price: number
  priceTwin?: number | null
  priceChild?: number | null
  extraNightPrice?: number | null
  duration: number
  nights: number
  paxType?: string | null
  options?: PricingOption[] | null
  cancellationTiers?: CancellationTier[] | null
  cancellationPolicy?: string | null
}

interface RoomSelection {
  type: string
  label: string
  qty: number
  unitPrice: number
}

interface InquiryCustomer {
  name: string
  email: string
  phone?: string | null
}

interface Props {
  open: boolean
  onClose: () => void
  /** The package or tour to book */
  target: BookingTarget
  /** Pre-filled from inquiry */
  customer: InquiryCustomer
  /** The inquiry ID to convert */
  inquiryId: string
  onSuccess: (bookingRef: string, isNewAccount: boolean) => void
}

const ROOM_CONFIG = [
  { type: 'SINGLE', label: 'Single Room', description: '1 person' },
  { type: 'TWIN', label: 'Twin Sharing', description: '2 persons sharing', discounted: true },
  { type: 'DOUBLE', label: 'Double Room', description: '2 persons' },
  { type: 'TRIPLE', label: 'Triple Room', description: 'Up to 3 persons' },
]

type Step = 'dates' | 'rooms' | 'options' | 'summary'

export default function AdminBookingModal({ open, onClose, target, customer, inquiryId, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('dates')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Customer info (admin can edit)
  const [cName, setCName] = useState(customer.name)
  const [cEmail, setCEmail] = useState(customer.email)
  const [cPhone, setCPhone] = useState(customer.phone ?? '')

  const [form, setForm] = useState({
    travelDate: '',
    returnDate: '',
    paxAdult: 1,
    paxChild: 0,
    paxInfant: 0,
    extraNights: 0,
    extraNightPrice: target.extraNightPrice ?? 0,
    priceChild: target.priceChild ?? Math.round(target.price * 0.7),
    notes: '',
    adminNotes: '',
  })

  // Room selections — unitPrice is editable by admin
  const [rooms, setRooms] = useState<RoomSelection[]>([])

  // Options with admin-editable prices
  const [options, setOptions] = useState<(PricingOption & { selected: boolean })[]>(
    (target.options ?? []).map(o => ({ ...o, selected: false }))
  )

  // Admin can override total if needed (e.g. phone-negotiated price)
  const [totalOverride, setTotalOverride] = useState('')

  useEffect(() => {
    if (open) {
      setStep('dates')
      setError('')
      setCName(customer.name)
      setCEmail(customer.email)
      setCPhone(customer.phone ?? '')
      setRooms([])
      setOptions((target.options ?? []).map(o => ({ ...o, selected: false })))
      setTotalOverride('')
      setForm({
        travelDate: '',
        returnDate: '',
        paxAdult: 1,
        paxChild: 0,
        paxInfant: 0,
        extraNights: 0,
        extraNightPrice: target.extraNightPrice ?? 0,
        priceChild: target.priceChild ?? Math.round(target.price * 0.7),
        notes: '',
        adminNotes: '',
      })
    }
  }, [open, customer, target])

  if (!open) return null

  function getRoomDefaultPrice(type: string): number {
    if (type === 'TWIN' && target.priceTwin) return target.priceTwin
    return target.price
  }

  function setRoomQty(type: string, label: string, qty: number) {
    setRooms(prev => {
      const existing = prev.find(r => r.type === type)
      const next = prev.filter(r => r.type !== type)
      if (qty > 0) {
        next.push({ type, label, qty, unitPrice: existing?.unitPrice ?? getRoomDefaultPrice(type) })
      }
      return next
    })
  }

  function setRoomUnitPrice(type: string, price: number) {
    setRooms(prev => prev.map(r => r.type === type ? { ...r, unitPrice: price } : r))
  }

  function getRoomQty(type: string) { return rooms.find(r => r.type === type)?.qty ?? 0 }
  function getRoomUnitPrice(type: string) {
    return rooms.find(r => r.type === type)?.unitPrice ?? getRoomDefaultPrice(type)
  }

  const totalRooms = rooms.reduce((s, r) => s + r.qty, 0)

  const roomTotal = rooms.reduce((s, r) => s + r.unitPrice * r.qty * form.paxAdult, 0)
  const childTotal = form.priceChild * form.paxChild
  const extraTotal = form.extraNightPrice * form.extraNights * (form.paxAdult + form.paxChild)
  const optionsTotal = options.filter(o => o.selected).reduce((s, o) => s + o.price * form.paxAdult, 0)
  const computedTotal = roomTotal + childTotal + extraTotal + optionsTotal
  const finalTotal = totalOverride ? Number(totalOverride) : computedTotal

  function toggleOption(label: string) {
    setOptions(prev => prev.map(o => o.label === label ? { ...o, selected: !o.selected } : o))
  }

  function updateOptionPrice(label: string, price: number) {
    setOptions(prev => prev.map(o => o.label === label ? { ...o, price } : o))
  }

  async function submit() {
    setLoading(true)
    setError('')
    try {
      // Build quote line items from selections
      const lineItems: { label: string; price: number }[] = []
      rooms.forEach(r => {
        lineItems.push({
          label: `${r.label} × ${r.qty} room${r.qty > 1 ? 's' : ''} × ${form.paxAdult} adult${form.paxAdult > 1 ? 's' : ''}`,
          price: r.unitPrice * r.qty * form.paxAdult,
        })
      })
      if (form.paxChild > 0) {
        lineItems.push({ label: `Children (${form.paxChild})`, price: childTotal })
      }
      if (extraTotal > 0) {
        lineItems.push({ label: `Extra nights (${form.extraNights})`, price: extraTotal })
      }
      options.filter(o => o.selected).forEach(o => {
        lineItems.push({ label: o.label, price: o.price * form.paxAdult })
      })
      if (totalOverride) {
        lineItems.push({ label: 'Total (as agreed)', price: Number(totalOverride) })
      }

      const res = await fetch(`/api/inquiries/${inquiryId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: target.type,
          ...(target.type === 'package' ? { packageId: target.id } : { tourId: target.id }),
          customerName: cName,
          customerEmail: cEmail,
          phone: cPhone || undefined,
          travelDate: form.travelDate,
          returnDate: form.returnDate || undefined,
          paxAdult: form.paxAdult,
          paxChild: form.paxChild,
          paxInfant: form.paxInfant,
          rooms: rooms.map(r => ({ type: r.type, qty: r.qty, label: r.label })),
          pricePerPerson: target.price,
          priceTwin: target.priceTwin,
          extraNights: form.extraNights,
          extraNightPrice: form.extraNightPrice,
          selectedOptions: options.filter(o => o.selected).map(o => ({ label: o.label, price: o.price })),
          staffQuote: {
            lineItems,
            totalPrice: finalTotal,
            notes: form.notes || undefined,
          },
          adminNotes: form.adminNotes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      onSuccess(data.bookingRef, data.isNewAccount)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canGoToRooms = form.travelDate && form.paxAdult >= 1
  const canGoToOptions = totalRooms > 0
  const stepOrder: Step[] = ['dates', 'rooms', 'options', 'summary']

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] mt-4">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-xs text-indigo-500 mb-0.5 uppercase tracking-wide font-bold">Admin — Convert to Booking</p>
            <h2 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 max-w-[340px]">{target.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 shrink-0 ml-2">
            <FiX size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 pt-3 pb-1 gap-1 shrink-0">
          {stepOrder.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                stepOrder.indexOf(step) >= i ? 'bg-indigo-400' : 'bg-gray-200'
              }`} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* ── STEP 1: Dates & Pax ── */}
          {step === 'dates' && (
            <>
              {/* Customer info — editable */}
              <Section title="Customer">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Name</label>
                      <input type="text" value={cName} onChange={e => setCName(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Phone</label>
                      <input type="text" value={cPhone} onChange={e => setCPhone(e.target.value)}
                        placeholder="+94 7X XXX XXXX"
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Email</label>
                    <input type="email" value={cEmail} onChange={e => setCEmail(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
              </Section>

              <Section title="Travel Dates">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Departure Date *</label>
                    <input type="date" required
                      value={form.travelDate}
                      onChange={e => setForm(f => ({ ...f, travelDate: e.target.value }))}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Return Date</label>
                    <input type="date"
                      min={form.travelDate}
                      value={form.returnDate}
                      onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
              </Section>

              <Section title="Travellers">
                <div className="grid grid-cols-3 gap-3">
                  <Counter label="Adults" min={1} value={form.paxAdult}
                    onChange={v => setForm(f => ({ ...f, paxAdult: v }))} />
                  <Counter label="Children" sub="2–11 yrs" min={0} value={form.paxChild}
                    onChange={v => setForm(f => ({ ...f, paxChild: v }))} />
                  <Counter label="Infants" sub="Under 2" min={0} value={form.paxInfant}
                    onChange={v => setForm(f => ({ ...f, paxInfant: v }))} />
                </div>
                {form.paxChild > 0 && (
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Child price / person</label>
                    <PriceInput value={form.priceChild} onChange={v => setForm(f => ({ ...f, priceChild: v }))} />
                  </div>
                )}
              </Section>

              <Section title="Extra Nights">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Additional nights</p>
                    <div className="flex items-center gap-2 mt-1">
                      <label className="text-xs text-gray-400">LKR / night / person</label>
                      <PriceInput value={form.extraNightPrice} onChange={v => setForm(f => ({ ...f, extraNightPrice: v }))} small />
                    </div>
                  </div>
                  <Counter label="" min={0} max={14} value={form.extraNights}
                    onChange={v => setForm(f => ({ ...f, extraNights: v }))} />
                </div>
              </Section>
            </>
          )}

          {/* ── STEP 2: Room Selection ── */}
          {step === 'rooms' && (
            <Section title="Select Rooms">
              <p className="text-xs text-gray-400 mb-4">
                Choose room types and quantities. <span className="text-indigo-500 font-semibold">Edit prices below to customise the quote.</span>
              </p>
              <div className="space-y-3">
                {ROOM_CONFIG.map(rc => {
                  const qty = getRoomQty(rc.type)
                  const unitPrice = getRoomUnitPrice(rc.type)
                  const isSelected = qty > 0
                  return (
                    <div key={rc.type}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        isSelected ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
                            {rc.label}
                          </p>
                          <p className="text-xs text-gray-400">{rc.description}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <button type="button"
                            onClick={() => setRoomQty(rc.type, rc.label, Math.max(0, qty - 1))}
                            disabled={qty === 0}
                            className="w-8 h-8 rounded-full border-2 border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-500 font-bold flex items-center justify-center disabled:opacity-30 transition-colors">
                            <FiMinus size={14} />
                          </button>
                          <span className="w-6 text-center font-bold text-gray-800 text-sm">{qty}</span>
                          <button type="button"
                            onClick={() => setRoomQty(rc.type, rc.label, qty + 1)}
                            className="w-8 h-8 rounded-full border-2 border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-500 font-bold flex items-center justify-center transition-colors">
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>
                      {/* Editable price — always shown so admin can set before selecting */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Price / person:</span>
                        <PriceInput
                          value={unitPrice}
                          onChange={v => {
                            // If not yet selected, update the default so it's ready
                            if (isSelected) {
                              setRoomUnitPrice(rc.type, v)
                            } else {
                              // Temporarily store as selected with qty 0 won't work;
                              // we update when they pick qty
                              setRooms(prev => {
                                const hasEntry = prev.find(r => r.type === rc.type)
                                if (hasEntry) return prev.map(r => r.type === rc.type ? { ...r, unitPrice: v } : r)
                                // Pre-stage with qty=0 so price is remembered
                                return [...prev, { type: rc.type, label: rc.label, qty: 0, unitPrice: v }]
                              })
                            }
                          }}
                          small
                        />
                        {rc.type === 'TWIN' && target.priceTwin && (
                          <span className="text-xs text-gray-400">default: {target.priceTwin.toLocaleString()}</span>
                        )}
                        {rc.type !== 'TWIN' && (
                          <span className="text-xs text-gray-400">default: {target.price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {totalRooms === 0 && (
                <p className="text-xs text-indigo-500 mt-3 flex items-center gap-1">
                  <FiInfo size={12} /> Select at least one room to continue.
                </p>
              )}
            </Section>
          )}

          {/* ── STEP 3: Options & Extras ── */}
          {step === 'options' && (
            <>
              {options.length > 0 ? (
                <Section title="Add-ons & Extras">
                  <p className="text-xs text-gray-400 mb-3">
                    Toggle options and <span className="text-indigo-500 font-semibold">edit prices</span> as needed (price per adult).
                  </p>
                  <div className="space-y-2">
                    {options.map((opt) => (
                      <div key={opt.label}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${
                          opt.selected ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100'
                        }`}>
                        <button type="button" onClick={() => toggleOption(opt.label)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            opt.selected ? 'border-indigo-400 bg-indigo-400' : 'border-gray-300'
                          }`}>
                            {opt.selected && <FiCheckCircle size={12} className="text-white" />}
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate">{opt.label}</span>
                          {opt.isDefault && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold shrink-0">Included</span>
                          )}
                        </button>
                        <div className="ml-3 shrink-0">
                          <PriceInput
                            value={opt.price}
                            onChange={v => updateOptionPrice(opt.label, v)}
                            small
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FiCheckCircle size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No options configured for this {target.type}</p>
                </div>
              )}

              <Section title="Notes to Customer">
                <textarea rows={3} placeholder="Notes included in the quote email (e.g. special terms, inclusions…)"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-400 resize-none" />
              </Section>

              <Section title="Internal Admin Notes">
                <textarea rows={2} placeholder="Internal notes (not visible to customer)"
                  value={form.adminNotes}
                  onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-400 resize-none" />
              </Section>
            </>
          )}

          {/* ── STEP 4: Summary ── */}
          {step === 'summary' && (
            <>
              <Section title="Customer">
                <div className="text-sm text-gray-700 space-y-0.5">
                  <p><span className="font-semibold">{cName}</span></p>
                  <p className="text-gray-500">{cEmail} {cPhone && `· ${cPhone}`}</p>
                </div>
              </Section>

              <Section title="Booking Details">
                <div className="space-y-2 text-sm">
                  <Row label="Travel Date" value={new Date(form.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  {form.returnDate && <Row label="Return Date" value={new Date(form.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />}
                  <Row label="Travellers"
                    value={`${form.paxAdult} Adult${form.paxAdult > 1 ? 's' : ''}${form.paxChild > 0 ? `, ${form.paxChild} Child` : ''}${form.paxInfant > 0 ? `, ${form.paxInfant} Infant` : ''}`} />
                </div>
              </Section>

              <Section title="Rooms">
                <div className="space-y-1">
                  {rooms.filter(r => r.qty > 0).map(r => (
                    <div key={r.type} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-600">{r.label} × {r.qty}</span>
                      <span className="font-semibold text-gray-800">LKR {r.unitPrice.toLocaleString()} / person</span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Quote Breakdown">
                <div className="space-y-1.5 text-sm">
                  {rooms.filter(r => r.qty > 0).map(r => (
                    <Row key={r.type}
                      label={`${r.label} × ${r.qty} × ${form.paxAdult} adult${form.paxAdult > 1 ? 's' : ''}`}
                      value={`LKR ${(r.unitPrice * r.qty * form.paxAdult).toLocaleString()}`} />
                  ))}
                  {form.paxChild > 0 && <Row label={`Children (${form.paxChild})`} value={`LKR ${childTotal.toLocaleString()}`} />}
                  {extraTotal > 0 && <Row label={`Extra nights (${form.extraNights})`} value={`LKR ${extraTotal.toLocaleString()}`} />}
                  {options.filter(o => o.selected).map(o => (
                    <Row key={o.label} label={o.label}
                      value={o.price > 0 ? `LKR ${(o.price * form.paxAdult).toLocaleString()}` : 'Included'} />
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-gray-900">Total</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Override:</span>
                        <input
                          type="number"
                          placeholder={computedTotal.toLocaleString()}
                          value={totalOverride}
                          onChange={e => setTotalOverride(e.target.value)}
                          className="w-32 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-400 text-right"
                        />
                      </div>
                    </div>
                    <p className="text-right font-black text-xl text-indigo-500 mt-1">
                      LKR {finalTotal.toLocaleString()}
                    </p>
                    {totalOverride && (
                      <p className="text-right text-xs text-amber-600">Computed: LKR {computedTotal.toLocaleString()} — using override</p>
                    )}
                  </div>
                </div>
              </Section>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-2">
                <FiInfo size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  A customer account will be created if one doesn't exist. An email with the quote and login credentials will be sent to <strong>{cEmail}</strong>. Status will be set to <strong>Awaiting Confirmation</strong>.
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-white">
          {step !== 'dates' ? (
            <button
              onClick={() => {
                const prev: Record<Step, Step> = { dates: 'dates', rooms: 'dates', options: 'rooms', summary: 'options' }
                setStep(prev[step])
              }}
              className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50">
              ← Back
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            {step !== 'summary' && finalTotal > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Total</p>
                <p className="font-black text-base text-indigo-500">LKR {finalTotal.toLocaleString()}</p>
              </div>
            )}
            {step === 'dates' && (
              <button onClick={() => setStep('rooms')} disabled={!canGoToRooms}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm disabled:opacity-40 transition-all">
                Choose Rooms <FiChevronRight size={14} />
              </button>
            )}
            {step === 'rooms' && (
              <button onClick={() => setStep('options')} disabled={!canGoToOptions}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm disabled:opacity-40 transition-all">
                Continue <FiChevronRight size={14} />
              </button>
            )}
            {step === 'options' && (
              <button onClick={() => setStep('summary')}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all">
                Review Quote <FiChevronRight size={14} />
              </button>
            )}
            {step === 'summary' && (
              <button onClick={submit} disabled={loading}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold text-sm transition-all">
                {loading ? 'Creating…' : 'Create Booking & Send Email'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  )
}

function Counter({ label, sub, min = 0, max = 20, value, onChange }: {
  label: string; sub?: string; min?: number; max?: number; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="text-center">
      {label && <p className="text-xs font-semibold text-gray-600 mb-0.5">{label}</p>}
      {sub && <p className="text-[10px] text-gray-400 mb-1">{sub}</p>}
      <div className="flex items-center justify-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full border-2 border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-500 font-bold text-base flex items-center justify-center transition-colors">
          −
        </button>
        <span className="w-6 text-center font-bold text-gray-800">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full border-2 border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-500 font-bold text-base flex items-center justify-center transition-colors">
          +
        </button>
      </div>
    </div>
  )
}

function PriceInput({ value, onChange, small }: { value: number; onChange: (v: number) => void; small?: boolean }) {
  return (
    <input
      type="number"
      min={0}
      value={value || ''}
      onChange={e => onChange(Number(e.target.value))}
      onClick={e => e.stopPropagation()}
      className={`border border-indigo-200 bg-white rounded-lg focus:outline-none focus:border-indigo-400 text-right font-semibold text-indigo-700
        ${small ? 'w-24 px-2 py-0.5 text-xs' : 'w-32 px-3 py-1.5 text-sm'}`}
    />
  )
}

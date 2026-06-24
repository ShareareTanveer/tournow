'use client'

import { useState, useEffect } from 'react'
import { FiX, FiCheckCircle, FiChevronRight, FiInfo, FiMinus, FiPlus } from 'react-icons/fi'
import { useCustomerAuth } from '@/lib/customerAuth'
import AuthModal from '@/components/auth/AuthModal'

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
  unitPrice: number  // price per person per room
}

interface Props {
  open: boolean
  onClose: () => void
  target: BookingTarget
}

const ROOM_CONFIG = [
  { type: 'SINGLE', label: 'Single Room', description: '1 person' },
  { type: 'TWIN', label: 'Twin Sharing', description: '2 persons sharing', discounted: true },
  { type: 'DOUBLE', label: 'Double Room', description: '2 persons' },
  { type: 'TRIPLE', label: 'Triple Room', description: 'Up to 3 persons' },
]

type Step = 'dates' | 'rooms' | 'options' | 'summary' | 'done'

export default function BookingModal({ open, onClose, target }: Props) {
  const { customer } = useCustomerAuth()

  const [step, setStep] = useState<Step>('dates')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    travelDate: '',
    returnDate: '',
    paxAdult: 1,
    paxChild: 0,
    paxInfant: 0,
    extraNights: 0,
    isAirfareIncluded: false,
    selectedOptions: [] as PricingOption[],
    notes: '',
  })

  // rooms: array of { type, label, qty, unitPrice }
  const [rooms, setRooms] = useState<RoomSelection[]>([])

  const [bookingRef, setBookingRef] = useState('')

  useEffect(() => {
    if (open) {
      setStep('dates')
      setError('')
      setBookingRef('')
      setRooms([])
    }
  }, [open])

  if (!open) return null

  if (!customer) {
    return (
      <AuthModal
        open={true}
        onClose={onClose}
        onSuccess={() => {}}
        initialTab="login"
      />
    )
  }

  function getRoomPrice(type: string): number {
    if (type === 'TWIN' && target.priceTwin) return target.priceTwin
    return target.price
  }

  function setRoomQty(type: string, label: string, qty: number) {
    setRooms(prev => {
      const next = prev.filter(r => r.type !== type)
      if (qty > 0) {
        next.push({ type, label, qty, unitPrice: getRoomPrice(type) })
      }
      return next
    })
  }

  function getRoomQty(type: string): number {
    return rooms.find(r => r.type === type)?.qty ?? 0
  }

  const totalRooms = rooms.reduce((s, r) => s + r.qty, 0)

  // Price calculation — rooms × qty × paxAdult (estimate), admin will set final
  const roomTotal = rooms.reduce((s, r) => s + r.unitPrice * r.qty * form.paxAdult, 0)
  const childTotal = (target.priceChild ?? target.price * 0.7) * form.paxChild
  const extraTotal = (target.extraNightPrice ?? 0) * form.extraNights * (form.paxAdult + form.paxChild)
  const optionsTotal = form.selectedOptions.reduce((s, o) => s + o.price * form.paxAdult, 0)
  // On step 1 (before rooms chosen), use base price × adults so the footer total updates live
  const step1AdultTotal = step === 'dates' && rooms.length === 0 ? target.price * form.paxAdult : 0
  const grandTotal = (roomTotal || step1AdultTotal) + childTotal + extraTotal + optionsTotal

  function toggleOption(opt: PricingOption) {
    setForm(f => {
      const exists = f.selectedOptions.some(o => o.label === opt.label)
      return {
        ...f,
        selectedOptions: exists
          ? f.selectedOptions.filter(o => o.label !== opt.label)
          : [...f.selectedOptions, opt],
      }
    })
  }

  async function submitBooking() {
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...(target.type === 'package' ? { packageId: target.id } : { tourId: target.id }),
        customerId: customer?.id,
        customerName: customer?.name,
        customerEmail: customer?.email,
        customerPhone: customer?.phone ?? '',
        travelDate: form.travelDate,
        returnDate: form.returnDate || undefined,
        paxAdult: form.paxAdult,
        paxChild: form.paxChild,
        paxInfant: form.paxInfant,
        rooms: rooms.map(r => ({ type: r.type, qty: r.qty, label: r.label })),
        isAirfareIncluded: form.isAirfareIncluded,
        pricePerPerson: target.price,
        priceTwin: target.priceTwin,
        extraNights: form.extraNights,
        extraNightPrice: target.extraNightPrice,
        selectedOptions: form.selectedOptions,
        totalPrice: grandTotal || target.price * form.paxAdult,
        notes: form.notes,
      }

      const endpoint = target.type === 'package' ? '/api/bookings' : '/api/tour-bookings'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Booking failed'); return }
      setBookingRef(data.bookingRef)
      setStep('done')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canGoToRooms = form.travelDate && form.paxAdult >= 1
  const canGoToOptions = totalRooms > 0

  const stepOrder: Step[] = ['dates', 'rooms', 'options', 'summary']
  const brandBtn = 'linear-gradient(135deg, #007f89, #063c43)'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#101817]/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative mt-12 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[#d8ded9] bg-[#fbfaf7] shadow-[0_28px_90px_rgba(0,0,0,0.30)]">
        {/* Header */}
        <div className="shrink-0 border-b border-[#e3e7e3] bg-white/90 px-6 pb-4 pt-5">
          <div className="flex items-start justify-between">
          <div>
            <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#007f89]">Book Now</p>
            <h2 className="line-clamp-2 max-w-[340px] text-base font-black leading-snug text-[#17211f]">{target.title}</h2>
          </div>
          <button onClick={onClose} className="ml-2 shrink-0 rounded-lg border border-[#d8ded9] bg-white p-2 hover:bg-[#f4efe6]">
            <FiX size={18} className="text-[#52615d]" />
          </button>
          </div>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="flex shrink-0 gap-1 px-6 pb-1 pt-3">
            {stepOrder.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`h-1 flex-1 rounded-full transition-colors ${
                  stepOrder.indexOf(step) >= i ? 'bg-[#007f89]' : 'bg-[#dce3df]'
                }`} />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">

          {/* ── STEP 1: Dates & Pax ── */}
          {step === 'dates' && (
            <>
              <Section title="Travel Dates">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Departure Date *</label>
                    <input type="date" required
                      min={new Date().toISOString().split('T')[0]}
                      value={form.travelDate}
                      onChange={e => setForm(f => ({ ...f, travelDate: e.target.value }))}
                      className="w-full rounded-lg border border-[#d8ded9] bg-white px-3 py-2.5 text-sm text-[#17211f] outline-none focus:border-[#007f89] focus:ring-2 focus:ring-[#007f89]/10" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Return Date</label>
                    <input type="date"
                      min={form.travelDate || new Date().toISOString().split('T')[0]}
                      value={form.returnDate}
                      onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))}
                      className="w-full rounded-lg border border-[#d8ded9] bg-white px-3 py-2.5 text-sm text-[#17211f] outline-none focus:border-[#007f89] focus:ring-2 focus:ring-[#007f89]/10" />
                  </div>
                </div>
              </Section>

              <Section title="Travellers">
                <div className="grid grid-cols-3 gap-3">
                  <Counter label="Adults" min={1} value={form.paxAdult}
                    priceHint={`LKR ${target.price.toLocaleString()}/pax`}
                    onChange={v => setForm(f => ({ ...f, paxAdult: v }))} />
                  <Counter label="Children" sub="2–11 yrs" min={0} value={form.paxChild}
                    priceHint={target.priceChild ? `LKR ${target.priceChild.toLocaleString()}/pax` : `LKR ${Math.round(target.price * 0.7).toLocaleString()}/pax`}
                    onChange={v => setForm(f => ({ ...f, paxChild: v }))} />
                  <Counter label="Infants" sub="Under 2" min={0} value={form.paxInfant}
                    priceHint="Free"
                    onChange={v => setForm(f => ({ ...f, paxInfant: v }))} />
                </div>
              </Section>

              <Section title="Airfare">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.isAirfareIncluded}
                      onChange={e => setForm(f => ({ ...f, isAirfareIncluded: e.target.checked }))}
                    />
                    <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${
                      form.isAirfareIncluded ? 'border-[#007f89] bg-[#007f89]' : 'border-[#cfd8d3] bg-white'
                    }`}>
                      {form.isAirfareIncluded && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight text-[#17211f]">Include airfare in booking</p>
                    <p className="mt-0.5 text-xs text-[#6f7d79]">Request flight tickets as part of your package. Our team will add the airfare cost to your quote.</p>
                  </div>
                </label>
              </Section>

              {target.extraNightPrice && (
                <Section title="Extra Nights">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">Add extra nights</p>
                      <p className="text-xs text-gray-400">LKR {target.extraNightPrice.toLocaleString()} / night / person</p>
                    </div>
                    <Counter label="" min={0} max={7} value={form.extraNights}
                      onChange={v => setForm(f => ({ ...f, extraNights: v }))} />
                  </div>
                </Section>
              )}
            </>
          )}

          {/* ── STEP 2: Room Selection ── */}
          {step === 'rooms' && (
            <Section title="Select Rooms">
              <p className="text-xs text-gray-400 mb-4">Choose room types and quantities. You can mix room types.</p>
              <div className="space-y-3">
                {ROOM_CONFIG.map(rc => {
                  const qty = getRoomQty(rc.type)
                  const unitPrice = getRoomPrice(rc.type)
                  const isSelected = qty > 0
                  return (
                    <div key={rc.type}
                      className={`flex items-center justify-between rounded-lg border-2 p-4 transition-colors ${
                        isSelected ? 'border-[#007f89] bg-[#edf8f6]' : 'border-[#e6ebe8] bg-white'
                      }`}>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-[#063c43]' : 'text-[#17211f]'}`}>
                          {rc.label}
                        </p>
                        <p className="text-xs text-[#6f7d79]">{rc.description}</p>
                        <p className="mt-0.5 text-xs font-bold text-[#007f89]">
                          LKR {unitPrice.toLocaleString()} / person
                          {rc.discounted && target.priceTwin && target.priceTwin < target.price && (
                            <span className="ml-1 text-[#3f8f64]">(best value)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <button type="button"
                          onClick={() => setRoomQty(rc.type, rc.label, Math.max(0, qty - 1))}
                          disabled={qty === 0}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#d8ded9] font-bold text-[#52615d] transition-colors hover:border-[#007f89] hover:text-[#007f89] disabled:opacity-30">
                          <FiMinus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-[#17211f]">{qty}</span>
                        <button type="button"
                          onClick={() => setRoomQty(rc.type, rc.label, qty + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#d8ded9] font-bold text-[#52615d] transition-colors hover:border-[#007f89] hover:text-[#007f89]">
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {totalRooms === 0 && (
                <p className="mt-3 flex items-center gap-1 text-xs text-[#007f89]">
                  <FiInfo size={12} /> Please select at least one room to continue.
                </p>
              )}
            </Section>
          )}

          {/* ── STEP 3: Options & Extras ── */}
          {step === 'options' && (
            <>
              {target.options && target.options.length > 0 ? (
                <Section title="Add-ons & Extras">
                  <p className="text-xs text-gray-400 mb-3">Select optional extras (price per adult)</p>
                  <div className="space-y-2">
                    {target.options.map((opt) => {
                      const selected = form.selectedOptions.some(o => o.label === opt.label)
                      return (
                        <button key={opt.label} type="button" onClick={() => toggleOption(opt)}
                          className={`flex w-full items-center justify-between rounded-lg border-2 p-3 transition-colors ${
                            selected ? 'border-[#007f89] bg-[#edf8f6]' : 'border-[#e6ebe8] bg-white hover:border-[#d8ded9]'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              selected ? 'border-[#007f89] bg-[#007f89]' : 'border-[#cfd8d3]'
                            }`}>
                              {selected && <FiCheckCircle size={12} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                            {opt.isDefault && (
                              <span className="rounded-full bg-[#ecf7f0] px-1.5 py-0.5 text-[10px] font-semibold text-[#3f8f64]">Included</span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-[#007f89]">
                            {opt.price > 0 ? `+ LKR ${opt.price.toLocaleString()}` : 'Free'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </Section>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FiCheckCircle size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No optional extras for this package</p>
                </div>
              )}

              <Section title="Special Requests">
                <textarea rows={3} placeholder="Any dietary requirements, special occasions, accessibility needs..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full resize-none rounded-lg border border-[#d8ded9] bg-white px-3 py-2.5 text-sm text-[#17211f] outline-none focus:border-[#007f89] focus:ring-2 focus:ring-[#007f89]/10" />
              </Section>
            </>
          )}

          {/* ── STEP 4: Summary ── */}
          {step === 'summary' && (
            <>
              <Section title="Booking Summary">
                <div className="space-y-2 text-sm">
                  <Row label="Travel Date" value={new Date(form.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  {form.returnDate && <Row label="Return Date" value={new Date(form.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />}
                  <Row label="Travellers"
                    value={`${form.paxAdult} Adult${form.paxAdult > 1 ? 's' : ''}${form.paxChild > 0 ? `, ${form.paxChild} Child` : ''}${form.paxInfant > 0 ? `, ${form.paxInfant} Infant` : ''}`} />
                  <Row label="Airfare" value={form.isAirfareIncluded ? 'Requested — team will quote' : 'Not included'} />
                </div>
              </Section>

              <Section title="Rooms Selected">
                <div className="space-y-2">
                  {rooms.map(r => (
                    <div key={r.type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                      <span className="text-gray-700">{r.label}</span>
                      <span className="font-semibold text-gray-800">{r.qty} room{r.qty > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Estimated Price Breakdown">
                <div className="space-y-1.5 text-sm">
                  {rooms.map(r => (
                    <Row key={r.type} label={`${r.label} × ${r.qty} × ${form.paxAdult} adult${form.paxAdult > 1 ? 's' : ''}`}
                      value={`LKR ${(r.unitPrice * r.qty * form.paxAdult).toLocaleString()}`} />
                  ))}
                  {form.paxChild > 0 && <Row label={`Children (${form.paxChild})`} value={`LKR ${childTotal.toLocaleString()}`} />}
                  {extraTotal > 0 && <Row label="Extra nights" value={`LKR ${extraTotal.toLocaleString()}`} />}
                  {form.selectedOptions.map(o => (
                    <Row key={o.label} label={o.label} value={o.price > 0 ? `LKR ${(o.price * form.paxAdult).toLocaleString()}` : 'Included'} />
                  ))}
                  <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-gray-900">
                    <span>Estimated Total</span>
                    <span className="text-lg text-[#007f89]">LKR {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </Section>

              {(target.cancellationTiers || target.cancellationPolicy) && (
                <Section title="Cancellation Policy">
                  {target.cancellationTiers ? (
                    <div className="space-y-1.5">
                      {target.cancellationTiers.map((t, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                          <span>{t.label}</span>
                          <span className={`font-semibold ${t.refundPercent === 100 ? 'text-[#3f8f64]' : t.refundPercent === 0 ? 'text-red-500' : 'text-[#007f89]'}`}>
                            {t.refundPercent}% refund
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">{target.cancellationPolicy}</p>
                  )}
                </Section>
              )}

              <div className="flex gap-2 rounded-lg border border-[#f0e2c4] bg-[#fff9ee] p-4">
                <FiInfo size={14} className="mt-0.5 shrink-0 text-[#c99a45]" />
                <p className="text-xs text-[#8a6730]">
                  This is an estimate. Our team will review your request and send you a personalised quote with the final price.
                </p>
              </div>
            </>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ecf7f0]">
                <FiCheckCircle size={32} className="text-[#3f8f64]" />
              </div>
              <h3 className="mb-1 text-xl font-bold text-[#17211f]">Booking Requested!</h3>
              <p className="mb-4 text-sm text-[#6f7d79]">
                Reference: <span className="font-mono font-bold text-[#17211f]">{bookingRef.slice(-8).toUpperCase()}</span>
              </p>
              <p className="mx-auto mb-6 max-w-xs text-sm text-[#52615d]">
                Our team will prepare a personalised quote for your trip and notify you at <strong>{customer?.email}</strong>.
              </p>
              <div className="space-y-2">
                <a href="/my/bookings"
                  className="block w-full rounded-lg py-2.5 text-sm font-semibold text-white"
                  style={{ background: brandBtn }}>
                  View My Bookings
                </a>
                <button onClick={onClose}
                  className="block w-full rounded-lg border border-[#d8ded9] py-2.5 text-sm font-semibold text-[#52615d] hover:bg-white">
                  Close
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {step !== 'done' && (
          <div className="shrink-0 border-t border-[#e3e7e3] bg-white px-6 py-4">
            <div className="flex items-center justify-between">
            {step !== 'dates' ? (
              <button
                onClick={() => {
                  const prev: Record<Step, Step> = { dates: 'dates', rooms: 'dates', options: 'rooms', summary: 'options', done: 'summary' }
                  setStep(prev[step])
                }}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[#52615d] hover:bg-[#f4efe6] hover:text-[#17211f]">
                ← Back
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              {step !== 'summary' && grandTotal > 0 && (
                <div className="text-right">
                  <p className="text-xs text-[#8a9691]">Est. Total</p>
                  <p className="text-base font-black text-[#007f89]">LKR {grandTotal.toLocaleString()}</p>
                </div>
              )}
              {step === 'dates' && (
                <button onClick={() => setStep('rooms')} disabled={!canGoToRooms}
                  className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40"
                  style={{ background: brandBtn }}>
                  Choose Rooms <FiChevronRight size={14} />
                </button>
              )}
              {step === 'rooms' && (
                <button onClick={() => setStep('options')} disabled={!canGoToOptions}
                  className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40"
                  style={{ background: brandBtn }}>
                  Continue <FiChevronRight size={14} />
                </button>
              )}
              {step === 'options' && (
                <button onClick={() => setStep('summary')}
                  className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ background: brandBtn }}>
                  Review Booking <FiChevronRight size={14} />
                </button>
              )}
              {step === 'summary' && (
                <button onClick={submitBooking} disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: brandBtn }}>
                  {loading ? 'Submitting...' : 'Send Booking Request'}
                </button>
              )}
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#e6ebe8] bg-white p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#52615d]">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[#52615d]">{label}</span>
      <span className="text-right font-medium text-[#17211f]">{value}</span>
    </div>
  )
}

function Counter({ label, sub, priceHint, min = 0, max = 20, value, onChange }: {
  label: string; sub?: string; priceHint?: string; min?: number; max?: number; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="text-center">
      {label && <p className="mb-0.5 text-xs font-semibold text-[#52615d]">{label}</p>}
      {sub && <p className="mb-0.5 text-[10px] text-[#8a9691]">{sub}</p>}
      {priceHint && <p className="mb-1 text-[10px] font-semibold text-[#007f89]">{priceHint}</p>}
      <div className="flex items-center justify-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#d8ded9] text-base font-bold text-[#52615d] transition-colors hover:border-[#007f89] hover:text-[#007f89]">
          −
        </button>
        <span className="w-6 text-center font-bold text-[#17211f]">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#d8ded9] text-base font-bold text-[#52615d] transition-colors hover:border-[#007f89] hover:text-[#007f89]">
          +
        </button>
      </div>
    </div>
  )
}

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
  const grandTotal = roomTotal + childTotal + extraTotal + optionsTotal

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

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] mt-12">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wide font-semibold">Book Now</p>
            <h2 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 max-w-[340px]">{target.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 shrink-0 ml-2">
            <FiX size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="flex px-6 pt-3 pb-1 gap-1 shrink-0">
            {stepOrder.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`h-1 flex-1 rounded-full transition-colors ${
                  stepOrder.indexOf(step) >= i ? 'bg-orange-400' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

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
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Return Date</label>
                    <input type="date"
                      min={form.travelDate || new Date().toISOString().split('T')[0]}
                      value={form.returnDate}
                      onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400" />
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
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                        isSelected ? 'border-orange-400 bg-orange-50' : 'border-gray-100'
                      }`}>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-orange-700' : 'text-gray-800'}`}>
                          {rc.label}
                        </p>
                        <p className="text-xs text-gray-400">{rc.description}</p>
                        <p className="text-xs font-bold text-orange-600 mt-0.5">
                          LKR {unitPrice.toLocaleString()} / person
                          {rc.discounted && target.priceTwin && target.priceTwin < target.price && (
                            <span className="ml-1 text-green-600">(best value)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <button type="button"
                          onClick={() => setRoomQty(rc.type, rc.label, Math.max(0, qty - 1))}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 font-bold flex items-center justify-center disabled:opacity-30 transition-colors">
                          <FiMinus size={14} />
                        </button>
                        <span className="w-6 text-center font-bold text-gray-800 text-sm">{qty}</span>
                        <button type="button"
                          onClick={() => setRoomQty(rc.type, rc.label, qty + 1)}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 font-bold flex items-center justify-center transition-colors">
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {totalRooms === 0 && (
                <p className="text-xs text-orange-500 mt-3 flex items-center gap-1">
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
                          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${
                            selected ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              selected ? 'border-orange-400 bg-orange-400' : 'border-gray-300'
                            }`}>
                              {selected && <FiCheckCircle size={12} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                            {opt.isDefault && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Included</span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-orange-600">
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
                <textarea rows={3} placeholder="Any dietary requirements, special occasions, accessibility needs…"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400 resize-none" />
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
                    <span className="text-lg text-orange-500">LKR {grandTotal.toLocaleString()}</span>
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
                          <span className={`font-semibold ${t.refundPercent === 100 ? 'text-green-600' : t.refundPercent === 0 ? 'text-red-500' : 'text-orange-500'}`}>
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

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-2">
                <FiInfo size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  This is an estimate. Our team will review your request and send you a personalised quote with the final price.
                </p>
              </div>
            </>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Booking Requested!</h3>
              <p className="text-sm text-gray-500 mb-4">
                Reference: <span className="font-mono font-bold text-gray-800">{bookingRef.slice(-8).toUpperCase()}</span>
              </p>
              <p className="text-sm text-gray-600 mb-6 max-w-xs mx-auto">
                Our team will prepare a personalised quote for your trip and notify you at <strong>{customer?.email}</strong>.
              </p>
              <div className="space-y-2">
                <a href="/my/bookings"
                  className="block w-full py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                  View My Bookings
                </a>
                <button onClick={onClose}
                  className="block w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
                  Close
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {step !== 'done' && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-white">
            {step !== 'dates' ? (
              <button
                onClick={() => {
                  const prev: Record<Step, Step> = { dates: 'dates', rooms: 'dates', options: 'rooms', summary: 'options', done: 'summary' }
                  setStep(prev[step])
                }}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50">
                ← Back
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              {step !== 'summary' && grandTotal > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Est. Total</p>
                  <p className="font-black text-base text-orange-500">LKR {grandTotal.toLocaleString()}</p>
                </div>
              )}
              {step === 'dates' && (
                <button onClick={() => setStep('rooms')} disabled={!canGoToRooms}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                  Choose Rooms <FiChevronRight size={14} />
                </button>
              )}
              {step === 'rooms' && (
                <button onClick={() => setStep('options')} disabled={!canGoToOptions}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                  Continue <FiChevronRight size={14} />
                </button>
              )}
              {step === 'options' && (
                <button onClick={() => setStep('summary')}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                  Review Booking <FiChevronRight size={14} />
                </button>
              )}
              {step === 'summary' && (
                <button onClick={submitBooking} disabled={loading}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                  {loading ? 'Submitting…' : 'Send Booking Request'}
                </button>
              )}
            </div>
          </div>
        )}
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
          className="w-7 h-7 rounded-full border-2 border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 font-bold text-base flex items-center justify-center transition-colors">
          −
        </button>
        <span className="w-6 text-center font-bold text-gray-800">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full border-2 border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 font-bold text-base flex items-center justify-center transition-colors">
          +
        </button>
      </div>
    </div>
  )
}

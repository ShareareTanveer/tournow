'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  FiChevronLeft, FiChevronRight, FiCalendar, FiList, FiGrid,
  FiX, FiUser, FiPhone, FiMail, FiPackage, FiExternalLink,
  FiEdit2, FiFilter, FiAlertCircle, FiClock, FiCheckCircle,
  FiDollarSign, FiUsers, FiSearch, FiChevronsLeft, FiChevronsRight,
} from 'react-icons/fi'

/* ─── Types ──────────────────────────────────────────────────── */
export interface CalendarBooking {
  id: string
  bookingRef: string
  customerName: string
  customerEmail: string
  customerPhone: string
  travelDate: string
  status: string
  paymentStatus: string
  paxAdult: number
  paxChild: number
  totalPrice: number
  createdAt: string
  customerNote: string | null
  title: string
  image: string | null
  _type: 'package' | 'tour'
}

type View = 'month' | 'week' | 'day' | 'agenda'

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  REQUESTED:        { label: 'Requested',        dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  CALL_REQUIRED:    { label: 'Call Required',    dot: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  EDIT_RESEND:      { label: 'Edit & Resend',    dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  AWAITING_CONFIRM: { label: 'Awaiting Confirm', dot: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  CONFIRMED:        { label: 'Confirmed',        dot: 'bg-teal-500',   bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200' },
  RECEIPT_UPLOADED: { label: 'Receipt Uploaded', dot: 'bg-cyan-500',   bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200' },
  ADMIN_CONFIRMING: { label: 'Admin Confirming', dot: 'bg-pink-500',   bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200' },
  ALL_CONFIRMED:    { label: 'All Confirmed',    dot: 'bg-emerald-500',bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200' },
  MAIL_SENT:        { label: 'Mail Sent',        dot: 'bg-green-600',  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  CANCELLED:        { label: 'Cancelled',        dot: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  COMPLETED:        { label: 'Completed',        dot: 'bg-gray-400',   bg: 'bg-gray-100',  text: 'text-gray-600',   border: 'border-gray-200' },
}

const PAY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  UNPAID:   { label: 'Unpaid',    bg: 'bg-red-50',     text: 'text-red-600' },
  PARTIAL:  { label: 'Partial',   bg: 'bg-amber-50',   text: 'text-amber-600' },
  PAID:     { label: 'Paid',      bg: 'bg-emerald-50', text: 'text-emerald-600' },
  REFUNDED: { label: 'Refunded',  bg: 'bg-gray-100',   text: 'text-gray-500' },
}

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

/* ─── Helpers ────────────────────────────────────────────────── */
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function startOfWeek(d: Date) {
  const c = new Date(d); c.setDate(c.getDate() - c.getDay()); c.setHours(0,0,0,0); return c
}
function addDays(d: Date, n: number) { const c = new Date(d); c.setDate(c.getDate() + n); return c }
function addMonths(d: Date, n: number) { const c = new Date(d); c.setMonth(c.getMonth() + n); return c }
function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function isToday(d: Date) { return sameDay(d, new Date()) }

/* ─── Booking Event Pill ─────────────────────────────────────── */
function EventPill({ booking, compact = false, onClick }: {
  booking: CalendarBooking; compact?: boolean; onClick: () => void
}) {
  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.REQUESTED
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate transition-all hover:brightness-95 hover:shadow-sm ${cfg.bg} ${cfg.text} border ${cfg.border}`}
      title={`${booking.customerName} — ${booking.title}`}
    >
      {compact ? (
        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${cfg.dot} align-middle`} />
      ) : null}
      {booking.customerName.split(' ')[0]}
    </button>
  )
}

/* ─── Detail Panel ───────────────────────────────────────────── */
function DetailPanel({ booking, onClose }: { booking: CalendarBooking; onClose: () => void }) {
  const cfg  = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.REQUESTED
  const pay  = PAY_CONFIG[booking.paymentStatus] ?? PAY_CONFIG.UNPAID
  const date = new Date(booking.travelDate)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`px-5 py-4 ${cfg.bg} border-b ${cfg.border} flex items-start justify-between gap-3`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${pay.bg} ${pay.text}`}>
              {pay.label}
            </span>
            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${booking._type === 'tour' ? 'bg-sky-100 text-sky-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {booking._type}
            </span>
          </div>
          <p className="font-black text-gray-900 text-sm leading-tight truncate">{booking.title}</p>
          <p className="text-[11px] text-gray-500 font-mono mt-0.5">{booking.bookingRef.slice(-10).toUpperCase()}</p>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors shrink-0">
          <FiX size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* Travel date */}
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
          <FiCalendar size={18} className="text-indigo-500 shrink-0" />
          <div>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">Travel Date</p>
            <p className="font-bold text-indigo-800">{formatDate(date)}</p>
          </div>
        </div>

        {/* Customer */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</p>
          <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                {booking.customerName[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{booking.customerName}</p>
              </div>
            </div>
            <a href={`mailto:${booking.customerEmail}`}
              className="flex items-center gap-2 text-xs text-indigo-500 hover:underline">
              <FiMail size={11} /> {booking.customerEmail}
            </a>
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <FiPhone size={11} /> {booking.customerPhone}
            </p>
          </div>
        </div>

        {/* Trip info */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trip Details</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
              <FiUsers size={16} className="text-indigo-400 mx-auto mb-1" />
              <p className="font-black text-gray-800">{booking.paxAdult + booking.paxChild}</p>
              <p className="text-[10px] text-gray-400">{booking.paxAdult}A{booking.paxChild > 0 ? ` ${booking.paxChild}C` : ''}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
              <FiDollarSign size={16} className="text-emerald-400 mx-auto mb-1" />
              <p className="font-black text-gray-800 text-sm">LKR {(booking.totalPrice / 1000).toFixed(0)}k</p>
              <p className="text-[10px] text-gray-400">Total</p>
            </div>
          </div>
        </div>

        {/* Customer note */}
        {booking.customerNote && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
            <FiAlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">{booking.customerNote}</p>
          </div>
        )}

        {/* Created */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FiClock size={11} />
          Booked {formatDate(new Date(booking.createdAt))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
        <Link href={`/admin/bookings/${booking.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl transition-colors">
          <FiExternalLink size={13} /> View Detail
        </Link>
        <Link href={`/admin/bookings/${booking.id}/edit`}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl transition-colors">
          <FiEdit2 size={13} /> Edit Quote
        </Link>
      </div>
    </div>
  )
}

/* ─── Month View ─────────────────────────────────────────────── */
function MonthView({ cursor, bookings, onSelect }: {
  cursor: Date; bookings: CalendarBooking[]; onSelect: (b: CalendarBooking) => void
}) {
  const year  = cursor.getFullYear()
  const month = cursor.getMonth()
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)

  // Days to show: pad start + all days + pad end to fill 6-week grid
  const startPad = first.getDay()
  const endPad   = 6 - last.getDay()
  const cells: (Date | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: last.getDate() }, (_, i) => new Date(year, month, i + 1)),
    ...Array.from({ length: endPad }, () => null),
  ]

  const bookingsMap = useMemo(() => {
    const map: Record<string, CalendarBooking[]> = {}
    bookings.forEach(b => {
      const key = b.travelDate.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(b)
    })
    return map
  }, [bookings])

  const today = new Date()

  return (
    <div className="flex-1 flex flex-col">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS.map(d => (
          <div key={d} className="px-2 py-2 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`pad-${i}`} className="border-r border-b border-gray-50 bg-gray-50/40" />
          }
          const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
          const dayBookings = bookingsMap[key] ?? []
          const isCurrentMonth = date.getMonth() === month
          const isCurrentDay = isToday(date)
          const MAX_SHOW = 3

          return (
            <div
              key={key}
              className={`border-r border-b border-gray-100 p-1.5 min-h-24 flex flex-col transition-colors ${
                !isCurrentMonth ? 'bg-gray-50/60' : 'hover:bg-indigo-50/20'
              }`}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                  isCurrentDay
                    ? 'bg-indigo-500 text-white'
                    : !isCurrentMonth
                    ? 'text-gray-300'
                    : 'text-gray-700'
                }`}>
                  {date.getDate()}
                </span>
                {dayBookings.length > 0 && (
                  <span className="text-[9px] font-black text-gray-400">
                    {dayBookings.length > MAX_SHOW ? `+${dayBookings.length - MAX_SHOW + 1} more` : ''}
                  </span>
                )}
              </div>

              {/* Events */}
              <div className="space-y-0.5 flex-1">
                {dayBookings.slice(0, MAX_SHOW).map(b => (
                  <EventPill key={b.id} booking={b} onClick={() => onSelect(b)} />
                ))}
                {dayBookings.length > MAX_SHOW && (
                  <button
                    onClick={() => onSelect(dayBookings[MAX_SHOW])}
                    className="w-full text-left text-[9px] font-bold text-gray-400 hover:text-indigo-500 px-1 py-0.5 rounded transition-colors"
                  >
                    +{dayBookings.length - MAX_SHOW} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Week View ──────────────────────────────────────────────── */
function WeekView({ cursor, bookings, onSelect }: {
  cursor: Date; bookings: CalendarBooking[]; onSelect: (b: CalendarBooking) => void
}) {
  const weekStart = startOfWeek(cursor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 shrink-0">
        {days.map(d => (
          <div key={d.toISOString()} className={`px-2 py-3 text-center border-r border-gray-100 last:border-r-0 ${isToday(d) ? 'bg-indigo-50' : ''}`}>
            <p className="text-[11px] font-bold text-gray-400 uppercase">{DAYS[d.getDay()]}</p>
            <p className={`text-lg font-black mt-0.5 w-8 h-8 flex items-center justify-center rounded-full mx-auto ${
              isToday(d) ? 'bg-indigo-500 text-white' : 'text-gray-700'
            }`}>
              {d.getDate()}
            </p>
          </div>
        ))}
      </div>

      {/* Event rows */}
      <div className="flex-1 grid grid-cols-7 overflow-y-auto">
        {days.map(d => {
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          const dayBookings = bookings.filter(b => b.travelDate.startsWith(key))
          return (
            <div key={key} className={`border-r border-gray-100 last:border-r-0 p-2 space-y-1 min-h-36 ${isToday(d) ? 'bg-indigo-50/30' : ''}`}>
              {dayBookings.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <span className="text-[10px] text-gray-200">—</span>
                </div>
              )}
              {dayBookings.map(b => {
                const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.REQUESTED
                return (
                  <button
                    key={b.id}
                    onClick={() => onSelect(b)}
                    className={`w-full text-left p-2 rounded-lg border ${cfg.bg} ${cfg.border} hover:brightness-95 transition-all`}
                  >
                    <p className={`text-[11px] font-bold truncate ${cfg.text}`}>{b.customerName.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-500 truncate">{b.title}</p>
                    <p className="text-[9px] text-gray-400">{b.paxAdult + b.paxChild} pax</p>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Day View ───────────────────────────────────────────────── */
function DayView({ cursor, bookings, onSelect }: {
  cursor: Date; bookings: CalendarBooking[]; onSelect: (b: CalendarBooking) => void
}) {
  const key = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`
  const dayBookings = bookings.filter(b => b.travelDate.startsWith(key))

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${isToday(cursor) ? 'bg-indigo-500' : 'bg-gray-100'}`}>
          <span className={`text-[11px] font-bold uppercase ${isToday(cursor) ? 'text-indigo-200' : 'text-gray-400'}`}>
            {DAYS[cursor.getDay()]}
          </span>
          <span className={`text-2xl font-black leading-none ${isToday(cursor) ? 'text-white' : 'text-gray-700'}`}>
            {cursor.getDate()}
          </span>
        </div>
        <div>
          <p className="font-black text-gray-900 text-lg">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</p>
          <p className="text-sm text-gray-500">{dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''} today</p>
        </div>
      </div>

      {dayBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <FiCalendar size={28} className="text-gray-300" />
          </div>
          <p className="font-semibold text-gray-400">No bookings on this day</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {dayBookings.map(b => {
            const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.REQUESTED
            const pay = PAY_CONFIG[b.paymentStatus] ?? PAY_CONFIG.UNPAID
            return (
              <button
                key={b.id}
                onClick={() => onSelect(b)}
                className={`w-full text-left p-4 rounded-2xl border ${cfg.border} ${cfg.bg} hover:shadow-md transition-all group`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-sm font-black text-gray-700 shrink-0 border border-white/50">
                      {b.customerName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{b.customerName}</p>
                      <p className={`text-xs truncate ${cfg.text}`}>{b.title}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pay.bg} ${pay.text}`}>
                      {pay.label}
                    </span>
                    <span className="text-xs font-semibold text-gray-600">
                      LKR {(b.totalPrice / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FiUsers size={10} /> {b.paxAdult + b.paxChild} pax</span>
                  <span className={`flex items-center gap-1 font-semibold ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <span className="font-mono text-gray-400 text-[10px]">{b.bookingRef.slice(-8).toUpperCase()}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Agenda View ────────────────────────────────────────────── */
function AgendaView({ bookings, onSelect }: { bookings: CalendarBooking[]; onSelect: (b: CalendarBooking) => void }) {
  const grouped = useMemo(() => {
    const map: Record<string, CalendarBooking[]> = {}
    bookings.forEach(b => {
      const key = b.travelDate.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(b)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [bookings])

  if (grouped.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <FiList size={28} className="text-gray-300" />
        </div>
        <p className="font-semibold text-gray-400">No bookings match your filters</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {grouped.map(([dateKey, dayBookings]) => {
        const date = new Date(dateKey + 'T00:00:00')
        const isPast = date < new Date(new Date().setHours(0,0,0,0))
        return (
          <div key={dateKey}>
            <div className={`px-5 py-2 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10 ${isPast ? 'bg-gray-50' : 'bg-white'}`}>
              <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                isToday(date) ? 'bg-indigo-500' : isPast ? 'bg-gray-200' : 'bg-indigo-50'
              }`}>
                <span className={`text-[9px] font-bold uppercase ${isToday(date) ? 'text-indigo-200' : isPast ? 'text-gray-400' : 'text-indigo-400'}`}>
                  {DAYS[date.getDay()].slice(0,3)}
                </span>
                <span className={`text-sm font-black ${isToday(date) ? 'text-white' : isPast ? 'text-gray-500' : 'text-indigo-700'}`}>
                  {date.getDate()}
                </span>
              </div>
              <div>
                <p className={`text-sm font-bold ${isPast ? 'text-gray-400' : 'text-gray-700'}`}>
                  {MONTHS[date.getMonth()]} {date.getFullYear()}
                </p>
                <p className="text-[11px] text-gray-400">{dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}</p>
              </div>
              {isToday(date) && (
                <span className="ml-auto text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Today</span>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {dayBookings.map(b => {
                const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.REQUESTED
                const pay = PAY_CONFIG[b.paymentStatus] ?? PAY_CONFIG.UNPAID
                return (
                  <button
                    key={b.id}
                    onClick={() => onSelect(b)}
                    className={`w-full text-left px-5 py-3.5 hover:bg-gray-50/60 transition-colors flex items-center gap-4 ${isPast ? 'opacity-60' : ''}`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{b.customerName}</p>
                      <p className="text-xs text-gray-500 truncate">{b.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pay.bg} ${pay.text}`}>{pay.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>{cfg.label}</span>
                      <span className="text-xs font-semibold text-gray-500 hidden sm:inline">LKR {(b.totalPrice/1000).toFixed(0)}k</span>
                      <span className="text-[10px] text-gray-400 font-mono hidden md:inline">{b.bookingRef.slice(-8).toUpperCase()}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Mini Calendar (sidebar) ────────────────────────────────── */
function MiniCalendar({ cursor, setCursor, bookings }: {
  cursor: Date; setCursor: (d: Date) => void; bookings: CalendarBooking[]
}) {
  const [mini, setMini] = useState(new Date(cursor))
  const year = mini.getFullYear()
  const month = mini.getMonth()
  const first = new Date(year, month, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: startPad + daysInMonth }, (_, i) =>
    i < startPad ? null : new Date(year, month, i - startPad + 1)
  )

  const hasBooking = (d: Date) => {
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    return bookings.some(b => b.travelDate.startsWith(k))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 select-none">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setMini(addMonths(mini, -1))} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
          <FiChevronLeft size={13} />
        </button>
        <p className="text-xs font-bold text-gray-700">{MONTHS[month].slice(0,3)} {year}</p>
        <button onClick={() => setMini(addMonths(mini, 1))} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
          <FiChevronRight size={13} />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => <div key={d} className="text-center text-[9px] font-bold text-gray-300 uppercase">{d[0]}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={`mp-${i}`} />
          const isSelected = sameDay(d, cursor)
          const isCurrentDay = isToday(d)
          const hasBk = hasBooking(d)
          return (
            <button
              key={d.toISOString()}
              onClick={() => setCursor(new Date(d))}
              className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold mx-auto transition-colors relative ${
                isSelected
                  ? 'bg-indigo-500 text-white'
                  : isCurrentDay
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {d.getDate()}
              {hasBk && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Stats sidebar ──────────────────────────────────────────── */
function StatsSidebar({ bookings, cursor }: { bookings: CalendarBooking[]; cursor: Date }) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthBookings = bookings.filter(b => {
    const d = new Date(b.travelDate)
    return d.getFullYear() === year && d.getMonth() === month
  })

  const revenue = monthBookings.filter(b => b.paymentStatus === 'PAID').reduce((s, b) => s + b.totalPrice, 0)
  const pending = monthBookings.filter(b => ['REQUESTED','CALL_REQUIRED','EDIT_RESEND','AWAITING_CONFIRM'].includes(b.status)).length
  const confirmed = monthBookings.filter(b => ['CONFIRMED','ALL_CONFIRMED','MAIL_SENT','RECEIPT_UPLOADED','ADMIN_CONFIRMING'].includes(b.status)).length

  const stats = [
    { label: 'This Month', value: monthBookings.length, icon: FiCalendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Pending',    value: pending,               icon: FiClock,    color: 'text-amber-500',  bg: 'bg-amber-50' },
    { label: 'Confirmed',  value: confirmed,             icon: FiCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Revenue',    value: `LKR ${(revenue/1000).toFixed(0)}k`, icon: FiDollarSign, color: 'text-teal-500', bg: 'bg-teal-50' },
  ]

  return (
    <div className="space-y-2">
      {stats.map(s => (
        <div key={s.label} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3 py-2.5">
          <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
            <s.icon size={14} className={s.color} />
          </div>
          <div>
            <p className="font-black text-gray-800 text-sm leading-none">{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Legend ─────────────────────────────────────────────────── */
function Legend({ activeStatuses, toggle }: { activeStatuses: Set<string>; toggle: (s: string) => void }) {
  const entries = Object.entries(STATUS_CONFIG)
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Status Filter</p>
      {entries.map(([key, cfg]) => (
        <button
          key={key}
          onClick={() => toggle(key)}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
            activeStatuses.has(key) ? 'opacity-100' : 'opacity-30'
          } hover:bg-gray-50`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
          <span className="text-[11px] font-semibold text-gray-600 truncate">{cfg.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function BookingCalendar({ bookings }: { bookings: CalendarBooking[] }) {
  const today = new Date()
  today.setHours(0,0,0,0)

  const [view,           setView]      = useState<View>('month')
  const [cursor,         setCursor]    = useState(today)
  const [selected,       setSelected]  = useState<CalendarBooking | null>(null)
  const [search,         setSearch]    = useState('')
  const [activeStatuses, setStatuses]  = useState<Set<string>>(new Set(Object.keys(STATUS_CONFIG)))
  const [activeType,     setType]      = useState<'all' | 'package' | 'tour'>('all')
  const [sidebarOpen,    setSidebar]   = useState(true)

  const toggleStatus = useCallback((s: string) => {
    setStatuses(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }, [])

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (!activeStatuses.has(b.status)) return false
      if (activeType !== 'all' && b._type !== activeType) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (
          !b.customerName.toLowerCase().includes(q) &&
          !b.title.toLowerCase().includes(q) &&
          !b.bookingRef.toLowerCase().includes(q) &&
          !b.customerEmail.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [bookings, activeStatuses, activeType, search])

  /* Navigation */
  const navigate = (dir: -1 | 1) => {
    if (view === 'month') setCursor(addMonths(cursor, dir))
    else if (view === 'week') setCursor(addDays(cursor, dir * 7))
    else setCursor(addDays(cursor, dir))
  }

  const goToday = () => setCursor(new Date(today))

  const titleLabel = useMemo(() => {
    if (view === 'month') return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
    if (view === 'week') {
      const ws = startOfWeek(cursor)
      const we = addDays(ws, 6)
      return ws.getMonth() === we.getMonth()
        ? `${MONTHS[ws.getMonth()]} ${ws.getDate()}–${we.getDate()}, ${ws.getFullYear()}`
        : `${MONTHS[ws.getMonth()]} ${ws.getDate()} – ${MONTHS[we.getMonth()]} ${we.getDate()}, ${ws.getFullYear()}`
    }
    if (view === 'agenda') return 'Upcoming Bookings'
    return formatDate(cursor)
  }, [view, cursor])

  const VIEW_BTNS: { key: View; icon: React.ReactNode; label: string }[] = [
    { key: 'month',  icon: <FiGrid size={13} />,     label: 'Month' },
    { key: 'week',   icon: <FiCalendar size={13} />, label: 'Week' },
    { key: 'day',    icon: <FiList size={13} />,     label: 'Day' },
    { key: 'agenda', icon: <FiList size={13} />,     label: 'Agenda' },
  ]

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)] min-h-150">

      {/* ── Left Sidebar ── */}
      {sidebarOpen && (
        <aside className="w-56 shrink-0 flex flex-col gap-4 overflow-y-auto">
          <MiniCalendar cursor={cursor} setCursor={d => { setCursor(d); setView('day') }} bookings={filteredBookings} />
          <StatsSidebar bookings={bookings} cursor={cursor} />
          <div className="bg-white rounded-2xl border border-gray-100 p-3">
            <Legend activeStatuses={activeStatuses} toggle={toggleStatus} />
          </div>
        </aside>
      )}

      {/* ── Main Calendar ── */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden min-w-0">

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap shrink-0">

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebar(v => !v)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Toggle sidebar"
          >
            <FiFilter size={14} />
          </button>

          {/* Nav */}
          <div className="flex items-center gap-1">
            <button onClick={goToday}
              className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
              Today
            </button>
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <FiChevronLeft size={16} />
            </button>
            <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <FiChevronRight size={16} />
            </button>
          </div>

          {/* Title */}
          <h2 className="font-black text-gray-800 text-base flex-1 min-w-0 truncate">{titleLabel}</h2>

          {/* Search */}
          <div className="relative">
            <FiSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-300 bg-gray-50 w-36"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {(['all','package','tour'] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors capitalize ${
                  activeType === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* View switcher */}
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {VIEW_BTNS.map(v => (
              <button key={v.key} onClick={() => setView(v.key)}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${
                  view === v.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {v.icon}
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          {/* Result count */}
          <span className="text-[11px] font-semibold text-gray-400 shrink-0">
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Calendar body + detail panel */}
        <div className="flex-1 flex overflow-hidden">

          {/* View content */}
          <div className={`flex-1 flex flex-col overflow-hidden transition-all ${selected ? 'hidden lg:flex' : 'flex'}`}>
            {view === 'month'  && <MonthView  cursor={cursor} bookings={filteredBookings} onSelect={setSelected} />}
            {view === 'week'   && <WeekView   cursor={cursor} bookings={filteredBookings} onSelect={setSelected} />}
            {view === 'day'    && <DayView    cursor={cursor} bookings={filteredBookings} onSelect={setSelected} />}
            {view === 'agenda' && <AgendaView bookings={filteredBookings} onSelect={setSelected} />}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-80 shrink-0 border-l border-gray-100 bg-gray-50/40 flex flex-col">
              <DetailPanel booking={selected} onClose={() => setSelected(null)} />
            </div>
          )}
        </div>

        {/* Footer status bar */}
        <div className="px-4 py-2 border-t border-gray-50 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            {Object.entries(STATUS_CONFIG).slice(0, 6).map(([key, cfg]) => {
              const count = filteredBookings.filter(b => b.status === key).length
              if (count === 0) return null
              return (
                <span key={key} className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label} <strong className="text-gray-700">{count}</strong>
                </span>
              )
            })}
          </div>
          <button
            onClick={goToday}
            className="text-[10px] font-semibold text-indigo-500 hover:underline"
          >
            Jump to today
          </button>
        </div>
      </div>
    </div>
  )
}

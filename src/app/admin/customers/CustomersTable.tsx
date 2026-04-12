'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FiSearch, FiUsers, FiBookOpen, FiInbox, FiVideo, FiMail,
  FiCreditCard, FiDollarSign, FiChevronDown, FiChevronUp,
  FiX, FiExternalLink, FiRepeat, FiArrowRight,
} from 'react-icons/fi'
import type { Customer } from './page'

const TIER_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  BRONZE: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  SILVER: { bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400' },
  GOLD:   { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400' },
}

const STATUS_COLOR: Record<string, string> = {
  REQUESTED: 'bg-blue-50 text-blue-600', CONFIRMED: 'bg-teal-50 text-teal-600',
  COMPLETED: 'bg-gray-100 text-gray-500', CANCELLED: 'bg-red-50 text-red-500',
  ALL_CONFIRMED: 'bg-green-50 text-green-600', MAIL_SENT: 'bg-green-100 text-green-700',
}

function fmt(n: number) { return n.toLocaleString() }
function fmtDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-black shrink-0`}>
      {initials}
    </div>
  )
}

function CustomerRow({ customer }: { customer: Customer }) {
  const [expanded, setExpanded] = useState(false)
  const tier = customer.loyalty?.tier
  const tierStyle = tier ? TIER_STYLE[tier] : null
  const isRepeat = customer.totalBookings > 1

  return (
    <>
      <tr
        className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer ${expanded ? 'bg-indigo-50/30' : ''}`}
        onClick={() => setExpanded(v => !v)}
      >
        {/* Customer */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Avatar name={customer.name || customer.email} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-sm text-gray-800 truncate max-w-36">{customer.name || '—'}</p>
                {isRepeat && (
                  <span className="flex items-center gap-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                    <FiRepeat size={7} /> Repeat
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 truncate max-w-40">{customer.email}</p>
              {customer.phone && <p className="text-[10px] text-gray-400">{customer.phone}</p>}
            </div>
          </div>
        </td>

        {/* Bookings */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-gray-800">{customer.totalBookings}</span>
            {customer.totalBookings > 0 && (
              <span className="text-[10px] text-gray-400">
                {customer.bookings.filter(b => b.paymentStatus === 'PAID').length} paid
              </span>
            )}
          </div>
        </td>

        {/* Spend */}
        <td className="px-5 py-3.5">
          <p className="text-sm font-bold text-gray-800">
            {customer.totalSpend > 0 ? `LKR ${fmt(customer.totalSpend)}` : '—'}
          </p>
        </td>

        {/* Inquiries */}
        <td className="px-5 py-3.5">
          <span className="text-sm font-semibold text-gray-600">{customer.totalInquiries}</span>
        </td>

        {/* Loyalty */}
        <td className="px-5 py-3.5">
          {tierStyle && tier ? (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${tierStyle.bg} ${tierStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tierStyle.dot}`} />
              {tier} · {customer.loyalty!.pointsEarned - customer.loyalty!.pointsRedeemed}pts
            </span>
          ) : <span className="text-gray-300 text-xs">—</span>}
        </td>

        {/* Subscriber */}
        <td className="px-5 py-3.5">
          {customer.isSubscriber
            ? <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Subscribed</span>
            : <span className="text-gray-300 text-xs">—</span>}
        </td>

        {/* Last seen */}
        <td className="px-5 py-3.5">
          <p className="text-xs text-gray-500">{fmtDate(customer.lastSeen)}</p>
          <p className="text-[10px] text-gray-400">first: {fmtDate(customer.firstSeen)}</p>
        </td>

        {/* Expand */}
        <td className="px-5 py-3.5 text-right">
          <button className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors">
            {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        </td>
      </tr>

      {/* ── Expanded profile panel ── */}
      {expanded && (
        <tr className="bg-indigo-50/20">
          <td colSpan={8} className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Bookings */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiBookOpen size={13} className="text-indigo-500" />
                  <p className="text-xs font-bold text-gray-700">Bookings ({customer.bookings.length})</p>
                </div>
                {customer.bookings.length === 0 && <p className="text-xs text-gray-400">No bookings yet</p>}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {customer.bookings.sort((a,b) => b.createdAt > a.createdAt ? 1 : -1).map(b => (
                    <div key={b.id} className="flex items-start justify-between gap-2 border-b border-gray-50 pb-1.5 last:border-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{b.title}</p>
                        <p className="text-[10px] font-mono text-gray-400">{b.bookingRef.slice(-8).toUpperCase()}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {b.status.replace(/_/g,' ')}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${b.paymentStatus==='PAID'?'bg-emerald-50 text-emerald-600':b.paymentStatus==='UNPAID'?'bg-red-50 text-red-500':'bg-amber-50 text-amber-600'}`}>
                            {b.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-gray-700">LKR {fmt(b.totalPrice)}</span>
                        <Link href={`/admin/bookings/${b.id}`} onClick={e => e.stopPropagation()}
                          className="p-1 rounded text-gray-400 hover:text-indigo-500 transition-colors">
                          <FiExternalLink size={11} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inquiries + Consultations */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiInbox size={13} className="text-purple-500" />
                  <p className="text-xs font-bold text-gray-700">Inquiries ({customer.inquiries.length})</p>
                </div>
                {customer.inquiries.length === 0
                  ? <p className="text-xs text-gray-400 mb-3">No inquiries</p>
                  : (
                    <div className="space-y-1.5 mb-3 max-h-28 overflow-y-auto">
                      {customer.inquiries.sort((a,b) => b.createdAt > a.createdAt ? 1 : -1).map(i => (
                        <div key={i.id} className="flex items-center justify-between text-xs border-b border-gray-50 pb-1 last:border-0">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            i.status==='CONVERTED'?'bg-emerald-50 text-emerald-600':
                            i.status==='NEW'?'bg-blue-50 text-blue-600':
                            i.status==='CONTACTED'?'bg-amber-50 text-amber-600':
                            'bg-gray-100 text-gray-500'
                          }`}>{i.status}</span>
                          <span className="text-[10px] text-gray-400">{fmtDate(i.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                <div className="flex items-center gap-2 mb-2 pt-2 border-t border-gray-100">
                  <FiVideo size={13} className="text-teal-500" />
                  <p className="text-xs font-bold text-gray-700">Consultations ({customer.consultations.length})</p>
                </div>
                {customer.consultations.length === 0
                  ? <p className="text-xs text-gray-400">No consultations</p>
                  : (
                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                      {customer.consultations.sort((a,b) => b.createdAt > a.createdAt ? 1 : -1).map(c => (
                        <div key={c.id} className="flex items-center justify-between text-xs border-b border-gray-50 pb-1 last:border-0">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            c.status==='COMPLETED'?'bg-emerald-50 text-emerald-600':
                            c.status==='SCHEDULED'?'bg-indigo-50 text-indigo-600':
                            c.status==='CANCELLED'?'bg-red-50 text-red-500':
                            'bg-amber-50 text-amber-600'
                          }`}>{c.status}</span>
                          <span className="text-[10px] text-gray-400">{fmtDate(c.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Summary + quick links */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3">
                <p className="text-xs font-bold text-gray-700">Customer Summary</p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-indigo-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-black text-indigo-700">{customer.totalBookings}</p>
                    <p className="text-[9px] font-semibold text-indigo-500">Bookings</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-black text-emerald-700">
                      {customer.totalSpend > 0 ? `${(customer.totalSpend/1000).toFixed(0)}k` : '0'}
                    </p>
                    <p className="text-[9px] font-semibold text-emerald-500">LKR Spent</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-black text-purple-700">{customer.totalInquiries}</p>
                    <p className="text-[9px] font-semibold text-purple-500">Inquiries</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-black text-amber-700">
                      {customer.loyalty ? customer.loyalty.pointsEarned - customer.loyalty.pointsRedeemed : 0}
                    </p>
                    <p className="text-[9px] font-semibold text-amber-500">Points</p>
                  </div>
                </div>

                <div className="space-y-1.5 mt-auto pt-2 border-t border-gray-100">
                  <a href={`mailto:${customer.email}`}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center justify-between text-xs font-semibold text-gray-600 hover:text-indigo-600 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                    <span className="flex items-center gap-1.5"><FiMail size={11} /> Email customer</span>
                    <FiArrowRight size={10} />
                  </a>
                  <Link href={`/admin/inquiries?search=${encodeURIComponent(customer.email)}`}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center justify-between text-xs font-semibold text-gray-600 hover:text-purple-600 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                    <span className="flex items-center gap-1.5"><FiInbox size={11} /> View inquiries</span>
                    <FiArrowRight size={10} />
                  </Link>
                  <Link href={`/admin/bookings?search=${encodeURIComponent(customer.email)}`}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center justify-between text-xs font-semibold text-gray-600 hover:text-teal-600 px-2 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">
                    <span className="flex items-center gap-1.5"><FiBookOpen size={11} /> View bookings</span>
                    <FiArrowRight size={10} />
                  </Link>
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function CustomersTable({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all'|'repeat'|'active'|'noBooking'>('all')

  const filtered = customers
    .filter(c => {
      if (filterTab === 'repeat')    return c.totalBookings > 1
      if (filterTab === 'active')    return c.totalSpend > 0
      if (filterTab === 'noBooking') return c.totalBookings === 0
      return true
    })
    .filter(c => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      )
    })

  const TABS = [
    { key: 'all',       label: 'All',          count: customers.length },
    { key: 'active',    label: 'Paid',          count: customers.filter(c=>c.totalSpend>0).length },
    { key: 'repeat',    label: 'Repeat',        count: customers.filter(c=>c.totalBookings>1).length },
    { key: 'noBooking', label: 'No Booking',    count: customers.filter(c=>c.totalBookings===0).length },
  ] as const

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

      {/* Toolbar */}
      <div className="px-5 py-3.5 border-b border-gray-100 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or phone…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold">
                <FiX size={13} />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 shrink-0">{filtered.length} of {customers.length} customers</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setFilterTab(t.key)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filterTab === t.key ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                filterTab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Customer', 'Bookings', 'Total Spend', 'Inquiries', 'Loyalty', 'Newsletter', 'Activity', ''].map(h => (
                <th key={h} className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <p className="text-gray-400 text-sm">{search ? `No customers matching "${search}"` : 'No customers found'}</p>
                </td>
              </tr>
            ) : filtered.map(c => (
              <CustomerRow key={c.email} customer={c} />
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing <strong className="text-gray-600">{filtered.length}</strong> customers ·{' '}
            <strong className="text-gray-600">{filtered.filter(c=>c.totalBookings>0).length}</strong> have bookings ·{' '}
            LKR <strong className="text-gray-600">{fmt(filtered.reduce((s,c)=>s+c.totalSpend,0))}</strong> total spend
          </p>
        </div>
      )}
    </div>
  )
}

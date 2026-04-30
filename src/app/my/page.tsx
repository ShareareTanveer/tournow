'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FiTag, FiCalendar, FiChevronRight,
  FiGift, FiClock, FiCheckCircle, FiAlertCircle, FiAward,
} from 'react-icons/fi'

interface LoyaltyCard {
  tier: string
  pointsEarned: number
  pointsRedeemed: number
}

interface ClaimedPerk {
  id: string
  claimedAt: string
  status: string
  perk: {
    id: string
    title: string
    description: string
    iconName: string
    iconColor: string
    bgColor: string
  }
}

interface Booking {
  id: string
  bookingRef: string
  status: string
  travelDate: string
  package?: { title: string } | null
}

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Pending',  cls: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
  USED:     { label: 'Used',     cls: 'bg-gray-100 text-gray-500' },
  EXPIRED:  { label: 'Expired',  cls: 'bg-red-100 text-red-500' },
}

export default function CustomerOverviewPage() {
  const [claimedPerks, setClaimedPerks] = useState<ClaimedPerk[]>([])
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/perks/claim',  { credentials: 'include', cache: 'no-store' }).then(r => r.ok ? r.json() : []),
      fetch('/api/loyalty/me',   { credentials: 'include', cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      fetch('/api/bookings',     { credentials: 'include', cache: 'no-store' }).then(r => r.ok ? r.json() : null),
    ]).then(([perks, loyaltyData, bookingData]) => {
      setClaimedPerks(Array.isArray(perks) ? perks : [])
      setLoyaltyCard(loyaltyData?.card ?? null)
      setBookings(bookingData?.bookings ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const recentPerks = claimedPerks.slice(0, 3)
  const activePerks = claimedPerks.filter(p => p.status === 'APPROVED').length
  const pendingPerks = claimedPerks.filter(p => p.status === 'PENDING').length
  const recentBookings = bookings.slice(0, 3)

  return (
    <div className="space-y-6">

      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's a summary of your account.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
            <FiTag size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{loading ? '—' : claimedPerks.length}</p>
            <p className="text-xs text-gray-500 font-medium">Claimed Perks</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <FiCheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{loading ? '—' : activePerks}</p>
            <p className="text-xs text-gray-500 font-medium">Active Perks</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <FiCalendar size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{loading ? '—' : bookings.length}</p>
            <p className="text-xs text-gray-500 font-medium">My Bookings</p>
          </div>
        </div>

        <Link href="/my/privilege-card"
          className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:border-amber-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <FiAward size={20} className="text-amber-500" />
          </div>
          <div>
            {loading ? (
              <p className="text-2xl font-black text-gray-900">—</p>
            ) : loyaltyCard ? (
              <>
                <p className="text-sm font-black text-amber-600">{loyaltyCard.tier}</p>
                <p className="text-xs text-gray-500 font-medium">{loyaltyCard.pointsEarned - loyaltyCard.pointsRedeemed} pts available</p>
              </>
            ) : (
              <>
                <p className="text-sm font-black text-gray-400">Not joined</p>
                <p className="text-xs text-amber-500 font-semibold">Join free →</p>
              </>
            )}
            <p className="text-[10px] text-gray-400 mt-0.5">Privilege Card</p>
          </div>
        </Link>
      </div>

      {/* Recent claimed perks */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiGift size={16} className="text-gray-400" />
            <h2 className="font-bold text-gray-800 text-sm">Recently Claimed Perks</h2>
          </div>
          <Link href="/my/perks"
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: 'var(--brand)' }}>
            View all <FiChevronRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="px-5 py-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
          </div>
        ) : recentPerks.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FiTag size={20} style={{ color: 'var(--brand)' }} />
            </div>
            <p className="font-bold text-gray-700 text-sm">No perks claimed yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Browse our exclusive travel perks and claim them!</p>
            <Link href="/perks"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
              <FiTag size={14} /> Browse Perks
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentPerks.map(cp => {
              const s = STATUS_STYLE[cp.status] ?? STATUS_STYLE.PENDING
              return (
                <li key={cp.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: cp.perk.bgColor || '#fffbeb' }}>
                    <FiGift size={16} style={{ color: cp.perk.iconColor || '#0a83f5' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{cp.perk.title}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <FiClock size={10} />
                      {new Date(cp.claimedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${s.cls}`}>
                    {s.label}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiCalendar size={16} className="text-gray-400" />
            <h2 className="font-bold text-gray-800 text-sm">My Bookings</h2>
          </div>
          <Link href="/my/bookings"
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: 'var(--brand)' }}>
            View all <FiChevronRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="px-5 py-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FiCalendar size={20} className="text-blue-400" />
            </div>
            <p className="font-bold text-gray-700 text-sm">No bookings yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Your upcoming trips will appear here once you book a package.</p>
            <Link href="/packages-from-sri-lanka/family"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
              Browse Packages
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentBookings.map(b => (
              <li key={b.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <FiCalendar size={16} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {b.package?.title ?? 'Booking'}
                  </p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <FiClock size={10} />
                    {new Date(b.travelDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <span className="ml-1 font-mono tracking-wide">{b.bookingRef}</span>
                  </p>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                  b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                  b.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500' :
                  b.status === 'CANCELLED' ? 'bg-red-100 text-red-500' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {b.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pending perks notice */}
      {pendingPerks > 0 && (
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4">
          <FiAlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800 text-sm">
              {pendingPerks} perk{pendingPerks > 1 ? 's' : ''} pending approval
            </p>
            <p className="text-xs text-yellow-600 mt-0.5">
              Our team will review and approve your claimed perks shortly.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

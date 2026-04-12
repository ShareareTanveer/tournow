'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FiAward, FiCheckCircle, FiAlertCircle, FiExternalLink,
  FiUser, FiPhone, FiMail, FiStar,
} from 'react-icons/fi'

interface LoyaltyCard {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  pointsEarned: number
  pointsRedeemed: number
  tier: 'BRONZE' | 'SILVER' | 'GOLD'
  createdAt: string
}

const TIER = {
  BRONZE: {
    label: 'Bronze',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    bar: 'bg-indigo-400',
    next: 'Silver',
    nextAt: 500,
    perks: ['Priority customer support', 'Early access to promotions', '5% discount on bookings'],
  },
  SILVER: {
    label: 'Silver',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    bar: 'bg-gray-400',
    next: 'Gold',
    nextAt: 1500,
    perks: ['All Bronze benefits', '10% discount on bookings', 'Free travel insurance'],
  },
  GOLD: {
    label: 'Gold',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    bar: 'bg-amber-400',
    next: null,
    nextAt: null,
    perks: ['All Silver benefits', '15% discount on bookings', 'Complimentary airport transfers', 'Dedicated travel consultant'],
  },
}

export default function MyPrivilegeCardPage() {
  const [card, setCard] = useState<LoyaltyCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [authUser, setAuthUser] = useState<{ name: string; email: string } | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState(false)

  useEffect(() => {
    // Load auth user + check if they already have a card
    Promise.all([
      fetch('/api/customer/me', { credentials: 'include', cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      fetch('/api/loyalty/me',  { credentials: 'include', cache: 'no-store' }).then(r => r.ok ? r.json() : null),
    ]).then(([authData, cardData]) => {
      if (authData?.customer) {
        setAuthUser(authData.customer)
        setForm(f => ({ ...f, name: authData.customer.name, email: authData.customer.email }))
      }
      if (cardData?.card) setCard(cardData.card)
    }).finally(() => setLoading(false))
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistering(true)
    setRegError('')
    try {
      const res = await fetch('/api/loyalty-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      setCard(data.card)
      setRegSuccess(true)
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 rounded-full animate-spin"
          style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  // ── Already has a card ──────────────────────────────────────────────────────
  if (card) {
    const t = TIER[card.tier] ?? TIER.BRONZE
    const available = card.pointsEarned - card.pointsRedeemed
    const progressPct = t.nextAt
      ? Math.min(100, Math.round((card.pointsEarned / t.nextAt) * 100))
      : 100

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Privilege Card</h1>
          <p className="text-sm text-gray-500 mt-1">Your loyalty membership details and points balance.</p>
        </div>

        {/* Card visual */}
        <div className={`rounded-2xl border-2 ${t.border} ${t.bg} p-6 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -translate-y-10 translate-x-10"
            style={{ background: 'var(--brand)' }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Metro Voyage</p>
                <p className="text-xl font-black text-gray-900">{card.customerName}</p>
                <p className="text-sm text-gray-500">{card.customerEmail}</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-sm ${t.bg} border ${t.border} ${t.color}`}>
                <FiAward size={16} /> {t.label}
              </div>
            </div>

            {/* Points */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Points Earned', val: card.pointsEarned },
                { label: 'Points Used',   val: card.pointsRedeemed },
                { label: 'Available',     val: available },
              ].map(({ label, val }) => (
                <div key={label} className="bg-white/60 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-gray-800">{val}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress to next tier */}
            {t.next && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{t.label}</span>
                  <span>{card.pointsEarned} / {t.nextAt} pts → {t.next}</span>
                </div>
                <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                  <div className={`h-full ${t.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}
            {!t.next && (
              <div className="flex items-center gap-2 text-sm font-bold text-amber-600">
                <FiStar size={14} /> You've reached the highest tier — Gold!
              </div>
            )}
          </div>
        </div>

        {/* Current tier perks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className={`font-bold text-sm mb-3 flex items-center gap-2 ${t.color}`}>
            <FiAward size={15} /> Your {t.label} Tier Benefits
          </h2>
          <ul className="space-y-2">
            {t.perks.map(perk => (
              <li key={perk} className="flex items-center gap-2 text-sm text-gray-700">
                <FiCheckCircle size={14} className="text-green-500 shrink-0" /> {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Member since + public page link */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Member since {new Date(card.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <Link href="/privilege-card" target="_blank"
            className="flex items-center gap-1 text-indigo-500 hover:underline font-medium">
            <FiExternalLink size={12} /> View full program details
          </Link>
        </div>
      </div>
    )
  }

  // ── Not registered yet ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Privilege Card</h1>
        <p className="text-sm text-gray-500 mt-1">Join our loyalty program to earn points on every booking.</p>
      </div>

      {/* Benefits preview */}
      <div className="grid grid-cols-3 gap-3">
        {(['BRONZE', 'SILVER', 'GOLD'] as const).map(tier => {
          const t = TIER[tier]
          return (
            <div key={tier} className={`rounded-xl border ${t.border} ${t.bg} p-3 text-center`}>
              <FiAward size={20} className={`mx-auto mb-1 ${t.color}`} />
              <p className={`text-xs font-bold ${t.color}`}>{t.label}</p>
              <p className="text-[10px] text-gray-400 mt-1">{t.perks[0]}</p>
            </div>
          )
        })}
      </div>

      {regSuccess ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-8 text-center">
          <FiCheckCircle size={36} className="text-green-500 mx-auto mb-3" />
          <h2 className="font-bold text-gray-800 text-base">You're registered!</h2>
          <p className="text-sm text-gray-500 mt-1">Welcome to the Metro Voyage Privilege Card program. Reload the page to see your card.</p>
          <button onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
            View My Card
          </button>
        </div>
      ) : (
        <form onSubmit={handleRegister}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-800 text-sm">Register for the Privilege Card</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
              <FiUser size={14} className="text-gray-400 shrink-0" />
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="flex-1 text-sm outline-none bg-transparent" placeholder="Your full name" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
              <FiPhone size={14} className="text-gray-400 shrink-0" />
              <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="flex-1 text-sm outline-none bg-transparent" placeholder="+94 70 xxx xxxx" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
              <FiMail size={14} className="text-gray-400 shrink-0" />
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="flex-1 text-sm outline-none bg-transparent text-gray-500" />
            </div>
          </div>

          {regError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">
              <FiAlertCircle size={14} /> {regError}
            </div>
          )}

          <button type="submit" disabled={registering}
            className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
            {registering ? 'Registering…' : 'Join the Privilege Program — Free'}
          </button>

          <p className="text-center text-xs text-gray-400">
            <Link href="/privilege-card" className="hover:underline" style={{ color: 'var(--brand)' }}>
              Learn more about the program
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}

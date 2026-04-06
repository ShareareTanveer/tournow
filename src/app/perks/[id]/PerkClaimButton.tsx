'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiCheckCircle, FiLock, FiTag } from 'react-icons/fi'

interface Props {
  perkId: string
  perkTitle: string
  ctaLink?: string | null
}

export default function PerkClaimButton({ perkId, perkTitle, ctaLink }: Props) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [claimed, setClaimed] = useState(false)
  const [claimStatus, setClaimStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check login + already-claimed state in one go
    Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/perks/claim'),
    ]).then(async ([meRes, claimsRes]) => {
      setLoggedIn(meRes.ok)
      if (claimsRes.ok) {
        const claims: Array<{ perkId: string; status: string }> = await claimsRes.json()
        const existing = claims.find(c => c.perkId === perkId)
        if (existing) {
          setClaimed(true)
          setClaimStatus(existing.status)
        }
      }
    }).catch(() => setLoggedIn(false))
  }, [perkId])

  const handleClaim = async () => {
    if (ctaLink) { window.location.href = ctaLink; return }
    setLoading(true)
    try {
      const res = await fetch('/api/perks/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perkId }),
      })
      if (res.ok) {
        const data = await res.json()
        setClaimed(true)
        setClaimStatus(data.status ?? 'PENDING')
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  if (loggedIn === null) {
    return <div className="h-11 bg-gray-100 rounded-xl animate-pulse w-48" />
  }

  if (claimed) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-green-600 font-semibold text-sm bg-green-50 px-5 py-3 rounded-xl border border-green-200">
          <FiCheckCircle size={16} /> Perk claimed!
          {claimStatus === 'PENDING' && <span className="ml-1 text-yellow-600 font-normal">(Pending approval)</span>}
          {claimStatus === 'APPROVED' && <span className="ml-1 font-normal">(Approved)</span>}
        </div>
        <Link href="/my/perks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--brand)' }}>
          <FiTag size={12} /> View in My Perks →
        </Link>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
          <FiLock size={14} className="shrink-0" />
          <span>Log in or sign up to claim this perk and apply it to your booking.</span>
        </div>
        <div className="flex gap-3">
          <Link href={`/login?redirect=/perks/${perkId}`}
            className="flex-1 text-center text-white font-bold text-sm py-2.5 rounded-xl transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>
            Log In to Claim
          </Link>
          <Link href={`/register?redirect=/perks/${perkId}`}
            className="flex-1 text-center font-bold text-sm py-2.5 rounded-xl border-2 border-pink-500 text-pink-600 hover:bg-pink-50 transition">
            Sign Up Free
          </Link>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleClaim}
      disabled={loading}
      className="flex items-center justify-center gap-2 text-white font-bold text-sm px-8 py-3 rounded-xl transition hover:opacity-90 disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}
    >
      {loading ? 'Claiming…' : 'Claim This Perk'}
    </button>
  )
}

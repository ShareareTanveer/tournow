'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiTag, FiClock, FiExternalLink, FiGift } from 'react-icons/fi'

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
    imageUrl: string | null
    ctaLink: string | null
  }
}

const STATUS_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  PENDING:  { label: 'Pending Review', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  APPROVED: { label: 'Approved',       bg: 'bg-green-100',  text: 'text-green-700' },
  USED:     { label: 'Used',           bg: 'bg-gray-100',   text: 'text-gray-500' },
  EXPIRED:  { label: 'Expired',        bg: 'bg-red-100',    text: 'text-red-500' },
}

export default function MyPerksPage() {
  const [perks, setPerks] = useState<ClaimedPerk[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/perks/claim')
      .then(r => r.ok ? r.json() : [])
      .then(setPerks)
      .catch(() => setPerks([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Perks</h1>
        <p className="text-sm text-gray-500 mt-1">All the exclusive perks you've claimed.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 rounded-full animate-spin"
            style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
        </div>
      ) : perks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-14 text-center">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiTag size={24} style={{ color: 'var(--brand)' }} />
          </div>
          <p className="font-bold text-gray-700">You haven't claimed any perks yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            Browse our exclusive travel perks and start enjoying member benefits.
          </p>
          <Link href="/perks"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
            <FiTag size={14} /> Browse Perks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {perks.map(cp => {
            const s = STATUS_STYLE[cp.status] ?? STATUS_STYLE.PENDING
            const img = cp.perk.imageUrl || `https://picsum.photos/seed/${cp.perk.id}/600/300`
            return (
              <div key={cp.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <img src={img} alt={cp.perk.title}
                    className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                    {s.label}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: cp.perk.bgColor || '#fffbeb' }}>
                      <FiGift size={15} style={{ color: cp.perk.iconColor || '#f59e0b' }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm leading-tight">{cp.perk.title}</h3>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                        <FiClock size={10} />
                        Claimed {new Date(cp.claimedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
                    {cp.perk.description}
                  </p>
                  <div className="flex items-center gap-2 mt-auto">
                    <Link href={`/perks/${cp.perk.id}`}
                      className="text-xs font-semibold"
                      style={{ color: 'var(--brand)' }}>
                      View details
                    </Link>
                    {cp.perk.ctaLink && (
                      <a href={cp.perk.ctaLink} target="_blank" rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800">
                        <FiExternalLink size={12} /> Redeem
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Browse more */}
      {perks.length > 0 && (
        <div className="text-center pt-2">
          <Link href="/perks"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors"
            style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
            <FiTag size={14} /> Browse More Perks
          </Link>
        </div>
      )}
    </div>
  )
}

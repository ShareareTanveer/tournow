'use client'

import { useState } from 'react'
import { FiUsers, FiSettings, FiAward, FiExternalLink } from 'react-icons/fi'
import LoyaltyTable from './LoyaltyTable'
import LoyaltyProgramSettings from './LoyaltyProgramSettings'
import Link from 'next/link'

const TIER_BADGE: Record<string, string> = {
  BRONZE: 'bg-orange-100 text-orange-700',
  SILVER: 'bg-gray-100 text-gray-600',
  GOLD:   'bg-amber-100 text-amber-700',
}

interface Props {
  cards: any[]
  settings: Record<string, string>
  tiers: { BRONZE: number; SILVER: number; GOLD: number }
}

export default function LoyaltyTabs({ cards, settings, tiers }: Props) {
  const [tab, setTab] = useState<'members' | 'program'>('members')

  return (
    <div className="space-y-5">
      {/* Top nav */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setTab('members')}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${tab === 'members' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <FiUsers size={14} /> Members
          </button>
          <button onClick={() => setTab('program')}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${tab === 'program' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <FiSettings size={14} /> Program Settings
          </button>
        </div>
        <Link href="/privilege-card" target="_blank"
          className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
          <FiExternalLink size={12} /> View Public Page
        </Link>
      </div>

      {tab === 'members' && (
        <div className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs text-gray-400 font-medium mb-1">Total Members</p>
              <p className="text-3xl font-bold text-gray-800">{cards.length}</p>
            </div>
            {(['GOLD', 'SILVER', 'BRONZE'] as const).map(tier => (
              <div key={tier} className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className={`text-xs font-medium mb-1 flex items-center gap-1.5`}>
                  <span className={`inline-block w-2 h-2 rounded-full ${tier === 'GOLD' ? 'bg-amber-400' : tier === 'SILVER' ? 'bg-gray-400' : 'bg-orange-700'}`} />
                  <span className="text-gray-400">{tier.charAt(0) + tier.slice(1).toLowerCase()}</span>
                </p>
                <p className={`text-3xl font-bold ${tier === 'GOLD' ? 'text-amber-600' : tier === 'SILVER' ? 'text-gray-500' : 'text-orange-700'}`}>
                  {tiers[tier]}
                </p>
              </div>
            ))}
          </div>

          {/* How perks/privilege card differ — info banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex gap-4">
            <FiAward size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 space-y-1">
              <p className="font-bold">Privilege Card vs Perks — what's the difference?</p>
              <p><span className="font-semibold">Privilege Card</span> is a points-based loyalty program. Customers register after booking, earn points per trip, and tier up (Bronze → Silver → Gold) to unlock escalating discounts and upgrades. Managed here.</p>
              <p><span className="font-semibold">Perks</span> are one-off exclusive offers (e.g. "Free airport pickup", "15% hotel discount") that any logged-in customer can claim once. Managed under <span className="font-semibold">Perks Section</span> in the sidebar.</p>
            </div>
          </div>

          <LoyaltyTable cards={cards} />
        </div>
      )}

      {tab === 'program' && (
        <LoyaltyProgramSettings settings={settings} />
      )}
    </div>
  )
}

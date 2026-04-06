'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiCheckCircle } from 'react-icons/fi'

function g(s: Record<string, string>, key: string, fb = '') { return s[key] ?? fb }

export default function LoyaltyProgramSettings({ settings }: { settings: Record<string, string> }) {
  const router = useRouter()
  const [tab, setTab] = useState<'hero' | 'tiers' | 'terms'>('hero')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    // Hero / How-it-works
    loyalty_hero_badge:      g(settings, 'loyalty_hero_badge',      'EXCLUSIVE REWARDS'),
    loyalty_hero_title:      g(settings, 'loyalty_hero_title',      'Metro Voyage Privilege Card'),
    loyalty_hero_subtitle:   g(settings, 'loyalty_hero_subtitle',   'Your gateway to exclusive travel rewards'),
    loyalty_eligibility_note:g(settings, 'loyalty_eligibility_note','Open to all travelers who have booked with Metro Voyage'),
    loyalty_cta_label:       g(settings, 'loyalty_cta_label',       "Join Today — It's Free"),
    loyalty_how_step1_title: g(settings, 'loyalty_how_step1_title', 'Book a Holiday'),
    loyalty_how_step1_desc:  g(settings, 'loyalty_how_step1_desc',  'Make your first holiday package purchase with Metro Voyage.'),
    loyalty_how_step2_title: g(settings, 'loyalty_how_step2_title', 'Register for Privilege'),
    loyalty_how_step2_desc:  g(settings, 'loyalty_how_step2_desc',  'Complete your registration after your first booking to join the program.'),
    loyalty_how_step3_title: g(settings, 'loyalty_how_step3_title', 'Earn & Redeem'),
    loyalty_how_step3_desc:  g(settings, 'loyalty_how_step3_desc',  'Accumulate points on future bookings and redeem for discounts, upgrades, and more.'),
    // Tiers
    loyalty_bronze_perks:    g(settings, 'loyalty_bronze_perks',    'Priority customer support\nEarly access to promotions\n5% discount on bookings'),
    loyalty_silver_perks:    g(settings, 'loyalty_silver_perks',    'All Bronze benefits\n10% discount on bookings\nFree travel insurance'),
    loyalty_gold_perks:      g(settings, 'loyalty_gold_perks',      'All Silver benefits\n15% discount on bookings\nComplimentary airport transfers\nDedicated travel consultant'),
    // Terms
    loyalty_terms_eligibility:  g(settings, 'loyalty_terms_eligibility',  'The Privilege Card is available to customers who have completed at least one holiday booking with Metro Voyage.'),
    loyalty_terms_points:        g(settings, 'loyalty_terms_points',       'Points are earned on the net package price, excluding taxes, visa fees, and third-party surcharges.'),
    loyalty_terms_redemption:    g(settings, 'loyalty_terms_redemption',   'Points may be redeemed for discounts on future bookings, complimentary upgrades, or excursions. Minimum redemption threshold applies.'),
    loyalty_terms_validity:      g(settings, 'loyalty_terms_validity',     'Points are valid for 24 months from the date of issue. Expired points cannot be reinstated.'),
    loyalty_terms_modification:  g(settings, 'loyalty_terms_modification', 'Metro Voyage reserves the right to modify, suspend, or terminate the Privilege Card program at any time with reasonable notice.'),
    loyalty_tc:                  g(settings, 'loyalty_tc',                 'Points are valid for 2 years from date of issue. Metro Voyage reserves the right to modify the program at any time.'),
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
    router.refresh()
  }

  const inp = (key: keyof typeof form, label: string, hint?: string) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {hint && <p className="text-[11px] text-gray-400 mb-1">{hint}</p>}
      <input value={form[key]} onChange={set(key)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
    </div>
  )

  const area = (key: keyof typeof form, label: string, rows = 3, hint?: string) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {hint && <p className="text-[11px] text-gray-400 mb-1">{hint}</p>}
      <textarea rows={rows} value={form[key]} onChange={set(key)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none" />
    </div>
  )

  const TABS = [
    { id: 'hero',  label: 'Hero & How It Works' },
    { id: 'tiers', label: 'Tier Benefits' },
    { id: 'terms', label: 'Terms & Conditions' },
  ] as const

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${tab === t.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-5">

        {tab === 'hero' && <>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Public Page — Hero Section</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inp('loyalty_hero_badge',       'Badge Text')}
            {inp('loyalty_cta_label',        'CTA Button Label')}
          </div>
          {inp('loyalty_hero_title',         'Page Title')}
          {inp('loyalty_hero_subtitle',      'Subtitle')}
          {inp('loyalty_eligibility_note',   'Eligibility Note (shown below CTA)')}

          <hr className="border-gray-100 my-2" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">How It Works — 3 Steps</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-bold text-orange-500">Step 1</p>
              {inp('loyalty_how_step1_title', 'Title')}
              {area('loyalty_how_step1_desc', 'Description', 2)}
            </div>
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-bold text-orange-500">Step 2</p>
              {inp('loyalty_how_step2_title', 'Title')}
              {area('loyalty_how_step2_desc', 'Description', 2)}
            </div>
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-bold text-orange-500">Step 3</p>
              {inp('loyalty_how_step3_title', 'Title')}
              {area('loyalty_how_step3_desc', 'Description', 2)}
            </div>
          </div>
        </>}

        {tab === 'tiers' && <>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Tier Benefit Lists</p>
          <p className="text-[11px] text-gray-400">Enter one benefit per line. These appear on the public Privilege Card page.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-xl space-y-3 border border-orange-100">
              <p className="text-xs font-bold text-orange-700">Bronze Tier</p>
              {area('loyalty_bronze_perks', 'Benefits (one per line)', 6)}
            </div>
            <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200">
              <p className="text-xs font-bold text-gray-500">Silver Tier</p>
              {area('loyalty_silver_perks', 'Benefits (one per line)', 6)}
            </div>
            <div className="p-4 bg-amber-50 rounded-xl space-y-3 border border-amber-100">
              <p className="text-xs font-bold text-amber-600">Gold Tier</p>
              {area('loyalty_gold_perks', 'Benefits (one per line)', 6)}
            </div>
          </div>
        </>}

        {tab === 'terms' && <>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Terms & Conditions</p>
          <p className="text-[11px] text-gray-400">These appear in the Terms section at the bottom of the public Privilege Card page.</p>
          {area('loyalty_terms_eligibility',  'Eligibility',    3)}
          {area('loyalty_terms_points',        'Points Accrual', 3)}
          {area('loyalty_terms_redemption',    'Redemption',     3)}
          {area('loyalty_terms_validity',      'Validity',       2)}
          {area('loyalty_terms_modification',  'Modification',   2)}
          {area('loyalty_tc',                  'Short T&C summary (shown inline)', 3)}
        </>}
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
          <FiSave size={14} /> {loading ? 'Saving…' : 'Save Program Settings'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <FiCheckCircle size={14} /> Saved successfully
          </span>
        )}
      </div>
    </form>
  )
}

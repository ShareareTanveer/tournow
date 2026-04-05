'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const DESTINATIONS = [
  { label: 'Anywhere', value: '' },
  { label: 'Dubai', value: 'dubai' },
  { label: 'Maldives', value: 'maldives' },
  { label: 'Japan', value: 'japan' },
  { label: 'Thailand', value: 'thailand' },
  { label: 'Bali', value: 'bali' },
  { label: 'Turkey', value: 'turkey' },
  { label: 'Singapore', value: 'singapore' },
  { label: 'France', value: 'france' },
  { label: 'Egypt', value: 'egypt' },
  { label: 'Australia', value: 'australia' },
  { label: 'Malaysia', value: 'malaysia' },
  { label: 'South Korea', value: 'south-korea' },
]

const BUDGET_LEVELS = [
  { label: 'Economy', value: '0-200000' },
  { label: 'Comfort', value: '200000-500000' },
  { label: 'Premium', value: '500000-800000' },
  { label: 'Luxury', value: '800000-99999999' },
]

const RECENT_SEARCHES = [
  { label: 'Bali', price: 'LKR 320,000' },
  { label: 'Maldives', price: 'LKR 350,000' },
  { label: 'Japan', price: 'LKR 600,000' },
  { label: 'Dubai', price: 'LKR 120,000' },
]

export default function HeroSection() {
  const [destination, setDestination] = useState('')
  const [budgetIndex, setBudgetIndex] = useState(0)
  const router = useRouter()

  const selectedBudget = BUDGET_LEVELS[budgetIndex]

  const handleExplore = () => {
    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    if (selectedBudget.value) {
      const [min, max] = selectedBudget.value.split('-')
      params.set('minPrice', min)
      params.set('maxPrice', max)
    }
    router.push(`/packages-from-sri-lanka/family?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/45 to-black/25" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full pt-10">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm px-4 py-2 rounded-full mb-6 border border-white/20">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          SLTDA Licensed & Fully Bonded Travel Agency
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Your Dream Holiday<br />
          <span style={{ color: 'var(--brand)' }}>Starts Here</span>
        </h1>
        <p className="text-base md:text-lg text-white/75 mb-10 max-w-xl mx-auto">
          Custom-tailored packages from Sri Lanka to 50+ destinations worldwide.
        </p>

        {/* ── Search Card ────────────────────────────────────────── */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 max-w-2xl mx-auto mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            {/* Destination picker */}
            <div className="flex-1 text-left">
              <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Dream Destination
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full text-gray-800 font-medium text-sm focus:outline-none bg-transparent cursor-pointer py-1 border-b border-gray-200 focus:border-green-500 transition-colors"
              >
                {DESTINATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-gray-200 self-stretch my-1" />

            {/* Budget slider */}
            <div className="flex-1 text-left">
              <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Your Travel Budget
                <span className="ml-auto font-bold text-green-600 text-xs">
                  {budgetIndex === 0 ? 'Economy' : budgetIndex === 1 ? 'Comfort' : budgetIndex === 2 ? 'Premium' : 'Luxury'}
                </span>
              </label>
              <div className="relative pt-1">
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={budgetIndex}
                  onChange={(e) => setBudgetIndex(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  {BUDGET_LEVELS.map((b) => (
                    <span key={b.label}>{b.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Explore button */}
            <button
              onClick={handleExplore}
              className="sm:self-center bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-3 rounded-xl transition-colors whitespace-nowrap text-sm shadow-md"
            >
              Explore
            </button>
          </div>
        </div>

        {/* Recent searches */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-2xl mx-auto flex flex-wrap items-center gap-2">
          <span className="text-white/60 text-xs flex items-center gap-1 mr-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Searches
          </span>
          {RECENT_SEARCHES.map((s) => (
            <button
              key={s.label}
              onClick={() => setDestination(s.label.toLowerCase())}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-full border border-white/20 transition-colors"
            >
              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {s.label}
              <span className="font-semibold text-green-300">{s.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '50+', label: 'Countries' },
            { value: '200+', label: 'Packages' },
            { value: '5000+', label: 'Happy Travellers' },
            { value: '24/7', label: 'Support' },
          ].map((stat) => (
            <div key={stat.label} className="text-center text-white">
              <div className="text-xl font-bold" style={{ color: 'var(--brand)' }}>{stat.value}</div>
              <div className="text-xs text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiMapPin, FiDollarSign, FiSearch, FiClock,
  FiShield, FiStar, FiUsers,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

const DEFAULT_HERO = 'https://picsum.photos/seed/travel-hero/1920/1080'

const DESTINATIONS = [
  { label: 'Anywhere in the world', value: '' },
  { label: 'Dubai, UAE', value: 'dubai' },
  { label: 'Maldives', value: 'maldives' },
  { label: 'Japan', value: 'japan' },
  { label: 'Thailand', value: 'thailand' },
  { label: 'Bali, Indonesia', value: 'bali' },
  { label: 'Turkey', value: 'turkey' },
  { label: 'Singapore', value: 'singapore' },
  { label: 'France', value: 'france' },
  { label: 'Egypt', value: 'egypt' },
  { label: 'Australia', value: 'australia' },
  { label: 'Malaysia', value: 'malaysia' },
  { label: 'South Korea', value: 'south-korea' },
]

const BUDGET_LEVELS = [
  { label: 'Economy',  sublabel: 'Up to LKR 200K',  value: '0-200000',         icon: '🌿' },
  { label: 'Comfort',  sublabel: 'LKR 200K – 500K', value: '200000-500000',    icon: '✈️' },
  { label: 'Premium',  sublabel: 'LKR 500K – 800K', value: '500000-800000',    icon: '💎' },
  { label: 'Luxury',   sublabel: 'LKR 800K+',        value: '800000-99999999', icon: '👑' },
]

const POPULAR = ['Dubai', 'Maldives', 'Japan', 'Thailand', 'Bali']

const STATS = [
  { icon: FiMapPin,  value: '50+',    label: 'Destinations' },
  { icon: FiUsers,   value: '5,000+', label: 'Happy Travellers' },
  { icon: FiStar,    value: '4.9★',   label: 'Avg Rating' },
  { icon: FiShield,  value: 'SLTDA',  label: 'Licensed' },
]

export default function HeroSection({ heroImageUrl }: { heroImageUrl?: string }) {
  const [destination, setDestination] = useState('')
  const [budgetIndex, setBudgetIndex] = useState(0)
  const router = useRouter()
  const bgImage = heroImageUrl || DEFAULT_HERO
  const budget = BUDGET_LEVELS[budgetIndex]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    const [min, max] = budget.value.split('-')
    params.set('minPrice', min)
    params.set('maxPrice', max)
    router.push(`/packages-from-sri-lanka/family?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">

      {/* ── Background ── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')`, transform: 'scale(1.04)' }}
      />

      {/* Overlay — uses theme dark/navy variables */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(30,58,95,0.75) 50%, rgba(13,148,136,0.45) 100%)' }} />
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.80) 0%, transparent 55%)' }} />

      {/* Glow blobs */}
      <div className="absolute top-20 right-16 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: 'var(--brand)' }} />
      <div className="absolute bottom-40 left-10 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ background: 'var(--teal)' }} />

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-28 pb-36 text-center">


        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white text-center leading-[1.05] mb-5 max-w-4xl">
          Discover Your
          <span className="block text-transparent bg-clip-text"
        style={{
    backgroundImage: 'linear-gradient(90deg, var(--brand) 0%, var(--accent1) 50%, var(--brand) 100%)',
  }}>
            Dream Holiday
          </span>
        </h1>

        <p className="text-white/65 text-base sm:text-lg text-center max-w-xl mb-10 leading-relaxed">
          Custom-tailored tours from Sri Lanka to 50+ destinations worldwide.<br className="hidden sm:block" />
          Every journey, perfectly planned.
        </p>

        {/* ── Search card ── */}
        <div className="w-full max-w-3xl mb-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}>

            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">

              {/* Destination */}
              <div className="flex-1 flex items-center gap-3 px-5 py-4">
                <FiMapPin size={18} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Where to?</p>
                  <select value={destination} onChange={e => setDestination(e.target.value)}
                    className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none cursor-pointer">
                    {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Budget */}
              <div className="flex-1 flex items-start gap-3 px-5 py-4">
                <FiDollarSign size={18} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Budget</p>
                    <span className="text-xs font-bold" style={{ color: 'var(--teal)' }}>{budget.label}</span>
                  </div>
                  <input type="range" min={0} max={3} step={1} value={budgetIndex}
                    onChange={e => setBudgetIndex(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer budget-slider"
                    style={{ accentColor: '#0d9488' }} />
                  <style>{`.budget-slider{-webkit-appearance:none;appearance:none;accent-color:#0d9488}.budget-slider::-webkit-slider-container{display:flex;align-items:center}.budget-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;background:#0d9488;width:18px;height:18px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 0 2px #0d9488;cursor:pointer;margin-top:-6px}.budget-slider::-webkit-slider-runnable-track{background:linear-gradient(to right,#0d9488 ${(budgetIndex/3)*100}%,#e5e7eb ${(budgetIndex/3)*100}%);border-radius:9999px;height:6px}.budget-slider::-moz-range-thumb{background:#0d9488;width:16px;height:16px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 0 2px #0d9488;cursor:pointer}.budget-slider::-moz-range-track{background:#e5e7eb;border-radius:9999px;height:6px}.budget-slider::-moz-range-progress{background:#0d9488;border-radius:9999px;height:6px}`}</style>
                  <p className="text-[10px] text-gray-400 mt-1">{budget.sublabel}</p>
                </div>
              </div>

              {/* Search button */}
              <div className="flex items-center px-4 py-4">
                <button onClick={handleSearch}
                  className="flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-105 text-sm whitespace-nowrap w-full md:w-auto justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))', boxShadow: '0 4px 20px' }}>
                  <FiSearch size={16} />
                  Search Tours
                </button>
              </div>
            </div>

            {/* Popular chips */}
            <div className="border-t border-gray-100 px-5 py-3 flex flex-wrap items-center gap-2"
              style={{ background: '#fafafa' }}>
              <span className="flex items-center gap-1.5 text-gray-400 text-xs mr-1">
                <FiClock size={11} /> Popular:
              </span>
              {POPULAR.map(p => (
                <button key={p}
                  onClick={() => setDestination(p.toLowerCase())}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 border"
                  style={destination === p.toLowerCase()
                    ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' }
                    : { background: '#fff', color: '#4b5563', borderColor: '#e5e7eb' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/consultation"
            className="flex items-center gap-2 text-white text-sm font-bold px-7 py-3 rounded-full transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))', boxShadow: '0 4px 18px rgba(13,148,136,0.4)' }}>
            Book Free Consultation
          </Link>
          <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-white text-sm font-bold px-7 py-3 rounded-full transition-all hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <FaWhatsapp size={16} /> Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="absolute bottom-0 left-0 right-0"
        style={{ background: 'rgba(10,14,30,0.65)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3 justify-center px-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(245,158,11,0.15)' }}>
                <Icon size={16} style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">{value}</p>
                <p className="text-white/45 text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

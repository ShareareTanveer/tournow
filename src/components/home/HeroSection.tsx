'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiMapPin, FiDollarSign, FiSearch, FiStar, FiUsers, FiShield, FiCompass, FiAward } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { MdFlightTakeoff } from 'react-icons/md'
import { TRAVEL_IMAGES } from '@/lib/travel-images'

const DEFAULT_HERO = TRAVEL_IMAGES.hero

const DESTINATIONS = [
  { label: 'Anywhere in the world', value: '' },
  { label: 'Dubai, UAE',    value: 'dubai' },
  { label: 'Maldives',     value: 'maldives' },
  { label: 'Japan',        value: 'japan' },
  { label: 'Thailand',     value: 'thailand' },
  { label: 'Bali, Indonesia', value: 'bali' },
  { label: 'Turkey',       value: 'turkey' },
  { label: 'Singapore',    value: 'singapore' },
  { label: 'France',       value: 'france' },
  { label: 'Egypt',        value: 'egypt' },
  { label: 'Australia',    value: 'australia' },
  { label: 'Malaysia',     value: 'malaysia' },
  { label: 'South Korea',  value: 'south-korea' },
]

const BUDGET_LEVELS = [
  { label: 'Essential', sublabel: 'Up to LKR 200K',  value: '0-200000' },
  { label: 'Comfort',   sublabel: 'LKR 200K - 500K', value: '200000-500000' },
  { label: 'Premium',   sublabel: 'LKR 500K - 800K', value: '500000-800000' },
  { label: 'Signature', sublabel: 'LKR 800K+',       value: '800000-99999999' },
]

const POPULAR = [
  { label: 'Dubai', value: 'dubai' },
  { label: 'Maldives', value: 'maldives' },
  { label: 'Japan', value: 'japan' },
  { label: 'Thailand', value: 'thailand' },
  { label: 'Bali', value: 'bali' },
]

const STATS = [
  { icon: FiMapPin, value: '50+', label: 'Global destinations' },
  { icon: FiUsers, value: '5,000+', label: 'Travellers guided' },
  { icon: FiStar, value: '4.9/5', label: 'Average rating' },
  { icon: FiShield, value: 'SLTDA', label: 'Licensed agency' },
]

export default function HeroSection({ heroImageUrl }: { heroImageUrl?: string }) {
  const [destination, setDestination] = useState('')
  const [budgetIndex, setBudgetIndex] = useState(1)
  const router = useRouter()
  const bgImage = heroImageUrl || DEFAULT_HERO
  const budget = BUDGET_LEVELS[budgetIndex]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    const [min, max] = budget.value.split('-')
    params.set('minPrice', min)
    params.set('maxPrice', max)
    const query = params.toString()
    router.push(query ? `/packages-from-sri-lanka?${query}` : '/packages-from-sri-lanka')
  }

  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-[#101817] text-white">
      <Image
        src={bgImage}
        alt="Premium tropical holiday planned by Metro Voyage"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(16,24,23,0.94)_0%,rgba(16,24,23,0.74)_45%,rgba(16,24,23,0.22)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,24,23,0.92)_0%,rgba(16,24,23,0.08)_52%,rgba(16,24,23,0.30)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[92svh] w-full max-w-7xl flex-col justify-end px-4 pb-10 pt-32 sm:px-6 lg:pb-12">
        <div className="grid w-full min-w-0 max-w-full items-end gap-8 lg:grid-cols-[1.04fr_0.78fr]">
          <div className="max-w-3xl min-w-0">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/78 backdrop-blur-md">
              <FiAward size={13} />
              SLTDA Licensed Travel Agency
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.04] text-white sm:text-5xl lg:text-6xl">
              Premium Holidays From Sri Lanka
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
              Metro Voyage crafts private, family, honeymoon, squad, and corporate travel across 50+ destinations with expert planning from inquiry to touchdown.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/consultation"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-black text-[#101817] transition hover:-translate-y-0.5 hover:bg-[#f4efe6]"
              >
                <MdFlightTakeoff size={17} />
                Book Free Consultation
              </Link>
              <a
                href="https://wa.me/94704545455"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/16"
              >
                <FaWhatsapp size={17} /> Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="min-w-0 w-full max-w-full rounded-lg border border-white/15 bg-white/94 p-4 text-[#17211f] shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#007f89]">Trip Finder</p>
                <h2 className="mt-1 text-xl font-black text-[#101817]">Start with your ideal escape</h2>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#edf8f6] text-[#007f89]">
                <FiCompass size={21} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#52615d]">
                  <FiMapPin size={13} />
                  Destination
                </span>
                <select
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-[#d8ded9] bg-white px-4 py-3 text-sm font-semibold text-[#17211f] outline-none transition focus:border-[#007f89] focus:ring-4 focus:ring-[#007f89]/10"
                >
                  {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </label>

              <div>
                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#52615d]">
                  <FiDollarSign size={13} />
                  Budget Style
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {BUDGET_LEVELS.map((level, index) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setBudgetIndex(index)}
                      className={`min-w-0 rounded-lg border px-3 py-3 text-left transition ${budgetIndex === index ? 'border-[#007f89] bg-[#edf8f6] text-[#063c43]' : 'border-[#e5e8e4] bg-white text-[#52615d] hover:border-[#c99a45]'}`}
                    >
                      <span className="block text-sm font-black">{level.label}</span>
                      <span className="mt-0.5 block text-[11px] font-medium text-[#52615d]">{level.sublabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#007f89] px-5 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#063c43]"
              >
                <FiSearch size={16} />
                Search Curated Tours
              </button>

              <div className="border-t border-[#edf0ed] pt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a9691]">Popular now</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setDestination(p.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${destination === p.value ? 'border-[#007f89] bg-[#007f89] text-white' : 'border-[#e0e5e1] bg-white text-[#52615d] hover:border-[#c99a45] hover:text-[#101817]'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/12 bg-white/12 backdrop-blur-md md:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3 bg-[#101817]/[0.56] px-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#f0d492]">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-base font-black leading-none text-white">{value}</p>
                <p className="mt-1 text-[11px] font-medium text-white/52">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

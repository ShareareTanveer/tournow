'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiMapPin, FiDollarSign, FiSearch, FiStar, FiUsers, FiShield, FiAward, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { MdFlightTakeoff } from 'react-icons/md'
import { TRAVEL_IMAGES } from '@/lib/travel-images'
import { DESTINATION_REGIONS } from '@/lib/navigation-data'

const DEFAULT_HERO = TRAVEL_IMAGES.hero

const BUDGET_LEVELS = [
  { label: 'Any Budget', sublabel: 'Show all budgets', value: '' },
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

function DestinationPicker({
  value,
  onChange,
  onOpenChange,
}: {
  value: string
  onChange: (value: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [activeRegion, setActiveRegion] = useState(DESTINATION_REGIONS[0].region)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRegionData = DESTINATION_REGIONS.find(region => region.region === activeRegion)
  const selected = DESTINATION_REGIONS
    .flatMap(region => region.destinations)
    .find(destination => destination.slug === value)

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        onOpenChange(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        onOpenChange(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onOpenChange])

  const selectDestination = (slug: string) => {
    onChange(slug)
    setOpen(false)
    onOpenChange(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          const nextOpen = !open
          setOpen(nextOpen)
          onOpenChange(nextOpen)
        }}
        className="flex w-full items-center justify-between rounded-lg border border-[#d8ded9] bg-white px-4 py-3 text-left text-sm font-semibold text-[#17211f] outline-none transition hover:border-[#0395d5] focus:border-[#0395d5] focus:ring-4 focus:ring-[#0395d5]/10"
      >
        <span className="flex min-w-0 items-center gap-2">
          <FiMapPin className="shrink-0 text-[#39ac44]" size={15} />
          <span className="truncate">{selected?.label ?? 'Anywhere in the world'}</span>
        </span>
        <FiChevronDown
          size={15}
          className={`shrink-0 text-[#52615d] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Choose a destination"
          className="hero-dropdown absolute left-0 right-0 top-full z-40 mt-2 grid max-h-72 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.20)]"
        >
          <div className="overflow-y-auto bg-white py-2">
            <button
              type="button"
              role="option"
              aria-selected={value === ''}
              onClick={() => selectDestination('')}
              className={`w-full border-b border-gray-50 px-3 py-2.5 text-left text-xs font-bold transition-colors ${value === '' ? 'bg-[#eaf7fc] text-[#0395d5]' : 'text-[#0395d5] hover:bg-[#eaf7fc]'}`}
            >
              All Destinations
            </button>
            {DESTINATION_REGIONS.map(region => (
              <button
                key={region.region}
                type="button"
                onMouseEnter={() => setActiveRegion(region.region)}
                onFocus={() => setActiveRegion(region.region)}
                onClick={() => setActiveRegion(region.region)}
                className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors sm:text-sm ${activeRegion === region.region ? 'bg-[#eaf7fc] font-semibold text-[#0395d5]' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span>{region.region}</span>
                <FiChevronRight size={12} className="shrink-0 opacity-50" />
              </button>
            ))}
          </div>

          {activeRegionData && (
            <div className="overflow-y-auto border-l border-slate-100 bg-slate-50 px-2 py-3">
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {activeRegionData.region}
              </p>
              {activeRegionData.destinations.map(destination => (
                <button
                  key={destination.slug}
                  type="button"
                  role="option"
                  aria-selected={value === destination.slug}
                  onClick={() => selectDestination(destination.slug)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors sm:text-sm ${value === destination.slug ? 'bg-white font-semibold text-[#0395d5] shadow-sm' : 'text-gray-600 hover:bg-white hover:text-[#0395d5]'}`}
                >
                  {destination.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function HeroSection({ heroImageUrl }: { heroImageUrl?: string }) {
  const [destination, setDestination] = useState('')
  const [destinationOpen, setDestinationOpen] = useState(false)
  const [budgetIndex, setBudgetIndex] = useState(0)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const router = useRouter()
  const bgImage = heroImageUrl || DEFAULT_HERO
  const budget = BUDGET_LEVELS[budgetIndex]
  const selectorOpen = budgetOpen || destinationOpen
  const handleDestinationOpenChange = useCallback((open: boolean) => {
    setDestinationOpen(open)
    if (open) setBudgetOpen(false)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    if (budget.value) {
      const [min, max] = budget.value.split('-')
      params.set('minPrice', min)
      params.set('maxPrice', max)
    }
    const query = params.toString()
    router.push(query ? `/packages-from-sri-lanka?${query}` : '/packages-from-sri-lanka')
  }

  return (
    <section className="hero-shell relative mx-auto mt-24 min-h-[680px] max-w-[1440px] overflow-hidden rounded-[28px] bg-[#101817] text-white sm:rounded-[32px] lg:mx-6 lg:min-h-[660px] xl:mx-auto">
      <Image
        src={bgImage}
        alt="Premium tropical holiday planned by Metro Voyage"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,18,0.38)_0%,rgba(8,18,18,0.20)_38%,rgba(8,18,18,0.58)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,18,18,0.08)_0%,rgba(8,18,18,0.34)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[680px] w-full max-w-[1360px] flex-col items-center justify-center px-4 py-12 sm:px-8 lg:min-h-[660px] lg:px-12 lg:py-10">
        <div className="hero-intro w-full max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#39ac44]/45 bg-[#39ac44]/15 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b7f0bd] backdrop-blur-md">
              <FiAward size={13} />
              SLTDA Licensed Travel Agency
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-[4.5rem]">
              <span className="block text-white">Your next story</span>
              <span className="block text-white">starts here.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
              Metro Voyage crafts private, family, honeymoon, squad, and corporate travel across 50+ destinations with expert planning from inquiry to touchdown.
            </p>

            <div className="hero-cta mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/consultation"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#101817] shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:bg-[#f4efe6]"
              >
                <MdFlightTakeoff size={17} />
                Book Free Consultation
              </Link>
              <a
                href="https://wa.me/94704545455"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/20"
              >
                <FaWhatsapp size={17} /> Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="hero-search relative mx-auto mt-8 w-full min-w-0 max-w-6xl rounded-[24px] bg-white p-2.5 text-[#17211f] shadow-[0_22px_60px_rgba(0,0,0,0.26)] transition-shadow duration-300 hover:shadow-[0_28px_70px_rgba(0,0,0,0.32)] sm:p-3 xl:rounded-full">
            <div className="grid min-w-0 gap-3 md:grid-cols-2 md:items-end xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] xl:items-center">
              <div className="min-w-0 rounded-2xl border border-[#e5e8e4] bg-[#fbfaf7] p-1.5 lg:border-transparent lg:bg-transparent">
                <span className="mb-1 flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#8a9691]"><FiMapPin size={12} /> Destination</span>
                <DestinationPicker value={destination} onChange={setDestination} onOpenChange={handleDestinationOpenChange} />
              </div>
              <div className="relative min-w-0 rounded-2xl border border-[#e5e8e4] bg-[#fbfaf7] p-1.5 lg:border-transparent lg:bg-transparent">
                <span className="mb-1 flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#8a9691]"><FiDollarSign size={12} /> Budget Style</span>
                <button type="button" aria-expanded={budgetOpen} onClick={() => { setBudgetOpen(value => !value); setDestinationOpen(false) }} className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm font-bold text-[#17211f] transition-colors hover:bg-[#f5faf8] lg:bg-transparent lg:hover:bg-[#f5faf8]">
                  <span>{budget.label}</span><FiChevronDown size={15} className={`transition-transform duration-300 ${budgetOpen ? 'rotate-180' : ''}`} />
                </button>
                {budgetOpen && <div className="hero-dropdown absolute left-2 right-2 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-2xl">
                  {BUDGET_LEVELS.map((level, index) => <button key={level.label} type="button" onClick={() => { setBudgetIndex(index); setBudgetOpen(false) }} className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${budgetIndex === index ? 'bg-[#eaf7fc] font-bold text-[#0395d5]' : 'text-[#52615d] hover:bg-gray-50'}`}><span>{level.label}</span><span className="ml-2 text-xs text-gray-400">{level.sublabel}</span></button>)}
                </div>}
              </div>
              <button onClick={handleSearch} className="flex min-h-[56px] min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#0395d5] px-5 text-sm font-black text-white shadow-md shadow-[#0395d5]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#0878ab] active:translate-y-0 md:col-span-2 xl:col-span-1 xl:rounded-full xl:px-6"><FiSearch size={17} /> Search Curated Tours</button>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="shrink-0"
            style={{
              height: selectorOpen ? `${destinationOpen ? 300 : 220}px` : '0px',
              transition: 'height 420ms cubic-bezier(0.2, 0.75, 0.25, 1)',
            }}
          />

          <div className="hero-popular mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/75">Popular now</span>
            {POPULAR.map(p => <button key={p.value} onClick={() => setDestination(p.value)} className={`rounded-full border px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 ${destination === p.value ? 'border-[#0395d5] bg-[#0395d5] text-white' : 'border-white/25 bg-white/10 text-white/90 hover:border-[#39ac44]/70 hover:bg-white/20'}`}>{p.label}</button>)}
          </div>

        <div className="hero-stats mt-6 grid w-full max-w-5xl grid-cols-2 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/20 bg-[#101817]/45 shadow-lg backdrop-blur-xl lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center justify-center gap-3 border-white/10 bg-white/[0.04] px-3 py-3.5 transition-colors duration-300 hover:bg-white/[0.10] sm:px-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#8ee596]">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-black leading-none text-white sm:text-base">{value}</p>
                <p className="mt-1 text-[10px] font-medium text-white/65 sm:text-[11px]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes heroRiseIn {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroDropdownIn {
          from { opacity: 0; max-height: 0; transform: translateY(-7px) scaleY(.97); }
          to { opacity: 1; max-height: 18rem; transform: translateY(0) scaleY(1); }
        }
        .hero-intro { animation: heroRiseIn 750ms cubic-bezier(.2,.7,.2,1) both; }
        .hero-search { animation: heroRiseIn 750ms 120ms cubic-bezier(.2,.7,.2,1) both; }
        .hero-popular { animation: heroRiseIn 750ms 220ms cubic-bezier(.2,.7,.2,1) both; }
        .hero-stats { animation: heroRiseIn 750ms 320ms cubic-bezier(.2,.7,.2,1) both; }
        .hero-dropdown { transform-origin: top center; animation: heroDropdownIn 280ms cubic-bezier(.2,.75,.25,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-intro, .hero-search, .hero-popular, .hero-stats, .hero-dropdown { animation: none; }
        }
      `}</style>
    </section>
  )
}

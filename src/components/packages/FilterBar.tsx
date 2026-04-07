'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'

const DURATIONS = [
  { label: 'Any Duration', value: '' },
  { label: 'Up to 4 days', value: '4' },
  { label: 'Up to 5 days', value: '5' },
  { label: 'Up to 6 days', value: '6' },
  { label: 'Up to 7 days', value: '7' },
  { label: '8+ days', value: '8' },
]

const BUDGETS = [
  { label: 'Any Budget', value: '' },
  { label: 'Under LKR 200,000', value: '0-200000' },
  { label: 'LKR 200k – 400k', value: '200000-400000' },
  { label: 'LKR 400k – 700k', value: '400000-700000' },
  { label: 'LKR 700k – 1M', value: '700000-1000000' },
  { label: 'Above LKR 1M', value: '1000000-99999999' },
]

const STARS = [
  { label: 'Any Stars', value: '' },
  { label: '3 Star', value: 'THREE' },
  { label: '4 Star', value: 'FOUR' },
  { label: '5 Star', value: 'FIVE' },
]

export default function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [duration, setDuration] = useState(searchParams.get('duration') ?? '')
  const [budget, setBudget] = useState('')
  const [starRating, setStarRating] = useState(searchParams.get('starRating') ?? '')

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (duration) params.set('duration', duration)
    if (starRating) params.set('starRating', starRating)
    if (budget) {
      const [min, max] = budget?.split('-')
      params.set('minPrice', min)
      params.set('maxPrice', max)
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setDuration('')
    setBudget('')
    setStarRating('')
    startTransition(() => router.push(pathname))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)] text-gray-700"
        >
          {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>

        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)] text-gray-700"
        >
          {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>

        <select
          value={starRating}
          onChange={(e) => setStarRating(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)] text-gray-700"
        >
          {STARS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <button
          onClick={applyFilters}
          disabled={isPending}
          className="brand-gradient text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
        >
          {isPending ? 'Filtering…' : 'Apply Filters'}
        </button>

        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-[var(--brand)] px-4 py-2.5 rounded-xl border border-gray-200 hover:border-[var(--brand)] transition-colors whitespace-nowrap"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useCurrency } from '@/lib/useCurrency'
import { CURRENCIES } from '@/lib/currency'
import { FiChevronDown } from 'react-icons/fi'

export default function CurrencySelector({ dark = false }: { dark?: boolean }) {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const current = CURRENCIES.find(c => c.code === currency)!

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors"
        style={{ color: dark ? '#fff' : '#374151', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}
      >
        {current.symbol} {current.code}
        <FiChevronDown size={11} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 min-w-44"
          style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code); setOpen(false) }}
              className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-between"
              style={{ color: c.code === currency ? 'var(--brand)' : '#374151' }}
            >
              <span>{c.label}</span>
              <span className="font-bold">{c.symbol} {c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

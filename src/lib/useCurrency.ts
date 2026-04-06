'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createElement } from 'react'
import { type Currency, DEFAULT_CURRENCY, formatPrice } from './currency'

const KEY = 'mv_currency'

interface CurrencyCtx {
  currency: Currency
  setCurrency: (c: Currency) => void
  format: (lkr: number) => string
}

// @ts-expect-error - context default
const CurrencyContext = createContext<CurrencyCtx>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY)

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Currency | null
    if (stored) setCurrencyState(stored)
  }, [])

  function setCurrency(c: Currency) {
    setCurrencyState(c)
    localStorage.setItem(KEY, c)
  }

  const format = (lkr: number) => formatPrice(lkr, currency)

  return createElement(CurrencyContext.Provider, { value: { currency, setCurrency, format } }, children)
}

export function useCurrency() {
  return useContext(CurrencyContext)
}

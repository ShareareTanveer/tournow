'use client'

import { useCurrency } from '@/lib/useCurrency'
import { CURRENCIES, type Currency, formatPrice } from '@/lib/currency'

const RATE_BY_CODE = Object.fromEntries(
  CURRENCIES.map((currency) => [currency.code, currency.rate]),
) as Record<Currency, number>

const CURRENCY_ALIASES: Record<string, Currency> = {
  RS: 'LKR',
  LKR: 'LKR',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  AUD: 'AUD',
  SGD: 'SGD',
  AED: 'AED',
}

function toLkr(amount: number, sourceCurrency: Currency) {
  return amount / RATE_BY_CODE[sourceCurrency]
}

function parseNumber(value: string) {
  return Number(value.replace(/,/g, ''))
}

function formatVisaFee(fee: string | null | undefined, selectedCurrency: Currency) {
  const raw = fee?.trim()
  if (!raw) return 'Contact us'
  if (/^(free|visa free|n\/a)$/i.test(raw)) return raw

  const normalized = raw.replace(/[–—]/g, '-')
  const match = normalized.match(
    /^(?:(USD|EUR|GBP|AUD|SGD|AED|LKR|RS)\.?\s*)?([0-9][0-9,]*(?:\.\d+)?)(?:\s*(?:-|to)\s*([0-9][0-9,]*(?:\.\d+)?))?(.*)$/i,
  )

  if (!match) return raw

  const sourceCurrency = CURRENCY_ALIASES[(match[1] ?? 'LKR').toUpperCase()]
  const firstAmount = parseNumber(match[2])
  const secondAmount = match[3] ? parseNumber(match[3]) : null
  const suffix = match[4]?.trim()

  if (!Number.isFinite(firstAmount) || !sourceCurrency) return raw

  const first = formatPrice(toLkr(firstAmount, sourceCurrency), selectedCurrency)
  const second = secondAmount && Number.isFinite(secondAmount)
    ? formatPrice(toLkr(secondAmount, sourceCurrency), selectedCurrency)
    : null

  return `${second ? `${first} - ${second}` : first}${suffix ? ` ${suffix}` : ''}`
}

export default function VisaFee({ fee }: { fee?: string | null }) {
  const { currency } = useCurrency()

  return <>{formatVisaFee(fee, currency)}</>
}

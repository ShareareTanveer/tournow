export type Currency = 'LKR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'SGD' | 'AED'

export const CURRENCIES: { code: Currency; symbol: string; label: string; rate: number }[] = [
  { code: 'LKR', symbol: 'Rs', label: 'Sri Lankan Rupee', rate: 1 },
  { code: 'USD', symbol: '$', label: 'US Dollar', rate: 0.0033 },
  { code: 'EUR', symbol: '€', label: 'Euro', rate: 0.0030 },
  { code: 'GBP', symbol: '£', label: 'British Pound', rate: 0.0026 },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', rate: 0.0050 },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', rate: 0.0044 },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham', rate: 0.012 },
]

export function formatPrice(lkrAmount: number, currency: Currency): string {
  const c = CURRENCIES.find(x => x.code === currency)!
  const converted = lkrAmount * c.rate
  if (currency === 'LKR') return `Rs ${Math.round(converted).toLocaleString()}`
  if (converted >= 1000) return `${c.symbol}${(converted / 1000).toFixed(1)}k`
  return `${c.symbol}${converted.toFixed(0)}`
}

export const DEFAULT_CURRENCY: Currency = 'LKR'

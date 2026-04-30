'use client'

import { useState } from 'react'
import { FiCalendar } from 'react-icons/fi'
import { useCustomerAuth } from '@/lib/customerAuth'
import AuthModal from '@/components/auth/AuthModal'
import BookingModal from '@/components/booking/BookingModal'

interface BookingTarget {
  id: string
  type: 'package' | 'tour'
  title: string
  price: number
  priceTwin?: number | null
  priceChild?: number | null
  extraNightPrice?: number | null
  duration: number
  nights: number
  paxType?: string | null
  options?: { label: string; price: number; isDefault?: boolean }[] | null
  cancellationTiers?: { daysBeforeDep: number; refundPercent: number; label: string }[] | null
  cancellationPolicy?: string | null
}

interface Props {
  target: BookingTarget
  className?: string
  label?: string
}

export default function BookNowButton({ target, className, label = 'Book Now' }: Props) {
  const { customer } = useCustomerAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  function handleClick() {
    if (!customer) {
      setAuthOpen(true)
    } else {
      setBookingOpen(true)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={className ?? 'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90'}
        style={!className ? { background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' } : undefined}
      >
        <FiCalendar size={15} />
        {label}
      </button>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => { setAuthOpen(false); setBookingOpen(true) }}
        initialTab="login"
      />

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        target={target}
      />
    </>
  )
}

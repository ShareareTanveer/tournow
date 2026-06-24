type Supplier = {
  name?: string | null
  phone?: string | null
  whatsappNumber?: string | null
}

type BookingMessage = {
  bookingRef: string
  itemTitle: string
  customerName: string
  customerPhone: string
  travelDate: string | Date
  returnDate?: string | Date | null
  paxAdult: number
  paxChild?: number | null
  paxInfant?: number | null
  totalPrice: number
  currency?: string | null
  notes?: string | null
  confirmUrl?: string | null
}

function cleanWhatsAppNumber(value?: string | null) {
  return (value ?? '').replace(/[^\d]/g, '')
}

function formatDate(value?: string | Date | null) {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getSupplierWhatsAppNumber(supplier?: Supplier | null) {
  return cleanWhatsAppNumber(supplier?.whatsappNumber || supplier?.phone)
}

export function buildSupplierBookingMessage(booking: BookingMessage) {
  const lines = [
    'New booking request',
    '',
    `Booking: #${booking.bookingRef.slice(-10).toUpperCase()}`,
    `Package/Tour: ${booking.itemTitle}`,
    `Customer: ${booking.customerName}`,
    `Phone: ${booking.customerPhone}`,
    `Travel: ${formatDate(booking.travelDate)}`,
    booking.returnDate ? `Return: ${formatDate(booking.returnDate)}` : '',
    `Passengers: ${booking.paxAdult} adult${booking.paxAdult !== 1 ? 's' : ''}${booking.paxChild ? `, ${booking.paxChild} child` : ''}${booking.paxInfant ? `, ${booking.paxInfant} infant` : ''}`,
    `Total: ${booking.currency ?? 'LKR'} ${booking.totalPrice.toLocaleString()}`,
    booking.notes ? `Notes: ${booking.notes}` : '',
    '',
    booking.confirmUrl ? `Confirm supplier availability: ${booking.confirmUrl}` : '',
  ]

  return lines.filter(Boolean).join('\n')
}

export function buildSupplierWhatsAppLink(supplier: Supplier | null | undefined, booking: BookingMessage) {
  const phone = getSupplierWhatsAppNumber(supplier)
  if (!phone) return null
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildSupplierBookingMessage(booking))}`
}

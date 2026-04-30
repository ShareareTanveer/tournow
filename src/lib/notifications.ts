import { prisma } from './prisma'
import type { NotificationType, NotificationAudience } from '@prisma/client'

export type { NotificationType, NotificationAudience }

interface CreateNotificationInput {
  type: NotificationType
  audience: NotificationAudience
  title: string
  body: string
  link?: string
  userId?: string       // specific admin user, or null = all admins
  customerId?: string   // specific customer
  entityType?: string
  entityId?: string
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    return await prisma.notification.create({ data: input })
  } catch (e) {
    console.error('[notifications] create failed', e)
    return null
  }
}

/** Broadcast to all active admin users */
export async function notifyAllAdmins(input: Omit<CreateNotificationInput, 'audience' | 'userId'>) {
  try {
    return await prisma.notification.create({
      data: { ...input, audience: 'ADMIN', userId: null },
    })
  } catch (e) {
    console.error('[notifications] notifyAllAdmins failed', e)
    return null
  }
}

/** Notify a specific customer */
export async function notifyCustomer(customerId: string, input: Omit<CreateNotificationInput, 'audience' | 'customerId'>) {
  try {
    return await prisma.notification.create({
      data: { ...input, audience: 'CUSTOMER', customerId },
    })
  } catch (e) {
    console.error('[notifications] notifyCustomer failed', e)
    return null
  }
}

// ── SSE subscriber registry ───────────────────────────────────────────────────
// Maps audience key → set of response controllers
// adminKey = "admin"   customerKey = "customer:<customerId>"
//
// IMPORTANT: stored on globalThis so the same Map instance survives
// Next.js hot-reloads and module re-evaluations in dev mode.
// Without this, the SSE stream route and the notify route each get a
// fresh empty Map — push finds no subscribers and nothing is delivered.

type Controller = ReadableStreamDefaultController<Uint8Array>

const g = globalThis as unknown as { _sseSubscribers?: Map<string, Set<Controller>> }
if (!g._sseSubscribers) g._sseSubscribers = new Map()
const subscribers = g._sseSubscribers

export function sseSubscribe(key: string, ctrl: Controller) {
  if (!subscribers.has(key)) subscribers.set(key, new Set())
  subscribers.get(key)!.add(ctrl)
}

export function sseUnsubscribe(key: string, ctrl: Controller) {
  subscribers.get(key)?.delete(ctrl)
}

function sseEncode(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}

/** Push an SSE event to all connected clients for a given key */
export function ssePush(key: string, data: object) {
  const set = subscribers.get(key)
  if (!set || set.size === 0) return
  const bytes = sseEncode(data)
  for (const ctrl of set) {
    try { ctrl.enqueue(bytes) } catch { set.delete(ctrl) }
  }
}

/** Push to all admin subscribers */
export function ssePushAdmin(data: object) {
  ssePush('admin', data)
}

/** Push to a specific customer */
export function ssePushCustomer(customerId: string, data: object) {
  ssePush(`customer:${customerId}`, data)
}

/** Create notification + push SSE immediately */
export async function notify(input: CreateNotificationInput) {
  const notif = await createNotification(input)
  if (!notif) return null

  const payload = {
    id: notif.id, type: notif.type, title: notif.title,
    body: notif.body, link: notif.link, createdAt: notif.createdAt,
    isRead: false,
  }

  if (input.audience === 'ADMIN') {
    ssePushAdmin(payload)
  } else if (input.audience === 'CUSTOMER' && input.customerId) {
    ssePushCustomer(input.customerId, payload)
  }

  return notif
}

/** Convenience: new booking came in — notify all admins + the customer */
export async function onNewBooking(opts: {
  bookingId: string; bookingRef: string; customerName: string
  customerId?: string | null; packageTitle: string
}) {
  await notify({
    type: 'NEW_BOOKING', audience: 'ADMIN',
    title: 'New Booking',
    body: `${opts.customerName} booked "${opts.packageTitle}"`,
    link: `/admin/bookings/${opts.bookingId}`,
    entityType: 'booking', entityId: opts.bookingId,
  })
  if (opts.customerId) {
    await notify({
      type: 'NEW_BOOKING', audience: 'CUSTOMER', customerId: opts.customerId,
      title: 'Booking Confirmed',
      body: `Your booking for "${opts.packageTitle}" has been received. Ref: ${opts.bookingRef}`,
      link: `/my/bookings/${opts.bookingId}`,
      entityType: 'booking', entityId: opts.bookingId,
    })
  }
}

export async function onBookingStatusChange(opts: {
  bookingId: string; customerId?: string | null; packageTitle: string; newStatus: string
  triggeredBy?: 'admin' | 'customer'  // who caused this change
}) {
  const triggeredBy = opts.triggeredBy ?? 'admin'

  // Labels for notifications sent TO the customer (only when admin triggers)
  const CUSTOMER_LABELS: Record<string, string> = {
    CONFIRMED:     'Your booking has been confirmed by our team!',
    ALL_CONFIRMED: 'All documents confirmed — you\'re all set!',
    MAIL_SENT:     'Your tickets and itinerary have been sent.',
    CANCELLED:     'Your booking has been cancelled.',
    AWAITING_CONFIRM: 'Your quote is ready — please review and confirm.',
  }

  // Labels for notifications sent TO admins (only when customer triggers)
  const ADMIN_LABELS: Record<string, string> = {
    CONFIRMED:        'Customer confirmed the booking',
    RECEIPT_UPLOADED: 'Customer uploaded a payment receipt',
    CANCELLED:        'Customer cancelled the booking',
  }

  // Notify customer only when admin triggered the change
  if (triggeredBy === 'admin' && opts.customerId && CUSTOMER_LABELS[opts.newStatus]) {
    await notify({
      type: 'BOOKING_STATUS', audience: 'CUSTOMER', customerId: opts.customerId,
      title: `Booking Update — ${opts.packageTitle}`,
      body: CUSTOMER_LABELS[opts.newStatus],
      link: `/my/bookings/${opts.bookingId}`,
      entityType: 'booking', entityId: opts.bookingId,
    })
  }

  // Notify admins only when customer triggered the change
  if (triggeredBy === 'customer' && ADMIN_LABELS[opts.newStatus]) {
    await notify({
      type: 'BOOKING_STATUS', audience: 'ADMIN',
      title: `Booking Update — ${opts.packageTitle}`,
      body: ADMIN_LABELS[opts.newStatus],
      link: `/admin/bookings/${opts.bookingId}`,
      entityType: 'booking', entityId: opts.bookingId,
    })
  }
}

export async function onNewInquiry(opts: {
  inquiryId: string; name: string; destination?: string | null
}) {
  await notify({
    type: 'NEW_INQUIRY', audience: 'ADMIN',
    title: 'New Inquiry',
    body: `${opts.name} sent an inquiry${opts.destination ? ` for ${opts.destination}` : ''}`,
    link: `/admin/inquiries`,
    entityType: 'inquiry', entityId: opts.inquiryId,
  })
}

export async function onNewConsultation(opts: {
  consultationId: string; name: string; method: string
}) {
  await notify({
    type: 'NEW_CONSULTATION', audience: 'ADMIN',
    title: 'New Consultation Request',
    body: `${opts.name} requested a ${opts.method.replace(/_/g,' ').toLowerCase()}`,
    link: `/admin/consultations`,
    entityType: 'consultation', entityId: opts.consultationId,
  })
}

export async function onNewReview(opts: { reviewId: string; name: string; rating: number }) {
  await notify({
    type: 'NEW_REVIEW', audience: 'ADMIN',
    title: 'New Review',
    body: `${opts.name} left a ${opts.rating}-star review`,
    link: `/admin/reviews`,
    entityType: 'review', entityId: opts.reviewId,
  })
}

export async function onPaymentReceived(opts: {
  bookingId: string; customerId?: string | null; amount: number; packageTitle: string
}) {
  await notify({
    type: 'PAYMENT_RECEIVED', audience: 'ADMIN',
    title: 'Payment Received',
    body: `LKR ${opts.amount.toLocaleString()} received for "${opts.packageTitle}"`,
    link: `/admin/bookings/${opts.bookingId}`,
    entityType: 'booking', entityId: opts.bookingId,
  })
}

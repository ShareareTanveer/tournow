import { prisma } from './prisma'
import {
  buildSupplierBookingMessage,
  formatSupplierMessageDate,
  getSupplierWhatsAppNumber,
} from './supplier-whatsapp'

type Supplier = {
  name?: string | null
  phone?: string | null
  whatsappNumber?: string | null
}

type BookingMessage = {
  bookingId?: string
  bookingType?: string
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

type TwilioSettings = {
  accountSid: string
  authToken: string
  from: string
  contentSid: string
}

type WhatsAppLogInput = {
  status: string
  reason?: string
  booking: BookingMessage
  supplier?: Supplier | null
  toNumber?: string
  fromNumber?: string
  twilioSid?: string
  responseStatus?: number
  responseBody?: string
  error?: string
  requestPayload?: Record<string, string>
}

function asWhatsappAddress(value: string) {
  const trimmed = value.trim()
  if (trimmed.startsWith('whatsapp:')) return trimmed
  const digits = trimmed.replace(/[^\d]/g, '')
  return digits ? `whatsapp:+${digits}` : ''
}

async function writeWhatsAppLog({
  status,
  reason,
  booking,
  supplier,
  toNumber,
  fromNumber,
  twilioSid,
  responseStatus,
  responseBody,
  error,
  requestPayload,
}: WhatsAppLogInput) {
  await prisma.whatsAppMessageLog.create({
    data: {
      provider: 'twilio',
      status,
      reason,
      bookingId: booking.bookingId,
      bookingRef: booking.bookingRef,
      bookingType: booking.bookingType,
      itemTitle: booking.itemTitle,
      supplierName: supplier?.name,
      toNumber,
      fromNumber,
      twilioSid,
      responseStatus,
      responseBody,
      error,
      requestPayload: requestPayload as any,
    },
  }).catch((logError) => {
    console.error('[twilio-whatsapp] log write failed', logError)
  })
}

async function getTwilioSettings(): Promise<TwilioSettings | null> {
  const rows = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [
          'twilio_account_sid',
          'twilio_auth_token',
          'twilio_whatsapp_from',
          'twilio_content_sid',
        ],
      },
    },
  })
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value?.trim() ?? '']))
  const accountSid = settings.twilio_account_sid
  const authToken = settings.twilio_auth_token
  const from = asWhatsappAddress(settings.twilio_whatsapp_from)

  if (!accountSid || !authToken || !from) return null

  return {
    accountSid,
    authToken,
    from,
    contentSid: settings.twilio_content_sid ?? '',
  }
}

export async function sendSupplierBookingWhatsApp({
  supplier,
  booking,
}: {
  supplier?: Supplier | null
  booking: BookingMessage
}) {
  const settings = await getTwilioSettings()
  if (!settings) {
    await writeWhatsAppLog({
      status: 'skipped',
      reason: 'not_configured',
      supplier,
      booking,
    })
    return { sent: false, reason: 'not_configured' as const }
  }

  const toNumber = getSupplierWhatsAppNumber(supplier)
  if (!toNumber) {
    await writeWhatsAppLog({
      status: 'failed',
      reason: 'missing_supplier_number',
      supplier,
      booking,
      fromNumber: settings.from,
    })
    return { sent: false, reason: 'missing_supplier_number' as const }
  }

  const params = new URLSearchParams()
  params.set('From', settings.from)
  params.set('To', `whatsapp:+${toNumber}`)

  if (settings.contentSid) {
    params.set('ContentSid', settings.contentSid)
    params.set('ContentVariables', JSON.stringify({
      1: formatSupplierMessageDate(booking.travelDate),
      2: `Booking #${booking.bookingRef.slice(-10).toUpperCase()} - ${booking.itemTitle}. Confirm: ${booking.confirmUrl ?? ''}`,
    }))
  } else {
    params.set('Body', buildSupplierBookingMessage(booking))
  }

  const requestPayload = Object.fromEntries(params.entries())
  const toAddress = requestPayload.To

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${settings.accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${settings.accountSid}:${settings.authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    const text = await res.text().catch(() => '')

    if (!res.ok) {
      console.error('[twilio-whatsapp] send failed', res.status, text.slice(0, 500))
      await writeWhatsAppLog({
        status: 'failed',
        reason: 'twilio_error',
        supplier,
        booking,
        toNumber: toAddress,
        fromNumber: settings.from,
        responseStatus: res.status,
        responseBody: text,
        requestPayload,
      })
      return { sent: false, reason: 'twilio_error' as const }
    }

    let data: Record<string, unknown> = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {}
    const sid = typeof data.sid === 'string' ? data.sid : undefined
    await writeWhatsAppLog({
      status: 'sent',
      supplier,
      booking,
      toNumber: toAddress,
      fromNumber: settings.from,
      twilioSid: sid,
      responseStatus: res.status,
      responseBody: text,
      requestPayload,
    })
    return { sent: true, sid }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[twilio-whatsapp] send exception', message)
    await writeWhatsAppLog({
      status: 'failed',
      reason: 'exception',
      supplier,
      booking,
      toNumber: toAddress,
      fromNumber: settings.from,
      error: message,
      requestPayload,
    })
    return { sent: false, reason: 'exception' as const }
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/my/bookings/[id]/receipt
 * Returns an HTML payment receipt for a confirmed+paid booking.
 * Only accessible by the booking's customer.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params

  const token = req.cookies.get('customer_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Try package booking first, then tour booking
  let booking: any = null
  let title = ''
  let type: 'package' | 'tour' = 'package'

  const pkgBooking = await prisma.booking.findFirst({
    where: { id, customerId: payload.userId },
    include: { package: { select: { title: true } } },
  })

  if (pkgBooking) {
    booking = pkgBooking
    title = pkgBooking.package.title
    type = 'package'
  } else {
    const tourBooking = await prisma.tourBooking.findFirst({
      where: { id, customerId: payload.userId },
      include: { tour: { select: { title: true } } },
    })
    if (tourBooking) {
      booking = tourBooking
      title = tourBooking.tour.title
      type = 'tour'
    }
  }

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (booking.paymentStatus !== 'PAID') return NextResponse.json({ error: 'Not paid' }, { status: 403 })

  const paidAt = booking.updatedAt
  const travelDate = new Date(booking.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const paidAtStr = new Date(paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const ref = booking.bookingRef

  const lineItems: { label: string; price: number }[] =
    (booking.staffQuote as any)?.lineItems ?? []

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Payment Receipt – ${ref}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; color: #1f2937; }
  .page { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
  .header { background: linear-gradient(135deg, #059669, #047857); color: #fff; padding: 28px 32px; }
  .header h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .header p { font-size: 13px; opacity: 0.85; margin-top: 4px; }
  .paid-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.2); border: 1.5px solid rgba(255,255,255,0.4); border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 700; margin-top: 12px; }
  .body { padding: 28px 32px; }
  .section-title { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 24px; }
  .info-item label { font-size: 10px; color: #9ca3af; font-weight: 600; text-transform: uppercase; display: block; }
  .info-item span { font-size: 13px; color: #111827; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #f9fafb; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; text-align: left; padding: 8px 12px; }
  td { padding: 9px 12px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
  .total-row td { font-weight: 800; font-size: 15px; background: #ecfdf5; color: #065f46; border-bottom: none; }
  .footer { border-top: 1px solid #f3f4f6; padding: 18px 32px; text-align: center; }
  .footer p { font-size: 11px; color: #9ca3af; }
  .actions { display: flex; justify-content: flex-end; padding: 16px 32px 0; gap: 8px; }
  .btn-pdf { display: inline-flex; align-items: center; gap: 6px; background: #059669; color: #fff; border: none; border-radius: 10px; padding: 9px 18px; font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none; }
  .btn-pdf:hover { background: #047857; }
  @media print {
    body { background: #fff; }
    .page { box-shadow: none; margin: 0; border-radius: 0; max-width: 100%; }
    .actions { display: none; }
  }
</style>
</head>
<body>
<div class="actions no-print">
  <button class="btn-pdf" onclick="window.print()">⬇ Download as PDF</button>
</div>
<div class="page">
  <div class="header">
    <h1>Metro Voyage</h1>
    <p>Payment Receipt</p>
    <div class="paid-badge">✓ PAID</div>
  </div>
  <div class="body">
    <div class="section-title">Booking Details</div>
    <div class="info-grid">
      <div class="info-item"><label>Booking Ref</label><span>${ref.slice(-8).toUpperCase()}</span></div>
      <div class="info-item"><label>Customer</label><span>${booking.customerName}</span></div>
      <div class="info-item"><label>Trip</label><span>${title}</span></div>
      <div class="info-item"><label>Travel Date</label><span>${travelDate}</span></div>
      <div class="info-item"><label>Passengers</label><span>${booking.paxAdult} Adult${booking.paxAdult > 1 ? 's' : ''}${booking.paxChild > 0 ? `, ${booking.paxChild} Child` : ''}${booking.paxInfant > 0 ? `, ${booking.paxInfant} Infant` : ''}</span></div>
      <div class="info-item"><label>Paid On</label><span>${paidAtStr}</span></div>
    </div>

    <div class="section-title">Payment Summary</div>
    <table>
      <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>
        ${lineItems.length > 0
          ? lineItems.map(item => `<tr><td>${item.label}</td><td style="text-align:right">LKR ${item.price.toLocaleString('en-LK')}</td></tr>`).join('')
          : `<tr><td>${title}</td><td style="text-align:right">LKR ${booking.totalPrice.toLocaleString('en-LK')}</td></tr>`
        }
        <tr class="total-row"><td>Total Paid</td><td style="text-align:right">LKR ${booking.totalPrice.toLocaleString('en-LK')}</td></tr>
      </tbody>
    </table>
  </div>
  <div class="footer">
    <p>Thank you for booking with Metro Voyage &bull; This is an official payment receipt</p>
    <p style="margin-top:4px">+94 70 454 5455 &bull; info@haloholidays.lk</p>
  </div>
</div>
<script>
  if (new URLSearchParams(window.location.search).get('print') === '1') window.print();
</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

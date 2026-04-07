/**
 * Generates a self-contained HTML ticket/receipt page.
 * This is served at /api/admin/bookings/[id]/ticket and stored as ticketUrl.
 */

interface TicketData {
  bookingRef: string
  customerName: string
  customerEmail: string
  customerPhone: string
  title: string         // package or tour title
  image?: string
  travelDate: Date
  returnDate?: Date | null
  paxAdult: number
  paxChild: number
  paxInfant: number
  rooms?: { type: string; qty: number; label: string }[] | null
  roomType?: string | null
  lineItems?: { label: string; price: number }[]
  totalPrice: number
  currency: string
  adminNotes?: string | null
  issuedAt: Date
  companyName?: string
  companyPhone?: string
  companyEmail?: string
}

export function generateTicketHtml(data: TicketData): string {
  const company = data.companyName ?? 'Metro Voyage'
  const phone   = data.companyPhone ?? '+94 70 454 5455'
  const email   = data.companyEmail ?? 'contact@metrovoyage.com'
  const ref     = data.bookingRef.slice(-10).toUpperCase()

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const fmtMoney = (n: number) =>
    `${data.currency} ${n.toLocaleString()}`

  const roomsText = data.rooms?.length
    ? data.rooms.map(r => `${r.label} × ${r.qty}`).join(', ')
    : (data.roomType ?? '—')

  const paxText = [
    data.paxAdult > 0 ? `${data.paxAdult} Adult${data.paxAdult > 1 ? 's' : ''}` : '',
    data.paxChild > 0 ? `${data.paxChild} Child${data.paxChild > 1 ? 'ren' : ''}` : '',
    data.paxInfant > 0 ? `${data.paxInfant} Infant${data.paxInfant > 1 ? 's' : ''}` : '',
  ].filter(Boolean).join(', ')

  const lineItemsHtml = data.lineItems?.length
    ? data.lineItems.map(item => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151">${item.label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;text-align:right;font-weight:600">${fmtMoney(item.price)}</td>
        </tr>`).join('')
    : `<tr><td colspan="2" style="padding:8px 12px;font-size:13px;color:#9ca3af;text-align:center">—</td></tr>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation — ${ref}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; color: #111827; }
    @media print {
      body { background: white; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="max-width:680px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:28px 32px;color:white">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
        <div>
          <p style="font-size:22px;font-weight:900;letter-spacing:-0.5px">${company}</p>
          <p style="font-size:13px;opacity:0.85;margin-top:2px">Booking Confirmation</p>
        </div>
        <div style="text-align:right">
          <p style="font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:1px">Booking Reference</p>
          <p style="font-size:24px;font-weight:900;letter-spacing:2px;font-family:monospace">${ref}</p>
        </div>
      </div>
    </div>

    <!-- Status banner -->
    <div style="background:#ecfdf5;border-bottom:2px solid #86efac;padding:12px 32px;display:flex;align-items:center;gap:10px">
      <div style="width:10px;height:10px;border-radius:50%;background:#22c55e;flex-shrink:0"></div>
      <p style="font-size:13px;font-weight:700;color:#15803d">CONFIRMED — Your booking is fully confirmed. Have a wonderful trip!</p>
    </div>

    <!-- Trip info -->
    <div style="padding:28px 32px">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:12px">Trip Details</p>
      <div style="display:flex;gap:16px;align-items:flex-start">
        ${data.image ? `<img src="${data.image}" alt="" style="width:80px;height:60px;border-radius:10px;object-fit:cover;flex-shrink:0" />` : ''}
        <div style="flex:1">
          <p style="font-size:18px;font-weight:800;color:#111827;line-height:1.3">${data.title}</p>
          <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div style="background:#f9fafb;border-radius:10px;padding:10px 12px">
              <p style="font-size:10px;color:#9ca3af;font-weight:600;text-transform:uppercase;margin-bottom:3px">Travel Date</p>
              <p style="font-size:13px;font-weight:700;color:#111827">${fmtDate(data.travelDate)}</p>
            </div>
            ${data.returnDate ? `
            <div style="background:#f9fafb;border-radius:10px;padding:10px 12px">
              <p style="font-size:10px;color:#9ca3af;font-weight:600;text-transform:uppercase;margin-bottom:3px">Return Date</p>
              <p style="font-size:13px;font-weight:700;color:#111827">${fmtDate(data.returnDate)}</p>
            </div>` : ''}
            <div style="background:#f9fafb;border-radius:10px;padding:10px 12px">
              <p style="font-size:10px;color:#9ca3af;font-weight:600;text-transform:uppercase;margin-bottom:3px">Travellers</p>
              <p style="font-size:13px;font-weight:700;color:#111827">${paxText}</p>
            </div>
            <div style="background:#f9fafb;border-radius:10px;padding:10px 12px">
              <p style="font-size:10px;color:#9ca3af;font-weight:600;text-transform:uppercase;margin-bottom:3px">Rooms</p>
              <p style="font-size:13px;font-weight:700;color:#111827">${roomsText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr style="border:none;border-top:1px solid #f3f4f6;margin:0 32px" />

    <!-- Guest info -->
    <div style="padding:24px 32px">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:12px">Guest Information</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
        <div>
          <p style="font-size:10px;color:#9ca3af;font-weight:600;text-transform:uppercase;margin-bottom:3px">Name</p>
          <p style="font-size:13px;font-weight:700;color:#111827">${data.customerName}</p>
        </div>
        <div>
          <p style="font-size:10px;color:#9ca3af;font-weight:600;text-transform:uppercase;margin-bottom:3px">Email</p>
          <p style="font-size:13px;font-weight:600;color:#2563eb">${data.customerEmail}</p>
        </div>
        <div>
          <p style="font-size:10px;color:#9ca3af;font-weight:600;text-transform:uppercase;margin-bottom:3px">Phone</p>
          <p style="font-size:13px;font-weight:700;color:#111827">${data.customerPhone}</p>
        </div>
      </div>
    </div>

    <hr style="border:none;border-top:1px solid #f3f4f6;margin:0 32px" />

    <!-- Price breakdown -->
    <div style="padding:24px 32px">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:12px">Price Breakdown</p>
      <table style="width:100%;border-collapse:collapse">
        <tbody>
          ${lineItemsHtml}
          <tr style="background:#fff7ed">
            <td style="padding:12px;font-size:15px;font-weight:900;color:#d97706">Total Amount</td>
            <td style="padding:12px;font-size:18px;font-weight:900;color:#d97706;text-align:right">${fmtMoney(data.totalPrice)}</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:11px;color:#9ca3af;margin-top:8px">All prices inclusive of applicable taxes and fees.</p>
    </div>

    ${data.adminNotes ? `
    <hr style="border:none;border-top:1px solid #f3f4f6;margin:0 32px" />
    <div style="padding:20px 32px;background:#fffbeb">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#d97706;margin-bottom:6px">Notes from ${company}</p>
      <p style="font-size:13px;color:#92400e;line-height:1.6">${data.adminNotes}</p>
    </div>` : ''}

    <!-- Footer -->
    <div style="background:#1f2937;padding:24px 32px;color:white">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px">
        <div>
          <p style="font-size:14px;font-weight:800">${company}</p>
          <p style="font-size:12px;color:#9ca3af;margin-top:4px">${phone}</p>
          <p style="font-size:12px;color:#9ca3af">${email}</p>
        </div>
        <div style="text-align:right">
          <p style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Issued</p>
          <p style="font-size:12px;color:#d1d5db">${fmtDate(data.issuedAt)}</p>
          <p style="font-size:10px;color:#6b7280;margin-top:8px">Ref: ${ref}</p>
        </div>
      </div>
      <div class="no-print" style="margin-top:20px;border-top:1px solid #374151;padding-top:16px;text-align:center">
        <button onclick="window.print()"
          style="background:#f59e0b;color:white;border:none;padding:10px 28px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">
          🖨 Print / Save as PDF
        </button>
      </div>
    </div>

  </div>
</body>
</html>`
}

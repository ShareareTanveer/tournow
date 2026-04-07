import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const FROM = `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`

// ─── Inquiry Confirmation ─────────────────────────────────────────────────────

export async function sendInquiryConfirmation(to: string, name: string, packageTitle?: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'We received your inquiry – Metro Voyage',
    html: `
      <h2>Hi ${name},</h2>
      <p>Thank you for reaching out to <strong>Metro Voyage</strong>!</p>
      ${packageTitle ? `<p>We've received your inquiry about <strong>${packageTitle}</strong>.</p>` : ''}
      <p>One of our travel experts will contact you shortly to discuss your dream holiday.</p>
      <p>In the meantime, feel free to reach us at:</p>
      <ul>
        <li>📞 +94 70 454 5455</li>
        <li>📧 contact@metrovoyage.com</li>
        <li>💬 WhatsApp: +94 70 454 5455</li>
      </ul>
      <p>Warm regards,<br/>The Metro Voyage Team</p>
    `,
  })
}

export async function sendInquiryNotification(inquiry: {
  name: string
  email: string
  phone?: string | null
  message: string
  packageTitle?: string
}) {
  await transporter.sendMail({
    from: FROM,
    to: process.env.EMAIL_FROM!,
    subject: `New Inquiry from ${inquiry.name}`,
    html: `
      <h2>New Package Inquiry</h2>
      <table>
        <tr><td><strong>Name:</strong></td><td>${inquiry.name}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${inquiry.email}</td></tr>
        ${inquiry.phone ? `<tr><td><strong>Phone:</strong></td><td>${inquiry.phone}</td></tr>` : ''}
        ${inquiry.packageTitle ? `<tr><td><strong>Package:</strong></td><td>${inquiry.packageTitle}</td></tr>` : ''}
        <tr><td><strong>Message:</strong></td><td>${inquiry.message}</td></tr>
      </table>
    `,
  })
}

// ─── Consultation ─────────────────────────────────────────────────────────────

export async function sendConsultationConfirmation(to: string, name: string, method: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Consultation Request Received – Metro Voyage',
    html: `
      <h2>Hi ${name},</h2>
      <p>We've received your request for a <strong>${method}</strong> consultation.</p>
      <p>Our team will get back to you shortly to schedule your session.</p>
      <p>Contact us anytime: +94 70 454 5455 | contact@metrovoyage.com</p>
      <p>Warm regards,<br/>The Metro Voyage Team</p>
    `,
  })
}

export async function sendConsultationNotification(consultation: {
  name: string
  email: string
  phone?: string | null
  method: string
  additionalInfo?: string | null
}) {
  await transporter.sendMail({
    from: FROM,
    to: process.env.EMAIL_FROM!,
    subject: `New Consultation Request from ${consultation.name}`,
    html: `
      <h2>New Consultation Request</h2>
      <table>
        <tr><td><strong>Name:</strong></td><td>${consultation.name}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${consultation.email}</td></tr>
        ${consultation.phone ? `<tr><td><strong>Phone:</strong></td><td>${consultation.phone}</td></tr>` : ''}
        <tr><td><strong>Method:</strong></td><td>${consultation.method}</td></tr>
        ${consultation.additionalInfo ? `<tr><td><strong>Notes:</strong></td><td>${consultation.additionalInfo}</td></tr>` : ''}
      </table>
    `,
  })
}

// ─── Booking Flow ─────────────────────────────────────────────────────────────

/** Sent to customer immediately after they submit a booking request */
export async function sendBookingCreated(booking: {
  customerEmail: string
  customerName: string
  bookingRef: string
  title: string   // package or tour title
  travelDate: Date
  totalPrice: number
}) {
  await transporter.sendMail({
    from: FROM,
    to: booking.customerEmail,
    subject: `Booking Request Received – ${booking.bookingRef} | Metro Voyage`,
    html: `
      <h2>Hi ${booking.customerName},</h2>
      <p>We've received your booking request for <strong>${booking.title}</strong>.</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:4px 8px"><strong>Booking Ref:</strong></td><td style="padding:4px 8px">${booking.bookingRef}</td></tr>
        <tr><td style="padding:4px 8px"><strong>Travel Date:</strong></td><td style="padding:4px 8px">${new Date(booking.travelDate).toDateString()}</td></tr>
        <tr><td style="padding:4px 8px"><strong>Estimated Total:</strong></td><td style="padding:4px 8px">LKR ${booking.totalPrice.toLocaleString()}</td></tr>
      </table>
      <p>Our team will review your request and prepare a personalised quote for you shortly.</p>
      <p>Questions? Call us: <strong>+94 70 454 5455</strong></p>
      <p>Warm regards,<br/>The Metro Voyage Team</p>
    `,
  })
}

/** Sent to admin when a new booking request arrives */
export async function sendBookingCreatedAdmin(booking: {
  bookingRef: string
  customerName: string
  customerEmail: string
  customerPhone: string
  title: string
  travelDate: Date
  totalPrice: number
}) {
  await transporter.sendMail({
    from: FROM,
    to: process.env.EMAIL_FROM!,
    subject: `New Booking Request – ${booking.bookingRef}`,
    html: `
      <h2>New Booking Request</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:4px 8px"><strong>Ref:</strong></td><td style="padding:4px 8px">${booking.bookingRef}</td></tr>
        <tr><td style="padding:4px 8px"><strong>Customer:</strong></td><td style="padding:4px 8px">${booking.customerName} (${booking.customerEmail})</td></tr>
        <tr><td style="padding:4px 8px"><strong>Phone:</strong></td><td style="padding:4px 8px">${booking.customerPhone}</td></tr>
        <tr><td style="padding:4px 8px"><strong>Package/Tour:</strong></td><td style="padding:4px 8px">${booking.title}</td></tr>
        <tr><td style="padding:4px 8px"><strong>Travel Date:</strong></td><td style="padding:4px 8px">${new Date(booking.travelDate).toDateString()}</td></tr>
        <tr><td style="padding:4px 8px"><strong>Est. Total:</strong></td><td style="padding:4px 8px">LKR ${booking.totalPrice.toLocaleString()}</td></tr>
      </table>
      <p>Log in to the admin panel to review and send a quote.</p>
    `,
  })
}

/** Sent to customer when admin sends a quote (AWAITING_CONFIRM) */
export async function sendQuoteToCustomer(data: {
  customerEmail: string
  customerName: string
  bookingRef: string
  title: string
  travelDate: Date
  lineItems: { label: string; price: number }[]
  totalPrice: number
  notes?: string | null
  validUntil?: string | null
}) {
  const itemsHtml = data.lineItems.map(item =>
    `<tr><td style="padding:4px 8px">${item.label}</td><td style="padding:4px 8px;text-align:right">LKR ${item.price.toLocaleString()}</td></tr>`
  ).join('')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  await transporter.sendMail({
    from: FROM,
    to: data.customerEmail,
    subject: `Your Quote is Ready – ${data.bookingRef} | Metro Voyage`,
    html: `
      <h2>Hi ${data.customerName},</h2>
      <p>We've prepared a personalised quote for your trip to <strong>${data.title}</strong>.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr style="background:#f59e0b;color:white">
          <th style="padding:8px;text-align:left">Item</th>
          <th style="padding:8px;text-align:right">Price</th>
        </tr>
        ${itemsHtml}
        <tr style="border-top:2px solid #f59e0b">
          <td style="padding:8px"><strong>Total</strong></td>
          <td style="padding:8px;text-align:right"><strong>LKR ${data.totalPrice.toLocaleString()}</strong></td>
        </tr>
      </table>
      ${data.notes ? `<p><strong>Notes from our team:</strong> ${data.notes}</p>` : ''}
      ${data.validUntil ? `<p style="color:#dc2626"><strong>Quote valid until:</strong> ${new Date(data.validUntil).toDateString()}</p>` : ''}
      <p>
        <a href="${appUrl}/my/bookings" style="background:#f59e0b;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
          Review &amp; Confirm Quote
        </a>
      </p>
      <p>Warm regards,<br/>The Metro Voyage Team</p>
    `,
  })
}

/** Sent to admin when customer accepts a quote */
export async function sendCustomerConfirmedAdmin(data: {
  bookingRef: string
  customerName: string
  customerEmail: string
  totalPrice: number
}) {
  await transporter.sendMail({
    from: FROM,
    to: process.env.EMAIL_FROM!,
    subject: `Quote Accepted – ${data.bookingRef}`,
    html: `
      <h2>Customer Confirmed</h2>
      <p><strong>${data.customerName}</strong> (${data.customerEmail}) has accepted the quote for booking <strong>${data.bookingRef}</strong>.</p>
      <p>Total: <strong>LKR ${data.totalPrice.toLocaleString()}</strong></p>
      <p>Please proceed with the booking confirmation.</p>
    `,
  })
}

/** Sent to customer after they accept the quote (CONFIRMED status) */
export async function sendBookingConfirmedToCustomer(data: {
  customerEmail: string
  customerName: string
  bookingRef: string
  title: string
  travelDate: Date
  totalPrice: number
}) {
  await transporter.sendMail({
    from: FROM,
    to: data.customerEmail,
    subject: `Booking Confirmed – ${data.bookingRef} | Metro Voyage`,
    html: `
      <h2>Hi ${data.customerName},</h2>
      <p>Your booking for <strong>${data.title}</strong> has been confirmed!</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:4px 8px"><strong>Booking Ref:</strong></td><td style="padding:4px 8px">${data.bookingRef}</td></tr>
        <tr><td style="padding:4px 8px"><strong>Travel Date:</strong></td><td style="padding:4px 8px">${new Date(data.travelDate).toDateString()}</td></tr>
        <tr><td style="padding:4px 8px"><strong>Total:</strong></td><td style="padding:4px 8px">LKR ${data.totalPrice.toLocaleString()}</td></tr>
      </table>
      <p>Please complete your payment and upload your receipt in <a href="${process.env.NEXT_PUBLIC_APP_URL}/my/bookings">My Bookings</a>.</p>
      <p>Warm regards,<br/>The Metro Voyage Team</p>
    `,
  })
}

/** Sent to admin when customer uploads receipt */
export async function sendReceiptUploadedAdmin(data: {
  bookingRef: string
  customerName: string
  customerEmail: string
  receiptNote?: string | null
}) {
  await transporter.sendMail({
    from: FROM,
    to: process.env.EMAIL_FROM!,
    subject: `Receipt Uploaded – ${data.bookingRef}`,
    html: `
      <h2>Payment Receipt Uploaded</h2>
      <p><strong>${data.customerName}</strong> (${data.customerEmail}) has uploaded a payment receipt for booking <strong>${data.bookingRef}</strong>.</p>
      ${data.receiptNote ? `<p>Customer note: <em>${data.receiptNote}</em></p>` : ''}
      <p>Log in to the admin panel to review and confirm.</p>
    `,
  })
}

/** Sent to customer when admin fully confirms and uploads ticket */
export async function sendTicketToCustomer(data: {
  customerEmail: string
  customerName: string
  bookingRef: string
  title: string
  travelDate: Date
  ticketUrl: string
}) {
  await transporter.sendMail({
    from: FROM,
    to: data.customerEmail,
    subject: `Your Tickets Are Ready – ${data.bookingRef} | Metro Voyage`,
    html: `
      <h2>Hi ${data.customerName}, your trip is confirmed!</h2>
      <p>We're thrilled to confirm your booking for <strong>${data.title}</strong>.</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:4px 8px"><strong>Booking Ref:</strong></td><td style="padding:4px 8px">${data.bookingRef}</td></tr>
        <tr><td style="padding:4px 8px"><strong>Travel Date:</strong></td><td style="padding:4px 8px">${new Date(data.travelDate).toDateString()}</td></tr>
      </table>
      <p style="margin-top:16px">
        <a href="${data.ticketUrl}" style="background:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
          Download Your Ticket / Voucher
        </a>
      </p>
      <p>Have a wonderful journey!<br/>The Metro Voyage Team</p>
    `,
  })
}

// ─── Legacy ───────────────────────────────────────────────────────────────────

export async function sendBookingConfirmation(booking: {
  customerEmail: string
  customerName: string
  bookingRef: string
  packageTitle: string
  travelDate: Date
  paxCount: number
  totalPrice: number
}) {
  await transporter.sendMail({
    from: FROM,
    to: booking.customerEmail,
    subject: `Booking Confirmed – ${booking.bookingRef} | Metro Voyage`,
    html: `
      <h2>Booking Confirmation</h2>
      <p>Dear ${booking.customerName},</p>
      <p>Your booking has been confirmed!</p>
      <table>
        <tr><td><strong>Booking Ref:</strong></td><td>${booking.bookingRef}</td></tr>
        <tr><td><strong>Package:</strong></td><td>${booking.packageTitle}</td></tr>
        <tr><td><strong>Travel Date:</strong></td><td>${new Date(booking.travelDate).toDateString()}</td></tr>
        <tr><td><strong>Passengers:</strong></td><td>${booking.paxCount}</td></tr>
        <tr><td><strong>Total Price:</strong></td><td>LKR ${booking.totalPrice.toLocaleString()}</td></tr>
      </table>
      <p>Our team will be in touch with further details.</p>
      <p>Warm regards,<br/>The Metro Voyage Team</p>
    `,
  })
}

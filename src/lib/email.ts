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
    subject: 'We received your inquiry – Halo Holidays',
    html: `
      <h2>Hi ${name},</h2>
      <p>Thank you for reaching out to <strong>Halo Holidays</strong>!</p>
      ${packageTitle ? `<p>We've received your inquiry about <strong>${packageTitle}</strong>.</p>` : ''}
      <p>One of our travel experts will contact you shortly to discuss your dream holiday.</p>
      <p>In the meantime, feel free to reach us at:</p>
      <ul>
        <li>📞 +94 70 454 5455</li>
        <li>📧 contact@haloholidays.lk</li>
        <li>💬 WhatsApp: +94 70 454 5455</li>
      </ul>
      <p>Warm regards,<br/>The Halo Holidays Team</p>
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
    subject: 'Consultation Request Received – Halo Holidays',
    html: `
      <h2>Hi ${name},</h2>
      <p>We've received your request for a <strong>${method}</strong> consultation.</p>
      <p>Our team will get back to you shortly to schedule your session.</p>
      <p>Contact us anytime: +94 70 454 5455 | contact@haloholidays.lk</p>
      <p>Warm regards,<br/>The Halo Holidays Team</p>
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

// ─── Booking ──────────────────────────────────────────────────────────────────

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
    subject: `Booking Confirmed – ${booking.bookingRef} | Halo Holidays`,
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
      <p>Warm regards,<br/>The Halo Holidays Team</p>
    `,
  })
}

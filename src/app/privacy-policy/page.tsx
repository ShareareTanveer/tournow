import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="brand-gradient py-12 px-4 text-center text-white">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-white/70 mt-2 text-sm">Last updated: June 2025</p>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 prose prose-gray max-w-none text-gray-600 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-800">Information We Collect</h2>
            <p>We collect personal information you provide directly, including your name, email address, and contact number when you submit forms on our website. We also collect technical data such as browsing information to enhance your experience.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-800">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>To create tailored holiday packages based on your preferences</li>
              <li>To complete bookings and process payments</li>
              <li>To deliver customer service and respond to inquiries</li>
              <li>To send relevant travel offers and updates (with your consent)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-800">Information Sharing</h2>
            <p>We share your information with trusted partners only as necessary to fulfill your booking — including hotels, airlines, and payment processors — all of whom are bound by confidentiality requirements. We never sell or trade your personal information.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-800">Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information. All video consultations are conducted through secure, encrypted platforms.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-800">Contact Us</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:contact@haloholidays.lk" className="text-[var(--brand)]">contact@haloholidays.lk</a> or call +94 70 454 5455.</p>
          </section>
        </div>
      </div>
    </div>
  )
}

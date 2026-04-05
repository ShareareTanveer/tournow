import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Help & FAQ', description: 'Frequently asked questions about booking, payments, visas, and more.' }

const FAQS = [
  { q: 'How do I book a holiday package?', a: 'Browse our packages, select one you like, and submit an inquiry form. Our team will contact you within a few hours to personalise your booking. Alternatively, call us at +94 70 454 5455 or book a free consultation.' },
  { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards, bank transfers (Standard Chartered, NTB, HSBC, Seylan, NDB), and offer flexible installment plans. A credit card is not required.' },
  { q: 'Can I change my travel dates after booking?', a: 'Yes, date changes are possible depending on the package and supplier availability. Additional charges may apply. Contact us as soon as possible if you need to change dates.' },
  { q: 'Do you provide visa assistance?', a: 'Yes! We offer free visa consultation for all destinations. Submit an inquiry mentioning your destination and our team will guide you through the requirements and process.' },
  { q: 'Are your packages customizable?', a: 'Absolutely. We specialise in custom-tailored holidays. Tell us your budget, preferences, and travel dates and we will craft a unique itinerary just for you.' },
  { q: 'Is travel insurance included?', a: 'Travel insurance is not automatically included but is strongly recommended. We can connect you with reputable travel insurance providers.' },
  { q: 'How do I contact you during my trip?', a: 'Our 24/7 toll-free support line is always available. You can call +94 70 454 5455 or message us on WhatsApp. We are here until 10 PM every day.' },
  { q: 'Do you offer group discounts?', a: 'Yes! We offer special rates for groups of 10+ travellers. Contact us for a custom group quotation.' },
  { q: 'What is your cancellation policy?', a: 'Cancellation policies vary by package and travel dates. Our team will clearly outline the terms when you book. We always try to offer the most flexible options available.' },
  { q: 'Are you a licensed travel agency?', a: 'Yes, Halo Holidays is fully licensed by the Sri Lanka Tourism Development Authority (SLTDA) with registration number PV 00250114, and certified by the Civil Aviation Authority. We are fully bonded and insured.' },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="brand-gradient py-16 px-4 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Help & FAQ</h1>
        <p className="text-white/80">Find answers to the most common questions</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-4 mb-12">
          {FAQS.map((faq, i) => (
            <details key={i} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 list-none font-semibold text-gray-800">
                {faq.q}
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">{faq.a}</div>
            </details>
          ))}
        </div>

        <div className="bg-[var(--brand-light)] rounded-2xl p-8 text-center border border-[var(--brand)]/20">
          <h3 className="font-bold text-gray-800 text-xl mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-6">Our team is ready to help. Reach us by phone, WhatsApp, or email.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+94704545455" className="brand-gradient text-white font-semibold px-6 py-3 rounded-full hover:opacity-90">📞 Call Us</a>
            <a href="https://wa.me/94704545455" target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full transition-colors">💬 WhatsApp</a>
            <Link href="/contact" className="border-2 border-[var(--brand)] text-[var(--brand)] font-semibold px-6 py-3 rounded-full hover:bg-[var(--brand)] hover:text-white transition-colors">✉️ Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

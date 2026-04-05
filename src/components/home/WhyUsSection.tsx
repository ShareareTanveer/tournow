export default function WhyUsSection() {
  const perks = [
    { icon: '🕐', title: '24/7 Support', desc: 'Round-the-clock assistance available until 10 PM. Our team is always just a call away.' },
    { icon: '✂️', title: 'Custom Tailored', desc: 'No cookie-cutter holidays. Every itinerary is crafted specifically for you.' },
    { icon: '💰', title: 'Unbeatable Deals', desc: 'Best prices guaranteed with flexible payment plans. No credit card required.' },
    { icon: '🛡️', title: 'Fully Licensed', desc: 'SLTDA licensed, certified by Civil Aviation Authority. Fully bonded and insured.' },
    { icon: '🌍', title: '50+ Destinations', desc: 'From Southeast Asia to Europe, Middle East to Africa — we cover it all.' },
    { icon: '💳', title: 'Flexible Payments', desc: 'Pay via credit/debit card, bank transfer, or easy installment plans.' },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why Choose <span style={{ color: 'var(--brand)' }}>Halo Holidays?</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">We are more than just a travel agency — we are your holiday partners</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((perk) => (
            <div key={perk.title} className="flex gap-4 p-6 rounded-2xl bg-gray-50 hover:bg-[var(--brand-light)] transition-colors group">
              <div className="text-3xl flex-shrink-0">{perk.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-[var(--brand)] transition-colors">{perk.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment partners */}
        <div className="mt-14 text-center">
          <p className="text-sm text-gray-400 mb-5 uppercase tracking-wider font-medium">Our Banking Partners</p>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {['Standard Chartered', 'NTB', 'HSBC', 'Seylan Bank', 'NDB'].map((bank) => (
              <span key={bank} className="text-sm font-semibold text-gray-400 bg-gray-100 px-4 py-2 rounded-lg">{bank}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import {
  FiClock,
  FiScissors,
  FiDollarSign,
  FiShield,
  FiGlobe,
  FiCreditCard,
} from 'react-icons/fi'

const PERKS = [
  {
    icon: FiClock,
    title: '24/7 Support',
    desc: 'Round-the-clock assistance available until 10 PM. Our team is always just a call away.',
    color: 'from-blue-500 to-blue-700',
  },
  {
    icon: FiScissors,
    title: 'Custom Tailored',
    desc: 'No cookie-cutter holidays. Every itinerary is crafted specifically for you.',
    color: 'from-purple-500 to-purple-700',
  },
  {
    icon: FiDollarSign,
    title: 'Unbeatable Deals',
    desc: 'Best prices guaranteed with flexible payment plans. No credit card required.',
    color: 'from-green-500 to-emerald-700',
  },
  {
    icon: FiShield,
    title: 'Fully Licensed',
    desc: 'SLTDA licensed, certified by Civil Aviation Authority. Fully bonded and insured.',
    color: 'from-[#0a83f5] to-[#d97706]',
  },
  {
    icon: FiGlobe,
    title: '50+ Destinations',
    desc: 'From Southeast Asia to Europe, Middle East to Africa — we cover it all.',
    color: 'from-[#0d9488] to-[#0f766e]',
  },
  {
    icon: FiCreditCard,
    title: 'Flexible Payments',
    desc: 'Pay via credit/debit card, bank transfer, or easy installment plans.',
    color: 'from-rose-500 to-rose-700',
  },
]

export default function WhyUsSection() {
  return (
    <section className="py-24 bg-[#0f172a] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#0a83f5]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#0d9488]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white/5 text-[#0a83f5] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full border border-white/10 mb-4">
            Why Metro Voyage
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Your Journey, Our Passion
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base">
            We are more than just a travel agency — we are your dedicated holiday partners
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PERKS.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="group flex gap-4 p-6 rounded-2xl bg-white/5 hover:bg-white/8 border border-white/8 hover:border-[#0a83f5]/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1.5 group-hover:text-[#0a83f5] transition-colors">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Banking partners */}
        <div className="mt-16 text-center">
          <p className="text-xs text-gray-600 mb-5 uppercase tracking-widest font-bold">Our Banking Partners</p>
          <div className="flex flex-wrap justify-center gap-3 items-center">
            {['Standard Chartered', 'NTB', 'HSBC', 'Seylan Bank', 'NDB'].map((bank) => (
              <span
                key={bank}
                className="text-xs font-semibold text-gray-500 bg-white/5 border border-white/8 px-4 py-2 rounded-xl"
              >
                {bank}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

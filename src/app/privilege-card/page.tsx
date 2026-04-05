import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import LoyaltyRegisterForm from './LoyaltyRegisterForm'

export const metadata: Metadata = {
  title: 'Privilege – Holiday Loyalty Points Program',
  description: 'Earn exclusive rewards every time you travel with Halo Holidays. Register for the Privilege Card loyalty program.',
}

async function getLoyaltySettings(): Promise<Record<string, string>> {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { startsWith: 'loyalty_' } },
    })
    const map: Record<string, string> = {}
    settings.forEach((s) => { map[s.key] = s.value })
    return map
  } catch {
    return {}
  }
}

// Defaults used if DB not connected yet
const DEFAULTS: Record<string, string> = {
  loyalty_hero_badge: 'EXCLUSIVE REWARDS',
  loyalty_hero_title: 'Privilege – Holiday Loyalty Points Program',
  loyalty_hero_subtitle: 'Earn exclusive rewards every time you travel with us',
  loyalty_hero_description: 'Book once, register, and start earning points on every future holiday booking. Redeem your points for discounts, free upgrades, tours, and other premium perks.',
  loyalty_cta_label: 'Register Now',
  loyalty_how_step1_title: 'Book a Holiday',
  loyalty_how_step1_desc: 'Make your first holiday package purchase with Halo Holidays.',
  loyalty_how_step2_title: 'Register for Privilege',
  loyalty_how_step2_desc: 'Complete your registration after your first booking to join the program.',
  loyalty_how_step3_title: 'Earn & Redeem',
  loyalty_how_step3_desc: 'Accumulate points on future bookings and redeem for discounts, upgrades, and more.',
  loyalty_eligibility_note: 'You must have booked at least one holiday package with us before registering for the Privilege Card.',
  loyalty_terms_eligibility: 'The Privilege Card is available to customers who have completed at least one holiday booking with Halo Holidays.',
  loyalty_terms_points: 'Points are earned on the net package price, excluding taxes, visa fees, and third-party surcharges.',
  loyalty_terms_redemption: 'Points may be redeemed for discounts on future bookings, complimentary upgrades, or excursions. Minimum redemption threshold applies.',
  loyalty_terms_validity: 'Points are valid for 24 months from the date of issue. Expired points cannot be reinstated.',
  loyalty_terms_modification: 'Halo Holidays reserves the right to modify, suspend, or terminate the Privilege Card program at any time with reasonable notice.',
  loyalty_terms_liability: 'Halo Holidays is not liable for any loss resulting from the use or inability to use earned points.',
}

export default async function PrivilegeCardPage() {
  const raw = await getLoyaltySettings()
  const s = { ...DEFAULTS, ...raw }

  const steps = [
    { num: '01', title: s.loyalty_how_step1_title, desc: s.loyalty_how_step1_desc },
    { num: '02', title: s.loyalty_how_step2_title, desc: s.loyalty_how_step2_desc },
    { num: '03', title: s.loyalty_how_step3_title, desc: s.loyalty_how_step3_desc },
  ]

  const terms = [
    { label: 'Eligibility', text: s.loyalty_terms_eligibility },
    { label: 'Points Accrual', text: s.loyalty_terms_points },
    { label: 'Redemption', text: s.loyalty_terms_redemption },
    { label: 'Validity', text: s.loyalty_terms_validity },
    { label: 'Modifications', text: s.loyalty_terms_modification },
    { label: 'Liability', text: s.loyalty_terms_liability },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-pink-50 to-white py-16 px-4 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e91e8c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-pink-600 bg-pink-100 px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              🎁 {s.loyalty_hero_badge}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {s.loyalty_hero_title}
            </h1>
            <p className="text-gray-500 font-medium mb-4">{s.loyalty_hero_subtitle}</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">{s.loyalty_hero_description}</p>
            <a
              href="#register-form"
              className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold px-7 py-3.5 rounded-full transition-colors shadow-lg shadow-pink-200"
            >
              {s.loyalty_cta_label}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Right: Card visual */}
          <div className="relative flex items-center justify-center">
            {/* Back card */}
            <div className="absolute -left-4 top-6 w-72 h-44 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl shadow-2xl rotate-6 opacity-60" />
            {/* Front card */}
            <div className="relative w-72 h-44 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden z-10">
              {/* Card shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
              {/* Card content */}
              <div className="p-5 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-pink-400 font-bold text-sm tracking-wider">+halo holidays</p>
                    <p className="text-white/60 text-xs italic mt-0.5">Privilege</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                    <span className="text-pink-400 text-xs font-bold">CH</span>
                  </div>
                </div>

                {/* Chip */}
                <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md shadow-sm" />

                <div>
                  <p className="text-white font-mono text-sm tracking-widest mb-2">5016 0010 9000 1435</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">Cardholder Name</p>
                      <p className="text-white text-xs font-medium">YOUR NAME</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-[10px]">VALID THRU</p>
                      <p className="text-white text-xs">09/2026</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">CH17</p>
                      <p className="text-white/40 text-[10px]">LOYALTY</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500">Join in three easy steps and start earning exclusive rewards on your next holiday.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-pink-200 via-pink-400 to-pink-200" />

          {steps.map((step, i) => (
            <div key={step.num} className="text-center relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-200 relative z-10">
                <span className="text-white font-bold text-xl">{step.num}</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tiers ────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Membership Tiers</h2>
            <p className="text-gray-500">The more you travel, the more you unlock</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Bronze', color: 'from-amber-600 to-amber-800', bg: 'bg-amber-50', border: 'border-amber-200',
                min: 'Starting tier',
                perks: ['Earn 1 point per LKR 1,000', 'Birthday discount', 'Member newsletter', 'Early deal access'],
              },
              {
                name: 'Silver', color: 'from-gray-400 to-gray-600', bg: 'bg-gray-50', border: 'border-gray-200',
                min: 'From 5,000 points',
                perks: ['Earn 1.5 points per LKR 1,000', 'Priority support', 'Free visa consultation', 'Exclusive member deals', 'Flexible payment priority'],
              },
              {
                name: 'Gold', color: 'from-yellow-400 to-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200',
                min: 'From 15,000 points',
                perks: ['Earn 2 points per LKR 1,000', 'Dedicated travel manager', 'Complimentary upgrades', 'Airport lounge access', 'VIP event invitations', 'Free tour inclusions'],
              },
            ].map((tier) => (
              <div key={tier.name} className={`${tier.bg} rounded-2xl p-6 border ${tier.border} card-hover`}>
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <span className="text-white font-black text-lg">{tier.name[0]}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-1">{tier.name}</h3>
                <p className="text-xs text-gray-400 text-center mb-5">{tier.min}</p>
                <ul className="space-y-2.5">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-pink-500 font-bold mt-0.5 shrink-0">✓</span> {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Registration Form ─────────────────────────────────────────────────── */}
      <section id="register-form" className="py-16 px-4 bg-white scroll-mt-20">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block bg-pink-100 text-pink-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-3">Join Now</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Register for Privilege Card</h2>
            <p className="text-gray-500 text-sm">{s.loyalty_eligibility_note}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
            <LoyaltyRegisterForm ctaLabel={s.loyalty_cta_label} />
          </div>
        </div>
      </section>

      {/* ── Terms & Conditions ────────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Terms & Conditions</h2>
          <div className="space-y-4">
            {terms.map((term, i) => (
              <div key={term.label} className="flex gap-4 bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-sm font-bold text-pink-600 shrink-0 w-6 mt-0.5">{i + 1}.</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm mb-1">{term.label}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{term.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-gradient-to-r from-pink-600 to-pink-800 text-center text-white">
        <h3 className="text-2xl font-bold mb-3">Ready to Start Earning?</h3>
        <p className="text-white/80 mb-6 text-sm">Book your next holiday and unlock exclusive rewards.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#register-form" className="bg-white text-pink-600 font-bold px-8 py-3 rounded-full hover:bg-pink-50 transition-colors">
            Register Now
          </a>
          <Link href="/packages-from-sri-lanka/family" className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
            Browse Packages
          </Link>
        </div>
      </section>
    </div>
  )
}

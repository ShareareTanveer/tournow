import Link from 'next/link'
import { FiAward, FiGift, FiTrendingUp, FiStar, FiArrowRight } from 'react-icons/fi'

const TIERS = [
  { name: 'Bronze', min: 0, max: 999, color: '#cd7f32', bg: '#fdf3e7', desc: 'Welcome bonus points on every booking' },
  { name: 'Silver', min: 1000, max: 4999, color: '#94a3b8', bg: '#f8fafc', desc: 'Priority support + exclusive discounts' },
  { name: 'Gold', min: 5000, max: null, color: '#f59e0b', bg: '#fffbeb', desc: 'VIP perks, lounge access & concierge' },
]

const STEPS = [
  { icon: FiGift, title: 'Register Free', desc: 'Sign up for your Metro Voyage Privilege Card — takes 60 seconds.', color: '#0d9488' },
  { icon: FiTrendingUp, title: 'Earn Points', desc: 'Get reward points on every booking, referral, and review.', color: '#f59e0b' },
  { icon: FiStar, title: 'Unlock Perks', desc: 'Redeem points for discounts, upgrades, and exclusive benefits.', color: '#6366f1' },
]

export default function LoyaltySection() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'var(--light)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ background: 'var(--brand)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl" style={{ background: 'var(--teal)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <FiAward size={12} /> Privilege Card
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-black mb-4">
            Travel More. <span style={{ color: 'var(--brand)' }}>Earn More.</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">
            Join thousands of Metro Voyage members enjoying exclusive rewards, priority service, and VIP benefits.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `${step.color}22` }}>
                <step.icon size={24} style={{ color: step.color }} />
              </div>
              <div className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mx-auto mb-3 text-white"
                style={{ background: step.color }}>
                {i + 1}
              </div>
              <h3 className="font-bold text-white mb-2"  style={{ color: step.color }}>{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {TIERS.map((tier) => (
            <div key={tier.name}
              className="p-5 rounded-2xl border transition-all hover:scale-[1.02] duration-300"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: `${tier.color}40` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${tier.color}20` }}>
                  <FiAward size={18} style={{ color: tier.color }} />
                </div>
                <div>
                  <p className="font-bold"  style={{ color: tier.color }}>{tier.name}</p>
                  <p className="text-[10px] text-gray-600">
                    {tier.min.toLocaleString()}+ pts{tier.max ? ` – ${tier.max.toLocaleString()} pts` : ''}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{tier.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/privilege-card"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:shadow-2xl hover:scale-105 text-sm"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
            Get Your Privilege Card — It's Free
            <FiArrowRight size={16} />
          </Link>
          <p className="text-gray-600 text-xs mt-3">No credit card required. Instant registration.</p>
        </div>
      </div>
    </section>
  )
}

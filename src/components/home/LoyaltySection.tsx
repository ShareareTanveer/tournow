'use client'

import Link from 'next/link'
import { FiAward, FiGift, FiTrendingUp, FiStar, FiArrowRight, FiCheck } from 'react-icons/fi'
import SectionTag from '@/components/ui/SectionTag'

const TIERS = [
  {
    name: 'Bronze', pts: '0 - 999 pts', color: '#b85c38',
    glow: 'rgba(205,127,50,0.20)',
    perks: ['Welcome bonus points', 'Birthday discount', 'Member newsletter'],
  },
  {
    name: 'Silver', pts: '1,000 - 4,999 pts', color: '#64748b',
    glow: 'rgba(100,116,139,0.20)',
    perks: ['Priority support', '5% exclusive discount', 'Early access to deals'],
  },
  {
    name: 'Gold', pts: '5,000+ pts', color: '#007f89',
    glow: 'rgba(0,173,181,0.25)',
    perks: ['VIP concierge service', 'Lounge access', 'Complimentary upgrades'],
  },
]

const STEPS = [
  { icon: FiGift,       step: '01', title: 'Register Free', desc: 'Sign up for your Privilege Card in 60 seconds.',  color: '#007f89' },
  { icon: FiTrendingUp, step: '02', title: 'Earn Points',   desc: 'Earn on every booking, referral, and review.',    color: '#3f8f64' },
  { icon: FiStar,       step: '03', title: 'Unlock Perks',  desc: 'Redeem for discounts, upgrades & VIP benefits.',  color: '#c99a45' },
]

export default function LoyaltySection() {
  return (
    <section className="relative overflow-hidden bg-[#f4efe6] py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-16">
          <SectionTag className="mx-auto mb-5">
            <FiAward size={11} /> Privilege Card
          </SectionTag>
          <h2 className="text-3xl sm:text-5xl font-black text-[#101817] leading-tight mb-4">
            Travel More.
            <span className="gradient-text block sm:inline sm:ml-3">Earn More.</span>
          </h2>
          <p className="text-[#52615d] max-w-md mx-auto text-sm leading-relaxed">
            Join thousands of Metro Voyage members enjoying exclusive rewards, priority service, and VIP benefits on every trip.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {STEPS.map((step, i) => (
            <div key={i} className="relative p-6 rounded-lg bg-white border border-[#e5ded1] shadow-sm group hover:shadow-md hover:border-[#d6cab8] transition-all duration-300">
              <div className="text-[10px] font-black tracking-widest mb-4 font-mono"
                style={{ color: step.color }}>
                {step.step}
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
                style={{ background: `${step.color}18` }}>
                <step.icon size={22} style={{ color: step.color }} />
              </div>
              <h3 className="font-bold text-[#101817] text-base mb-1.5">{step.title}</h3>
              <p className="text-sm text-[#52615d] leading-relaxed">{step.desc}</p>

              {i < 2 && (
                <div className="hidden sm:block absolute top-1/2 -right-2 w-4 h-px bg-[#d6cab8]" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {TIERS.map((tier, i) => (
            <div
              key={tier.name}
              className="relative p-6 rounded-lg bg-white border transition-all hover:-translate-y-1 group"
              style={{
                borderColor: `${tier.color}35`,
                boxShadow: i === 2 ? `0 4px 30px ${tier.glow}` : '0 2px 12px rgba(0,0,0,0.05)',
                transition: 'transform 0.35s cubic-bezier(.34,1.56,.64,1), box-shadow 0.35s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 50px ${tier.glow}` }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = i === 2 ? `0 4px 30px ${tier.glow}` : '0 2px 12px rgba(0,0,0,0.05)' }}
            >
              {i === 2 && (
                <div className="absolute top-4 right-4">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #007f89, #3f8f64)' }}>
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${tier.color}15` }}>
                  <FiAward size={18} style={{ color: tier.color }} />
                </div>
                <div>
                  <p className="font-black text-[#101817]">{tier.name}</p>
                  <p className="text-[10px] font-semibold" style={{ color: tier.color }}>{tier.pts}</p>
                </div>
              </div>

              <ul className="space-y-2">
                {tier.perks.map(perk => (
                  <li key={perk} className="flex items-center gap-2 text-xs text-[#52615d]">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${tier.color}15` }}>
                      <FiCheck size={9} style={{ color: tier.color }} />
                    </div>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/privilege-card"
            className="inline-flex items-center gap-2.5 text-white font-black px-8 py-4 rounded-lg transition-all hover:-translate-y-0.5 text-sm"
            style={{
              background: 'linear-gradient(135deg, #007f89, #3f8f64)',
              boxShadow: '0 16px 40px rgba(0,127,137,0.25)',
            }}
          >
            Get Your Privilege Card - It&apos;s Free
            <FiArrowRight size={16} />
          </Link>
          <p className="text-[#7a8681] text-xs mt-3 font-medium">No credit card required · Instant registration</p>
        </div>
      </div>
    </section>
  )
}

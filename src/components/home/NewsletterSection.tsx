"use client";

import { useState } from "react";
import { FiMail, FiPhone, FiSend, FiCheckCircle } from "react-icons/fi";
import { MdFlightTakeoff } from "react-icons/md";
import SectionTag from "@/components/ui/SectionTag";

export default function NewsletterSection() {
  const [form, setForm] = useState({ email: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#fbfaf7] py-20 sm:py-24">
      <div className="max-w-5xl mx-auto px-4">
        <div className="overflow-hidden rounded-lg border border-[#e5e8e4] bg-white shadow-[0_22px_70px_rgba(16,24,23,0.08)]">
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #007f89, #c99a45, #3f8f64)' }} />

          <div className="p-8 text-center md:p-14">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-lg text-white"
              style={{ background: 'linear-gradient(135deg, #007f89, #3f8f64)' }}>
              <MdFlightTakeoff size={28} />
            </div>

            <SectionTag className="mx-auto mb-4">
              Stay in the loop
            </SectionTag>

            <h2 className="text-3xl md:text-5xl font-black text-[#101817] leading-tight mb-3">
              Get{" "}
              <span className="gradient-text">Exclusive Travel Deals</span>
            </h2>
            <p className="text-[#52615d] max-w-md mx-auto mb-10 text-sm leading-relaxed">
              Hidden destinations, flash offers, and curated travel experiences straight to your inbox. No spam.
            </p>

            {success ? (
              <div className="max-w-md mx-auto py-6 px-8 rounded-lg border border-[#d8eee9] flex items-center justify-center gap-3 bg-[#edf8f6]">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,127,137,0.15)' }}>
                  <FiCheckCircle size={20} style={{ color: '#007f89' }} />
                </div>
                <div className="text-left">
                  <p className="text-[#101817] font-bold text-sm">You&apos;re in!</p>
                  <p className="text-[#52615d] text-xs mt-0.5">Check your inbox for the best deals.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <FiMail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a9691]" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3.5 rounded-lg text-sm text-[#101817] placeholder-[#9ca7a2] outline-none transition-all bg-[#fbfaf7] border border-[#d8ded9]"
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,127,137,0.6)'; e.currentTarget.style.background = '#fff' }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#d8ded9'; e.currentTarget.style.background = '#fbfaf7' }}
                    />
                  </div>

                  <div className="relative">
                    <FiPhone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a9691]" />
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="WhatsApp (optional)"
                      className="w-full pl-10 pr-4 py-3.5 rounded-lg text-sm text-[#101817] placeholder-[#9ca7a2] outline-none transition-all bg-[#fbfaf7] border border-[#d8ded9]"
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,127,137,0.6)'; e.currentTarget.style.background = '#fff' }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#d8ded9'; e.currentTarget.style.background = '#fbfaf7' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2.5 text-white font-black px-8 py-3.5 rounded-lg transition-all hover:-translate-y-0.5 disabled:opacity-60 text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #007f89, #3f8f64)',
                    boxShadow: '0 12px 30px rgba(0,127,137,0.24)',
                  }}
                >
                  {loading ? "Subscribing..." : (<>Get Deals Now <FiSend size={14} /></>)}
                </button>

                <p className="text-[#8a9691] text-xs">
                  No spam · Unsubscribe anytime · 100% free
                </p>
              </form>
            )}

            <div className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-[#edf0ed]">
              {[
                { n: '5,000+', l: 'Subscribers' },
                { n: 'Weekly', l: 'Deal Alerts' },
                { n: '100%', l: 'Free Forever' },
              ].map(({ n, l }) => (
                <div key={l} className="text-center">
                  <p className="text-[#101817] font-black text-base">{n}</p>
                  <p className="text-[#8a9691] text-[10px] font-medium mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

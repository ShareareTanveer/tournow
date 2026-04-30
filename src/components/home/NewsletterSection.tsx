"use client";

import { useState } from "react";
import { FiMail, FiPhone, FiSend, FiCheckCircle } from "react-icons/fi";
import { MdFlightTakeoff } from "react-icons/md";

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
    <section
      className="relative py-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--background), var(--brandLight))",
      }}
    >
      {/* Glow */}
      <div
        className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-30"
        style={{ background: "var(--brand)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-30"
        style={{ background: "var(--teal)" }}
      />

      <div className="relative max-w-5xl mx-auto px-4">
        <div
          className="rounded-[28px] p-8 md:p-12 text-center "
          style={{
            background: "rgba(255,255,255,0.8)",
            borderColor: "var(--brandMuted)",
          }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl text-white text-2xl shadow-md"
            style={{
              background: "linear-gradient(135deg, var(--brand), var(--teal))",
            }}
          >
            <MdFlightTakeoff size={28} />
          </div>

          {/* Heading */}
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
            style={{ color: "var(--foreground)" }}
          >
            Get{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--brand), var(--teal))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Exclusive Travel Deals
            </span>
          </h2>

          <p
            className="max-w-xl mx-auto mb-10"
            style={{ color: "var(--darkMuted)" }}
          >
            Discover hidden destinations, flash offers, and curated travel
            experiences — straight to your inbox.
          </p>

          {success ? (
            <div
              className="rounded-2xl p-6 border flex items-center justify-center gap-3"
              style={{
                background: "var(--brandLight)",
                borderColor: "var(--brand)",
                color: "var(--brandDark)",
              }}
            >
              <FiCheckCircle size={22} />
              <span className="text-lg font-medium">
                You’re subscribed! Check your inbox for deals.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="relative">
                  <FiMail
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--darkMuted)" }}
                  />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition"
                    style={{
                      background: "#fff",
                      color: "var(--foreground)",
                      border: "1px solid var(--brandMuted)",
                    }}
                  />
                </div>

                {/* WhatsApp */}
                <div className="relative">
                  <FiPhone
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--darkMuted)" }}
                  />
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(e) =>
                      setForm({ ...form, whatsapp: e.target.value })
                    }
                    placeholder="WhatsApp (optional)"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition"
                    style={{
                      background: "#fff",
                      color: "var(--foreground)",
                      border: "1px solid var(--brandMuted)",
                    }}
                  />
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                  className="mx-auto flex items-center justify-center gap-2 text-white text-sm font-bold px-5 py-3.5 rounded-xl transition-all"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand), var(--brand-dark))",
                boxShadow: "0 4px 20px",
              }}
              >
                {loading ? "Subscribing..." : "Get Deals Now"}
                <FiSend className="transition-transform group-hover:translate-x-1" />
              </button>

              <p className="text-xs" style={{ color: "var(--darkMuted)" }}>
                No spam. Only premium travel deals
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
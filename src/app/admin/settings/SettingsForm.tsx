'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function g(settings: Record<string, string>, key: string, fallback = '') {
  return settings[key] ?? fallback
}

export default function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const router = useRouter()
  const [form, setForm] = useState({
    // Hero
    hero_image: g(settings, 'hero_image', 'https://picsum.photos/seed/hero-travel/1920/1080'),
    // Contact info
    contact_phone: g(settings, 'contact_phone', '+94 11 234 5678'),
    contact_email: g(settings, 'contact_email', 'info@metrovoyage.com'),
    contact_whatsapp: g(settings, 'contact_whatsapp', '+94 77 123 4567'),
    contact_address: g(settings, 'contact_address', 'No. 1, Galle Road, Colombo 03, Sri Lanka'),
    // Social links
    social_facebook: g(settings, 'social_facebook'),
    social_instagram: g(settings, 'social_instagram'),
    social_youtube: g(settings, 'social_youtube'),
    social_tiktok: g(settings, 'social_tiktok'),
    // SEO
    robots_disallow: g(settings, 'robots_disallow', ''),
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'general' | 'contact' | 'social' | 'theme' | 'seo'>('general')

  // Theme fields parsed from JSON
  const [theme, setTheme] = useState(() => {
    try { return JSON.parse(settings.theme || '{}') } catch { return {} }
  })
  function tc(key: string, label: string, defaultVal: string) {
    const val = theme[key] ?? defaultVal
    return (
      <div className="flex items-center gap-3">
        <input type="color" value={val}
          onChange={e => setTheme((t: any) => ({ ...t, [key]: e.target.value }))}
          className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
        <div>
          <p className="text-xs font-semibold text-gray-600">{label}</p>
          <p className="text-xs text-gray-400 font-mono">{val}</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, theme: JSON.stringify(theme) }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
    router.refresh()
  }

  const inp = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <input type={type} value={form[key]} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
    </div>
  )

  const area = (key: keyof typeof form, label: string, rows = 3, hint = '') => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      <textarea rows={rows} value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
    </div>
  )

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Social' },
    { id: 'theme', label: 'Theme Colors' },
    { id: 'seo', label: 'SEO / Robots' },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id as any)}
            className={`flex-1 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all min-w-24 ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        {tab === 'general' && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Homepage Hero</p>
            {inp('hero_image', 'Hero Background Image URL', 'url', 'https://…')}
            {form.hero_image && (
              <img src={form.hero_image} alt="Hero preview" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
            )}
          </>
        )}

        {tab === 'contact' && (
          <>
            {inp('contact_phone', 'Phone Number')}
            {inp('contact_email', 'Email Address', 'email')}
            {inp('contact_whatsapp', 'WhatsApp Number')}
            {area('contact_address', 'Office Address', 2)}
          </>
        )}

        {tab === 'social' && (
          <>
            {inp('social_facebook', 'Facebook URL', 'url', 'https://facebook.com/…')}
            {inp('social_instagram', 'Instagram URL', 'url', 'https://instagram.com/…')}
            {inp('social_youtube', 'YouTube URL', 'url', 'https://youtube.com/…')}
            {inp('social_tiktok', 'TikTok URL', 'url', 'https://tiktok.com/…')}
          </>
        )}

        {tab === 'seo' && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Robots.txt — Additional Disallow Rules</p>
              <p className="text-xs text-gray-400 mb-3">
                One path per line. These are added on top of the default blocked paths (<code className="bg-gray-100 px-1 rounded">/admin/</code>, <code className="bg-gray-100 px-1 rounded">/api/</code>, <code className="bg-gray-100 px-1 rounded">/my/</code>).<br />
                Example: <code className="bg-gray-100 px-1 rounded">/internal-promo/</code>
              </p>
              <textarea
                rows={8}
                value={form.robots_disallow}
                onChange={(e) => setForm({ ...form, robots_disallow: e.target.value })}
                placeholder={'/internal-promo/\n/draft-pages/'}
                className="w-full font-mono text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 resize-none"
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">Live sitemap & robots.txt</p>
              <p className="text-xs text-amber-600">
                After saving, your sitemap is available at <code className="bg-amber-100 px-1 rounded">/sitemap.xml</code> and robots.txt at <code className="bg-amber-100 px-1 rounded">/robots.txt</code>.
                Changes to disallow rules take effect on next request (no restart needed).
              </p>
            </div>
          </div>
        )}

        {tab === 'theme' && (
          <div className="space-y-6">
            <p className="text-xs text-gray-400">Changes apply site-wide on next page load. Colors update in the browser immediately after saving.</p>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Brand (Primary)</p>
              <div className="grid grid-cols-2 gap-4">
                {tc('brand', 'Brand Color', '#0a83f5')}
                {tc('brandDark', 'Brand Dark', '#d97706')}
                {tc('brandLight', 'Brand Light BG', '#fffbeb')}
                {tc('brandMuted', 'Brand Muted BG', '#fef3c7')}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Accent (Teal)</p>
              <div className="grid grid-cols-2 gap-4">
                {tc('teal', 'Teal', '#0d9488')}
                {tc('tealDark', 'Teal Dark', '#0f766e')}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Dark Tones</p>
              <div className="grid grid-cols-2 gap-4">
                {tc('dark', 'Dark BG', '#0f172a')}
                {tc('darkMuted', 'Dark Muted', '#1e293b')}
                {tc('navy', 'Navy', '#1e3a5f')}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Base</p>
              <div className="grid grid-cols-2 gap-4">
                {tc('background', 'Page Background', '#ffffff')}
                {tc('foreground', 'Body Text', '#1e293b')}
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">Raw JSON (advanced)</p>
              <textarea
                value={JSON.stringify(theme, null, 2)}
                onChange={e => { try { setTheme(JSON.parse(e.target.value)) } catch {} }}
                rows={8}
                className="w-full font-mono text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={loading} className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm shadow-indigo-200">
          {loading ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
            ✓ Saved successfully
          </span>
        )}
      </div>
    </form>
  )
}

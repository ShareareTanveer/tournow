import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cookie Policy' }

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="brand-gradient py-12 px-4 text-center text-white">
        <h1 className="text-3xl font-bold">Cookie Policy</h1>
        <p className="text-white/70 mt-2 text-sm">Last updated: June 2025</p>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 prose prose-gray max-w-none text-gray-600 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-800">What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better browsing experience and understand how you use our site.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-800">How We Use Cookies</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Analytics:</strong> We track user activity and gather insights to improve our website using Google Analytics.</li>
              <li><strong>Preferences:</strong> We remember your language, location, and personalized settings.</li>
              <li><strong>Marketing:</strong> We use cookies to optimize campaigns and retarget relevant ads.</li>
              <li><strong>Session Management:</strong> Cookies enable login, form submissions, and consultation requests.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-800">Managing Cookies</h2>
            <p>You can control cookies through your browser settings. You may accept, reject, or delete cookies at any time. Note that disabling certain cookies may limit some website functionality.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-800">Third-Party Services</h2>
            <p>We use Google Analytics and advertising networks that may place their own cookies. These are governed by their respective privacy policies.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-800">Contact</h2>
            <p>Questions? Email <a href="mailto:contact@haloholidays.lk" className="text-[var(--brand)]">contact@haloholidays.lk</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}

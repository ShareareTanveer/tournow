'use client'

import { FaWhatsapp } from 'react-icons/fa'

export default function WhatsAppButton() {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace('+', '') ?? '94704545455'
  return (
    <a
      href={`https://wa.me/${num}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 group hidden items-center gap-2.5 rounded-lg px-4 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 sm:flex"
      style={{
        background: '#25d366',
        boxShadow: '0 8px 30px rgba(37,211,102,0.45)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 16px 40px rgba(37,211,102,0.55)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 30px rgba(37,211,102,0.45)' }}
    >
      <FaWhatsapp size={22} />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs">
        Chat with us
      </span>
    </a>
  )
}

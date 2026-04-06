'use client'

import { FaWhatsapp } from 'react-icons/fa'

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace('+', '') ?? '94704545455'}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-semibold text-sm px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-200 hover:-translate-y-1 group"
    >
      <FaWhatsapp size={22} />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        Chat with us
      </span>
    </a>
  )
}

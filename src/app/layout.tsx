import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Halo Holidays – Your Dream Holiday Starts Here',
    template: '%s | Halo Holidays',
  },
  description:
    'Halo Holidays crafts personalized travel packages from Sri Lanka. Family, honeymoon, solo, squad & corporate packages to 50+ countries. SLTDA licensed.',
  keywords: ['travel packages Sri Lanka', 'holiday packages', 'honeymoon packages', 'family tours', 'Dubai tours Sri Lanka'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.haloholidays.lk',
    siteName: 'Halo Holidays',
    title: 'Halo Holidays – Your Dream Holiday Starts Here',
    description: 'Personalized travel packages from Sri Lanka to 50+ destinations worldwide.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-white`}>
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
